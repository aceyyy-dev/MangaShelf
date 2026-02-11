import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../StoreContext';
import ImageCropper from '../components/ImageCropper';
import { formatSubscriptionExpiry, getSubscriptionDisplayName, getSubscriptionPrice } from '../utils/subscription';
import { restorePurchases } from '../services/revenuecat';
import { Capacitor } from '@capacitor/core';

type ProfileView = 'favorites' | 'wishlist' | 'backup' | 'notifications' | 'export' | 'editProfile' | null;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { series, volumes, restoreData, userProfile, updateUserProfile, isUsernameTaken, logout } = useStore();
  const [activeView, setActiveView] = useState<ProfileView>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isGuest = userProfile.username === 'guest';

  // Derived Stats Calculation
  const favoriteCount = volumes.filter(v => v.isFavorite).length;
  const wishlistCount = volumes.filter(v => v.isInWishlist).length;
  const ownedVolumesCount = volumes.filter(v => v.isOwned).length;
  
  // % Read of OWNED volumes
  const readOwnedVolumesCount = volumes.filter(v => v.isOwned && v.readStatus === 'Read').length;
  const percentageReadOwned = ownedVolumesCount > 0 
      ? Math.round((readOwnedVolumesCount / ownedVolumesCount) * 100) 
      : 0;

  // --- Edit Profile State ---
  const [editForm, setEditForm] = useState({
      name: '',
      username: '',
      avatarUrl: ''
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Cropper State
  const [cropperImage, setCropperImage] = useState<string | null>(null);

  // Subscription State
  const [restoring, setRestoring] = useState(false);
  const isPremium = userProfile.subscriptionStatus === 'premium';
  const isNative = Capacitor.isNativePlatform();

  // Load current profile into edit form when view opens
  useEffect(() => {
      if (activeView === 'editProfile') {
          setEditForm({
              name: userProfile.name,
              username: userProfile.username,
              avatarUrl: userProfile.avatarUrl
          });
          setUsernameError(null);
          setSaveStatus('idle');
      }
  }, [activeView, userProfile]);

  const handleEditProfileClick = () => {
      if (isGuest) {
          navigate('/login');
          return;
      }
      setActiveView('editProfile');
  };

  const handleUpgradeClick = () => {
      if (isGuest) {
          navigate('/login');
          return;
      }
      navigate('/paywall');
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.success && result.isPremium) {
        alert('Purchases restored successfully!');
        window.location.reload();
      } else {
        alert('No active subscriptions found');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  const handleManageSubscription = () => {
    if (!isNative) {
      alert('Subscription management is only available in the mobile app');
      return;
    }

    const platform = Capacitor.getPlatform();
    if (platform === 'ios') {
      window.open('https://apps.apple.com/account/subscriptions', '_blank');
    } else if (platform === 'android') {
      window.open('https://play.google.com/store/account/subscriptions', '_blank');
    }
  };

  const getDaysWaitAndDate = () => {
      if (!userProfile.lastUsernameChange) return { days: 0, date: null };
      
      const lastChange = new Date(userProfile.lastUsernameChange);
      const nextChange = new Date(lastChange);
      nextChange.setDate(lastChange.getDate() + 30);
      
      const now = new Date();
      
      if (now >= nextChange) return { days: 0, date: null };
      
      const diffTime = Math.abs(nextChange.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return { 
          days: diffDays, 
          date: nextChange.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
      };
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  setCropperImage(reader.result);
              }
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  const handleCropComplete = (croppedUrl: string) => {
      setEditForm(prev => ({ ...prev, avatarUrl: croppedUrl }));
      setCropperImage(null);
  };

  const handleLogout = () => {
      logout();
      // Stay on profile page, but now in Guest mode
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = () => {
      setSaveStatus('saving');
      setUsernameError(null);

      // 1. Username Validation
      const cleanUsername = editForm.username.trim();
      const isUsernameChanged = cleanUsername !== userProfile.username;

      if (isUsernameChanged) {
          // Check 30 Day Limit
          const { days, date } = getDaysWaitAndDate();
          if (days > 0) {
              setUsernameError(`You can't change your username until ${date}.`);
              setSaveStatus('idle');
              return;
          }

          // Check format
          if (cleanUsername.length < 3) {
              setUsernameError("Username must be at least 3 characters.");
              setSaveStatus('idle');
              return;
          }

          if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
              setUsernameError("Only letters, numbers, and underscores allowed.");
              setSaveStatus('idle');
              return;
          }

          // Check Uniqueness
          if (isUsernameTaken(cleanUsername)) {
              setUsernameError("This username is already taken.");
              setSaveStatus('idle');
              return;
          }
      }

      // 2. Perform Update
      setTimeout(() => { // Simulate API latency
          updateUserProfile({
              name: editForm.name,
              avatarUrl: editForm.avatarUrl,
              username: cleanUsername,
              lastUsernameChange: isUsernameChanged ? new Date().toISOString() : userProfile.lastUsernameChange
          });
          setSaveStatus('success');
          setTimeout(() => setActiveView(null), 1000); // Close after success
      }, 800);
  };

  // --- Notification State & Logic ---
  const [notifSettings, setNotifSettings] = useState({
    releases: true,
    prices: false,
    reminders: true,
    weekly: false,
    updates: true
  });
  
  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({...prev, [key]: !prev[key]}));
  };

  // --- Backup & Restore Logic ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState("2 hours ago");
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          setLastSynced("Just now");
      }, 2000);
  };

  const handleCreateLocalBackup = () => {
      handleExportJSON();
  };

  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.series && json.volumes) {
                  restoreData(json);
                  setRestoreStatus("Success! Data restored.");
                  setTimeout(() => setRestoreStatus(null), 3000);
              } else {
                  setRestoreStatus("Error: Invalid backup file.");
              }
          } catch (err) {
              setRestoreStatus("Error: Could not parse file.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  // --- Export Logic ---
  const handleExportCSV = () => {
      // Implementation placeholder to match existing code structure
      const csvContent = "data:text/csv;charset=utf-8,Demo CSV";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "mangashelf.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportJSON = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ series, volumes }, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      link.setAttribute("download", "mangashelf.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const getSeriesTitle = (seriesId: string) => series.find(s => s.id === seriesId)?.title || 'Unknown Series';

  const getHeaderTitle = () => {
    switch(activeView) {
      case 'favorites': return 'Favorites';
      case 'wishlist': return 'Wishlist';
      case 'backup': return 'Backup & Restore';
      case 'notifications': return 'Notifications';
      case 'export': return 'Export Data';
      case 'editProfile': return 'Edit Profile';
      default: return '';
    }
  };

  const renderContent = () => {
    if (activeView === 'editProfile') {
        const { days: daysToWait, date: nextDate } = getDaysWaitAndDate();
        
        return (
            <div className="p-6 space-y-8">
                 <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary via-blue-500 to-cyan-400">
                             <Avatar src={editForm.avatarUrl} size="2xl" className="border-4 border-background-light dark:border-background-dark group-hover:opacity-80 transition-opacity" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icon name="camera_alt" className="text-white text-xl" />
                            </div>
                        </div>
                    </div>
                    <button onClick={() => avatarInputRef.current?.click()} className="mt-3 text-sm font-semibold text-primary hover:text-primary/80">Change Photo</button>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />
                 </div>

                 <div className="space-y-5">
                     <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Display Name</label>
                         <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Your Name" />
                     </div>
                     <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Username</label>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">@</span>
                            <input 
                                type="text" 
                                value={editForm.username} 
                                onChange={(e) => setEditForm({...editForm, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '')})} 
                                disabled={daysToWait > 0} 
                                className={`w-full bg-white dark:bg-surface-dark border rounded-xl pl-9 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${usernameError ? 'border-red-500 focus:ring-red-500/30' : 'border-slate-200 dark:border-slate-800 focus:ring-primary/50 focus:border-primary'} ${daysToWait > 0 ? 'opacity-60 cursor-not-allowed text-slate-500' : ''}`} 
                                placeholder="username" 
                            />
                         </div>
                         {usernameError && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><Icon name="error" className="text-sm" /> {usernameError}</p>}
                         
                         {/* Username Change Rule Info */}
                         {!usernameError && (
                             <div className={`rounded-lg p-3 border ${daysToWait > 0 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                                 <div className="flex items-start gap-1.5">
                                     <Icon name={daysToWait > 0 ? "lock_clock" : "info"} className={`text-sm flex-shrink-0 mt-0.5 ${daysToWait > 0 ? 'text-yellow-700 dark:text-yellow-400' : 'text-slate-400'}`} />
                                     <div className="text-xs leading-tight">
                                         <p className={daysToWait > 0 ? 'text-yellow-700 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'}>
                                             Usernames can only be changed once every 30 days.
                                         </p>
                                         {daysToWait > 0 && (
                                             <p className="mt-1 font-bold text-yellow-800 dark:text-yellow-300">
                                                 Next change available: {nextDate}
                                             </p>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
                 <div className="pt-4">
                     <button onClick={handleSaveProfile} disabled={saveStatus === 'saving' || !editForm.name.trim() || !editForm.username.trim()} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${saveStatus === 'success' ? 'bg-green-500' : 'bg-primary hover:bg-blue-600 active:bg-blue-700'}`}>
                         {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                         {saveStatus === 'success' ? 'Saved Successfully!' : 'Save Changes'}
                     </button>
                 </div>
            </div>
        );
    }

    if (activeView === 'favorites' || activeView === 'wishlist') {
        const items = activeView === 'favorites' ? volumes.filter(v => v.isFavorite) : volumes.filter(v => v.isInWishlist);
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-center px-6">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Icon name={activeView === 'favorites' ? 'favorite_border' : 'shopping_cart'} className="text-4xl text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Your list is empty</p>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">Go to your library to add items to your {activeView}.</p>
                </div>
            );
        }
        return (
            <div className="p-5 space-y-3">
                {items.map(vol => (
                      <div key={vol.id} onClick={() => navigate(`/series/${vol.seriesId}`)} className="flex gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                          <img src={vol.coverUrl} className="w-14 h-20 object-cover rounded-md shadow-sm" alt="cover" />
                          <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                              <div><h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{getSeriesTitle(vol.seriesId)}</h3><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Volume {vol.number}</p></div>
                              <div className="flex items-center gap-2 mt-2">
                                  {vol.isOwned ? (<span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Owned</span>) : (<span className="text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Missing</span>)}
                                  {vol.condition && (<span className="text-[10px] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded">{vol.condition}</span>)}
                              </div>
                          </div>
                          <div className="flex flex-col justify-center"><Icon name="chevron_right" className="text-gray-300 dark:text-gray-600" /></div>
                      </div>
                ))}
            </div>
        );
    }

    if (activeView === 'notifications') {
        return (
            <div className="p-5 space-y-4">
                 {[
                     { id: 'releases', label: 'New Release Alerts', icon: 'new_releases', color: 'text-orange-500', desc: 'Get notified when new volumes drop.' },
                     { id: 'prices', label: 'Price Drops', icon: 'sell', color: 'text-green-500', desc: 'Alerts for wishlisted items.' },
                     { id: 'reminders', label: 'Daily Reminder', icon: 'schedule', color: 'text-blue-500', desc: 'Keep your reading streak alive.' },
                     { id: 'weekly', label: 'Weekly Insights', icon: 'insights', color: 'text-blue-500', desc: 'Summary of your collection growth.' },
                     { id: 'updates', label: 'App Updates', icon: 'system_update', color: 'text-slate-500', desc: 'New features and improvements.' },
                 ].map(item => (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                         <div className="flex items-start gap-3">
                             <div className={`mt-0.5 ${item.color}`}>
                                 <Icon name={item.icon} />
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</h4>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{item.desc}</p>
                             </div>
                         </div>
                         <button onClick={() => toggleNotif(item.id as any)} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ml-4 ${notifSettings[item.id as keyof typeof notifSettings] ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                             <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${notifSettings[item.id as keyof typeof notifSettings] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                         </button>
                     </div>
                 ))}
            </div>
        );
    }

    if (activeView === 'backup') {
        return (
             <div className="p-5 space-y-6">
                <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-5 right-5 flex items-center justify-center">
                        <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${isSyncing ? 'duration-500' : 'duration-1000'}`}></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Icon name={isSyncing ? "sync" : "cloud_done"} className={`text-2xl ${isSyncing ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cloud Sync</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Last synced: {lastSynced}</p>
                        </div>
                    </div>
                    <button onClick={handleSync} disabled={isSyncing} className="w-full py-3 bg-primary hover:bg-blue-600 active:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/20 text-sm transition-colors flex justify-center items-center gap-2">
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 ml-1">Local Backups</h4>
                     <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                        <button onClick={handleCreateLocalBackup} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Icon name="save" className="text-lg" /></div>
                                <div className="text-left"><span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Create Local Backup</span></div>
                            </div>
                            <Icon name="chevron_right" className="text-slate-400 group-hover:text-primary transition-colors" />
                        </button>
                         <button onClick={handleRestoreClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400"><Icon name="restore" className="text-lg" /></div>
                                <div className="text-left"><span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Restore from File</span></div>
                            </div>
                            <Icon name="chevron_right" className="text-slate-400 group-hover:text-primary transition-colors" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                     </div>
                     {restoreStatus && <div className={`mt-3 text-center text-xs font-bold p-2 rounded-lg ${restoreStatus.includes('Error') ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'} animate-fade-in`}>{restoreStatus}</div>}
                </div>
             </div>
        );
    }

    if (activeView === 'export') {
        return (
             <div className="p-5 flex flex-col items-center text-center space-y-6 pt-10">
                 <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-900/5">
                     <Icon name="table_view" className="text-4xl text-green-700 dark:text-green-400" />
                 </div>
                 <div>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Export Collection</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">Download a complete copy of your library data.</p>
                 </div>
                 <div className="w-full space-y-3 pt-2">
                     <button onClick={handleExportCSV} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"><Icon name="download" /> Download CSV</button>
                      <button onClick={handleExportJSON} className="w-full py-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"><Icon name="code" /> Download JSON</button>
                 </div>
             </div>
        );
    }
    return null;
  };

  return (
    <>
    {cropperImage && <ImageCropper imageSrc={cropperImage} cropShape='circle' aspectRatio={1} onCancel={() => setCropperImage(null)} onCropComplete={handleCropComplete} />}
    <div className="h-full overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark pb-24">
      {activeView && (
        <div className="fixed inset-0 z-[60] bg-background-light dark:bg-background-dark flex flex-col animate-slide-up">
           <div className="px-5 pt-safe-pt mt-4 pb-4 flex items-center gap-4 border-b border-gray-200 dark:border-white/5 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md sticky top-0 z-10">
              <button onClick={() => setActiveView(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><Icon name="arrow_back" className="text-2xl dark:text-white" /></button>
              <h2 className="text-xl font-bold dark:text-white">{getHeaderTitle()}</h2>
           </div>
           <div className="flex-1 overflow-y-auto pb-24">{renderContent()}</div>
        </div>
      )}

      <div className="h-14 w-full"></div>
      <main className="max-w-3xl mx-auto px-5 md:px-8 space-y-8">
        <header className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="relative group cursor-pointer" onClick={handleEditProfileClick}>
                <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary via-blue-500 to-cyan-400">
                    <Avatar src={userProfile.avatarUrl} size="2xl" className="border-4 border-background-light dark:border-background-dark" />
                </div>
            </div>
            <div className="space-y-1 flex flex-col items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{userProfile.name}</h1>
                <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">@{userProfile.username}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Member since {userProfile.joinDate}</span>
                </div>
                <button onClick={handleEditProfileClick} className="mt-3 px-4 py-1.5 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm">
                    {isGuest ? 'Log In / Sign Up' : 'Edit Profile'}
                </button>
            </div>
            <div className="flex justify-center gap-8 w-full py-2">
                <div className="text-center"><div className="text-lg font-bold text-slate-900 dark:text-white">{ownedVolumesCount}</div><div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Owned</div></div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <div className="text-center"><div className="text-lg font-bold text-slate-900 dark:text-white">{series.length}</div><div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Series</div></div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <div className="text-center"><div className="text-lg font-bold text-slate-900 dark:text-white">{percentageReadOwned}%</div><div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Read</div></div>
            </div>
        </header>
        
        {isPremium ? (
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-slate-800 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -ml-12 -mb-12 opacity-30"></div>
              <div className="relative p-5 space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Icon name="workspace_premium" className="text-yellow-400 text-xl" type="outlined" />
                          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">MangaShelf+</h3>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                          ACTIVE
                      </span>
                  </div>
                  <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Plan</span>
                          <span className="text-white font-medium">{getSubscriptionDisplayName(userProfile.subscriptionTier || null)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Price</span>
                          <span className="text-white font-medium">{getSubscriptionPrice(userProfile.subscriptionTier || null)}</span>
                      </div>
                      {userProfile.subscriptionExpiresAt && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Renews</span>
                            <span className="text-white font-medium">{formatSubscriptionExpiry(userProfile.subscriptionExpiresAt)}</span>
                        </div>
                      )}
                  </div>
                  <div className="flex gap-2">
                      <button
                        onClick={handleManageSubscription}
                        className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-lg transition-all"
                      >
                          Manage
                      </button>
                      <button
                        onClick={handleRestorePurchases}
                        disabled={restoring}
                        className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-lg transition-all disabled:opacity-50"
                      >
                          {restoring ? 'Restoring...' : 'Restore'}
                      </button>
                  </div>
              </div>
          </section>
        ) : (
          <section onClick={handleUpgradeClick} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-slate-800 shadow-2xl group cursor-pointer">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -ml-12 -mb-12 opacity-30"></div>
              <div className="relative p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2"><Icon name="workspace_premium" className="text-yellow-400 text-xl" type="outlined" /><h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">MangaShelf+</h3></div>
                      <p className="text-sm text-slate-300 leading-relaxed">Unlock <span className="text-white font-medium">Cloud Sync</span> across devices and access <span className="text-white font-medium">Advanced Reading Stats</span>.</p>
                  </div>
                  <button className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-bold text-sm rounded-lg shadow-lg shadow-yellow-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"><span>Upgrade Now</span><Icon name="arrow_forward" type="outlined" className="text-base" /></button>
              </div>
          </section>
        )}

        <section className="space-y-6">
            <div className="space-y-3">
                <h4 className="px-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Collection</h4>
                <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                     {[
                        { icon: 'favorite_border', color: 'pink', label: 'Favorites', badge: favoriteCount > 0 ? `${favoriteCount} vols` : null, action: () => setActiveView('favorites') },
                        { icon: 'shopping_cart', color: 'sky', label: 'Wishlist', badge: wishlistCount > 0 ? `${wishlistCount} items` : null, action: () => setActiveView('wishlist') },
                        { icon: 'table_view', color: 'emerald', label: 'Export Data (CSV)', badge: null, actionIcon: 'chevron_right', action: () => setActiveView('export') }
                     ].map((item, i) => (
                        <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="flex items-center gap-4"><div className={`w-9 h-9 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400`}><Icon name={item.icon} type="outlined" className="text-xl" /></div><span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span></div>
                            <div className="flex items-center gap-2">{item.badge && <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{item.badge}</span>}<Icon name={item.actionIcon || 'chevron_right'} type="outlined" className="text-slate-400 text-xl" /></div>
                        </button>
                     ))}
                </div>
            </div>
            <div className="space-y-3">
                <h4 className="px-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preferences</h4>
                <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                     {[
                        { icon: 'dark_mode', color: 'blue', label: 'Appearance', badge: 'Dark System', action: () => {} },
                        { icon: 'notifications_none', color: 'orange', label: 'Notifications', badge: null, action: () => setActiveView('notifications') },
                        { icon: 'cloud_queue', color: 'teal', label: 'Backup & Restore', sub: `Last synced: ${lastSynced}`, action: () => setActiveView('backup') }
                     ].map((item, i) => (
                        <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="flex items-center gap-4"><div className={`w-9 h-9 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400`}><Icon name={item.icon} type="outlined" className="text-xl" /></div><div className="flex flex-col items-start"><span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>{item.sub && <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.sub}</span>}</div></div>
                             <div className="flex items-center gap-2">{item.badge && <span className="text-xs text-slate-500 dark:text-slate-400">{item.badge}</span>}<Icon name="chevron_right" type="outlined" className="text-slate-400 text-xl" /></div>
                        </button>
                     ))}
                </div>
            </div>
            
            {/* Logout & Footer */}
            <div className="pt-2 flex flex-col items-center gap-6">
                {!isGuest && (
                    <button 
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        Log Out
                    </button>
                )}
                <div className="text-center space-y-1 pb-4">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">MangaShelf Version 1.0.0</p>
                    <div className="flex justify-center gap-4 text-[10px] text-slate-400 dark:text-slate-600">
                        <span className="hover:underline cursor-pointer">Privacy Policy</span>
                        <span>•</span>
                        <span className="hover:underline cursor-pointer">Terms of Service</span>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
    </>
  );
};

export default Profile;