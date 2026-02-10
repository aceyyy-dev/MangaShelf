import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';
import { Series } from '../types';
import ImageCropper from '../components/ImageCropper';

const ALL_GENRES = [
  'Shonen', 'Seinen', 'Shojo', 'Josei',
  'Action', 'Adventure', 'Comedy', 'Drama',
  'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
  'Thriller', 'Psychological', 'Dark Fantasy', 'Mecha'
];

type SortOption = 'newest' | 'oldest' | 'largest' | 'smallest' | 'az';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: 'alert' | 'info' | 'success';
}

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { series, updateSeries, deleteSeries } = useStore();
  const [filter, setFilter] = useState('All Series');
  
  // Sorting State
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // UI States
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Cropper State
  const [cropperImage, setCropperImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
      { id: '1', title: 'New Volume Release', message: 'Chainsaw Man Vol. 13 is now available!', time: '2 hours ago', isRead: false, type: 'info' },
      { id: '2', title: 'Stock Alert', message: 'Berserk Vol. 1 (Deluxe) is back in stock at major retailers.', time: '5 hours ago', isRead: false, type: 'success' },
      { id: '3', title: 'Missing Volume Found', message: 'We found a listing for One Piece Vol. 98 you might be interested in.', time: '1 day ago', isRead: true, type: 'alert' }
  ]);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const filteredSeries = useMemo(() => {
    return [...series]
      .filter(s => {
          if (filter === 'All Series') return true;
          return s.status === filter;
      })
      .sort((a, b) => {
          switch (sortOption) {
              case 'newest':
                  return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
              case 'oldest':
                  return new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime();
              case 'largest':
                  return b.totalVolumes - a.totalVolumes;
              case 'smallest':
                  return a.totalVolumes - b.totalVolumes;
              case 'az':
                  return a.title.localeCompare(b.title);
              default:
                  return 0;
          }
      });
  }, [series, filter, sortOption]);

  const handleSaveSeries = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingSeries) {
          updateSeries(editingSeries);
          setEditingSeries(null);
      }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (editingSeries) {
          setEditingSeries({ ...editingSeries, coverUrl: croppedUrl });
      }
      setCropperImage(null);
  };

  const handleDeleteSeries = () => {
      if (deleteConfirmId) {
          deleteSeries(deleteConfirmId);
          setDeleteConfirmId(null);
      }
  };

  const toggleGenre = (genre: string) => {
      if (!editingSeries) return;
      if (editingSeries.tags.includes(genre)) {
          setEditingSeries({ ...editingSeries, tags: editingSeries.tags.filter(t => t !== genre) });
      } else {
          setEditingSeries({ ...editingSeries, tags: [...editingSeries.tags, genre] });
      }
  };

  const sortOptions: { label: string; value: SortOption; icon: string }[] = [
      { label: 'Newest Collection', value: 'newest', icon: 'schedule' },
      { label: 'Oldest Collection', value: 'oldest', icon: 'history' },
      { label: 'Largest Collection', value: 'largest', icon: 'data_usage' },
      { label: 'Smallest Collection', value: 'smallest', icon: 'pie_chart' },
      { label: 'A-Z', value: 'az', icon: 'sort_by_alpha' },
  ];

  return (
    <>
    {cropperImage && (
        <ImageCropper 
            imageSrc={cropperImage}
            cropShape='rect'
            aspectRatio={2/3}
            onCancel={() => setCropperImage(null)}
            onCropComplete={handleCropComplete}
        />
    )}

    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark pb-24" onClick={() => { setMenuOpenId(null); setIsSortMenuOpen(false); setIsNotifOpen(false); }}>
      {/* Header */}
      <header className="pt-safe-pt pb-4 px-5 z-40 bg-background-light dark:bg-background-dark/95 border-b border-gray-200 dark:border-white/5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 mt-4 relative">
            <h1 className="text-2xl font-bold tracking-tight dark:text-white">Library</h1>
            <div className="flex gap-3 relative">
                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-primary hover:text-white transition-colors" onClick={() => navigate('/scan')}>
                    <Icon name="add" className="text-sm" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsNotifOpen(!isNotifOpen); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-primary hover:text-white transition-colors relative"
                >
                    <Icon name="notifications" className="text-sm" />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>}
                </button>
                
                {/* Notification Dropdown */}
                {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-[#1a2230] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden animate-fade-in origin-top-right">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-xs text-primary font-medium hover:text-primary/80">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 text-sm">No new notifications</div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-gray-700 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>{notif.title}</h4>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{notif.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => navigate('/profile')} className="w-full py-3 text-center text-xs font-medium text-gray-500 hover:text-primary bg-gray-50 dark:bg-white/5 transition-colors">
                            View notification settings
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Search & Sort */}
        <div className="flex gap-3">
            <div className="relative flex-1">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder-gray-500 text-gray-800 dark:text-gray-200 transition-all shadow-sm" 
                    placeholder="Search collection..." 
                    type="text"
                />
            </div>
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsSortMenuOpen(!isSortMenuOpen); }}
                    className={`px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center shadow-sm h-full ${isSortMenuOpen ? 'text-primary border-primary/50' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    <Icon name="tune" />
                </button>
                
                {isSortMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a2230] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden animate-fade-in origin-top-right">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort by</span>
                        </div>
                        {sortOptions.map((opt) => (
                            <button 
                                key={opt.value}
                                onClick={() => setSortOption(opt.value)}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${sortOption === opt.value ? 'text-primary bg-primary/5 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon name={opt.icon} className="text-lg" />
                                    {opt.label}
                                </div>
                                {sortOption === opt.value && <Icon name="check" className="text-sm" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {['All Series', 'Completed', 'Reading', 'Dropped'].map((f) => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                        filter === f 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto px-5 pt-4 space-y-4">
        {filteredSeries.map((series) => (
            <div 
                key={series.id}
                onClick={() => navigate(`/series/${series.id}`)}
                className="group relative flex bg-white dark:bg-surface-dark rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all cursor-pointer"
            >
                <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                    <img src={series.coverUrl} alt={series.title} className="w-full h-full object-cover" />
                    {series.status === 'Completed' && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>}
                </div>
                
                <div className="flex-1 ml-4 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white mb-1">{series.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{series.author}</p>
                            </div>
                            <div className="relative">
                                <button 
                                    className="p-1 -mr-2 text-gray-400 hover:text-white transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenId(menuOpenId === series.id ? null : series.id);
                                    }}
                                >
                                    <Icon name="more_horiz" className="text-lg" />
                                </button>
                                {menuOpenId === series.id && (
                                    <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#1a2230] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden animate-fade-in">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingSeries(series); setMenuOpenId(null); }}
                                            className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300"
                                        >
                                            <Icon name="edit" type="outlined" className="text-base" />
                                            Edit
                                        </button>
                                        <div className="h-px bg-gray-100 dark:bg-white/5"></div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(series.id); setMenuOpenId(null); }}
                                            className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-600 dark:text-red-400"
                                        >
                                            <Icon name="delete" type="outlined" className="text-base" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {series.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="flex justify-between items-end mb-1.5">
                            <span className={`text-xs font-semibold ${series.status === 'Completed' ? 'text-green-500 dark:text-green-400' : 'text-primary'}`}>
                                {series.ownedVolumes}/{series.totalVolumes} Vol
                            </span>
                            {series.ownedVolumes < series.totalVolumes ? (
                                <span className="text-[10px] font-medium text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-500/20">
                                    {series.totalVolumes - series.ownedVolumes} Missing
                                </span>
                            ) : (
                                <span className="text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-500/20 flex items-center gap-1">
                                    <Icon name="check" className="text-[10px]" /> Complete
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-1.5 rounded-full ${series.status === 'Completed' ? 'bg-green-500 dark:bg-green-400' : 'bg-primary'}`} 
                                style={{ width: `${(series.ownedVolumes / series.totalVolumes) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        ))}

        <button onClick={() => navigate('/scan')} className="w-full border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-white/5 transition-all group">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 flex items-center justify-center mb-2 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Icon name="add" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add New Series</span>
        </button>
      </main>

      {/* Edit Modal */}
      {editingSeries && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up border border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">Edit Library Series</h3>
                    <button onClick={() => setEditingSeries(null)} className="text-gray-400 hover:text-white transition-colors">
                        <Icon name="close" type="round" />
                    </button>
                </div>
                
                <form onSubmit={handleSaveSeries} className="space-y-4">
                    <div className="flex flex-col items-center mb-4">
                        <div 
                            className="relative group cursor-pointer w-32 h-48 rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <img 
                                src={editingSeries.coverUrl} 
                                alt="Series Cover" 
                                className="w-full h-full object-cover transition-opacity group-hover:opacity-75" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icon name="edit" className="text-white text-3xl" />
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 text-xs font-medium text-primary hover:text-primary/80"
                        >
                            Change Poster
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageSelect}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                        <input 
                            type="text" 
                            value={editingSeries.title} 
                            onChange={e => setEditingSeries({...editingSeries, title: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Author</label>
                        <input 
                            type="text" 
                            value={editingSeries.author} 
                            onChange={e => setEditingSeries({...editingSeries, author: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Volumes</label>
                        <input 
                            type="number" 
                            min="1"
                            value={editingSeries.totalVolumes} 
                            onChange={e => setEditingSeries({...editingSeries, totalVolumes: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Publisher</label>
                        <input 
                            type="text" 
                            value={editingSeries.publisher || ''} 
                            onChange={e => setEditingSeries({...editingSeries, publisher: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Genres</label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                            {ALL_GENRES.map(genre => (
                                <button
                                    key={genre}
                                    type="button"
                                    onClick={() => toggleGenre(genre)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        editingSeries.tags.includes(genre)
                                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in border border-white/5 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <Icon name="warning" className="text-3xl" type="round" />
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-2">Delete Series?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Are you sure you want to delete this series from your library? <br/>
                    <span className="font-semibold text-red-500">This action cannot be reversed.</span>
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteSeries}
                        className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/30 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Library;