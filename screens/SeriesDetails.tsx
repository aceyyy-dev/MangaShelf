import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Volume, Series } from '../types';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';
import ImageCropper from '../components/ImageCropper';

const ALL_GENRES = [
  'Shonen', 'Seinen', 'Shojo', 'Josei',
  'Action', 'Adventure', 'Comedy', 'Drama',
  'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
  'Thriller', 'Psychological', 'Dark Fantasy', 'Mecha'
];

const PLACEHOLDER_COVER = "https://placehold.co/400x600/1e293b/ffffff?text=?";

const SeriesDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { series: globalSeries, volumes: globalVolumes, updateSeries, updateVolume, toggleVolumeFavorite, toggleVolumeWishlist, toggleVolumeOwned, deleteVolume } = useStore();
  
  const currentSeries = globalSeries.find(s => s.id === id) || globalSeries[2];
  const currentVolumes = globalVolumes.filter(v => v.seriesId === currentSeries.id);

  // Local state
  const [activeTab, setActiveTab] = useState<'volumes' | 'wishlist'>('volumes');
  const [isEditingSeries, setIsEditingSeries] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [viewingVolume, setViewingVolume] = useState<Volume | null>(null);
  const [deleteVolumeId, setDeleteVolumeId] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isbnCopied, setIsbnCopied] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Temporary editing state for forms
  const [tempSeries, setTempSeries] = useState<Series>(currentSeries);
  
  // Cropper State
  const [cropperState, setCropperState] = useState<{
      open: boolean;
      imageSrc: string | null;
      target: 'volume' | 'series';
  }>({ open: false, imageSrc: null, target: 'volume' });

  const fileInputRef = useRef<HTMLInputElement>(null); 
  const seriesFileInputRef = useRef<HTMLInputElement>(null);

  // Update temp state when currentSeries changes (e.g. context update)
  useEffect(() => {
      setTempSeries(currentSeries);
  }, [currentSeries]);

  // Sorting state
  const [sortBy, setSortBy] = useState<'number' | 'title' | 'condition'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const saveSeriesChanges = (e: React.FormEvent) => {
    e.preventDefault();
    updateSeries(tempSeries);
    setIsEditingSeries(false);
  };

  const handleDeleteVolume = () => {
      if (deleteVolumeId) {
          deleteVolume(deleteVolumeId);
          setDeleteVolumeId(null);
          // If we were viewing this volume, close the view
          if (viewingVolume?.id === deleteVolumeId) {
              setViewingVolume(null);
          }
      }
  };

  const handleCopyISBN = () => {
      navigator.clipboard.writeText("978-1974715466");
      setIsbnCopied(true);
      setTimeout(() => setIsbnCopied(false), 2000);
  };

  // Generic file selection handler that opens cropper
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'volume' | 'series') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  setCropperState({ open: true, imageSrc: reader.result, target });
              }
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; // Reset input
  };

  const handleCropComplete = (croppedUrl: string) => {
      if (cropperState.target === 'volume' && viewingVolume) {
          const updated = { ...viewingVolume, coverUrl: croppedUrl };
          updateVolume(updated);
          setViewingVolume(updated);
      } else if (cropperState.target === 'series') {
          setTempSeries({ ...tempSeries, coverUrl: croppedUrl });
      }
      setCropperState({ open: false, imageSrc: null, target: 'volume' });
  };

  const toggleGenre = (genre: string) => {
      if (tempSeries.tags.includes(genre)) {
          setTempSeries({ ...tempSeries, tags: tempSeries.tags.filter(t => t !== genre) });
      } else {
          setTempSeries({ ...tempSeries, tags: [...tempSeries.tags, genre] });
      }
  };

  // Filter based on Search AND Active Tab
  const filteredVolumes = currentVolumes.filter(v => {
      // Tab Filter
      if (activeTab === 'wishlist' && !v.isInWishlist) return false;

      // Search Filter
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      if (v.title?.toLowerCase().includes(q) || v.notes?.toLowerCase().includes(q)) return true;
      if (v.number.toString().includes(q)) return true;
      const volumeNumberMatch = q.match(/(?:vol\.?|volume|v|#)\s*(\d+)/i);
      if (volumeNumberMatch) {
          const num = parseInt(volumeNumberMatch[1], 10);
          if (v.number === num) return true;
      }
      return false;
  });

  const sortedVolumes = [...filteredVolumes].sort((a, b) => {
    let res = 0;
    if (sortBy === 'number') {
        res = a.number - b.number;
    } else if (sortBy === 'title') {
        const tA = a.title || '';
        const tB = b.title || '';
        res = tA.localeCompare(tB);
    } else if (sortBy === 'condition') {
        const order: Record<string, number> = { 'New': 3, 'Good': 2, 'Fair': 1, 'Bad': 0 };
        const valA = order[a.condition || ''] || 0;
        const valB = order[b.condition || ''] || 0;
        res = valA - valB;
    }
    return sortOrder === 'asc' ? res : -res;
  });

  const handleSort = (option: 'number' | 'title' | 'condition') => {
      if (sortBy === option) {
          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortBy(option);
          setSortOrder('asc');
      }
      setIsSortMenuOpen(false);
  };

  const getConditionColor = (condition?: string) => {
      switch(condition) {
          case 'New': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20';
          case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20';
          case 'Fair': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20';
          case 'Bad': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
          default: return 'text-gray-500 bg-gray-50 border-gray-200';
      }
  };

  const getReadStatusColor = (status?: string) => {
    switch (status) {
        case 'Read': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20';
        case 'Reading': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
        default: return 'text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600'; // Unread
    }
  };
  
  const getReadStatusLabel = (status?: string) => {
      if (status === 'Read') return 'Completed';
      if (status === 'Reading') return 'Reading';
      return 'Unread';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-green-500 text-white shadow-lg shadow-green-500/30';
        case 'Reading': return 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30';
        case 'Dropped': return 'bg-red-500 text-white shadow-lg shadow-red-500/30';
        default: return 'bg-black/60 text-white';
    }
  };

  // Helper to update viewing volume and store simultaneously
  const updateViewingVolume = (updates: Partial<Volume>) => {
      if (!viewingVolume) return;
      const updated = { ...viewingVolume, ...updates };
      setViewingVolume(updated);
      updateVolume(updated);
  };

  return (
    <>
    {cropperState.open && cropperState.imageSrc && (
        <ImageCropper 
            imageSrc={cropperState.imageSrc}
            cropShape='rect'
            aspectRatio={2/3} // Standard manga cover ratio
            onCancel={() => setCropperState({ ...cropperState, open: false })}
            onCropComplete={handleCropComplete}
        />
    )}

    <div className="h-full overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark pb-0">
        <nav className="fixed top-0 w-full z-50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none h-24"></div>
            <div className="flex items-center justify-between px-4 h-14 relative z-10 text-white mt-safe-pt">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
                    <Icon name="arrow_back_ios_new" type="round" className="text-xl" />
                </button>
                
                <div className="relative">
                    <button 
                        onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                        className="p-2 -mr-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                    >
                        <Icon name="more_horiz" type="round" className="text-2xl" />
                    </button>

                    {isHeaderMenuOpen && (
                         <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsHeaderMenuOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden animate-fade-in z-50">
                                <button 
                                    onClick={() => {
                                        setIsHeaderMenuOpen(false);
                                        setIsEditingSeries(true);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    <Icon name="edit" type="outlined" className="text-lg" />
                                    Edit Series
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>

        <header className="relative pt-24 pb-8 px-6 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={currentSeries.coverUrl} alt="bg" className="w-full h-full object-cover blur-xl opacity-40 scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/30 via-background-dark/80 to-background-dark"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-primary/30 rounded-lg blur-lg group-hover:bg-primary/50 transition duration-500"></div>
                    <img src={currentSeries.coverUrl} alt={currentSeries.title} className="relative w-40 h-60 object-cover rounded-lg shadow-2xl border border-white/10 transform transition group-hover:scale-[1.02]" />
                    
                    <div className="absolute top-2 right-2 relative z-20">
                        <div className={`px-2 py-0.5 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${getStatusColor(currentSeries.status)}`}>
                            {currentSeries.status}
                            <Icon name="expand_more" className="text-[14px] -mr-0.5 opacity-80" />
                        </div>
                        <select
                            value={currentSeries.status}
                            onChange={(e) => updateSeries({...currentSeries, status: e.target.value as any})}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                        >
                            <option value="Reading">Reading</option>
                            <option value="Completed">Completed</option>
                            <option value="Dropped">Dropped</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">{currentSeries.title}</h1>
                    <p className="text-gray-400 text-sm font-medium mb-1">{currentSeries.author}</p>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">{currentSeries.totalVolumes} Volumes</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {currentSeries.tags.map(tag => (
                             <span key={tag} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-xs text-gray-300">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </header>

        <section className="px-4 mb-6 relative z-10">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800/50 border border-white/5 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-green-500">{currentSeries.ownedVolumes}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Owned</div>
                </div>
                <div className="bg-gray-800/50 border border-white/5 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-red-500">{Math.max(0, currentSeries.totalVolumes - currentSeries.ownedVolumes)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Missing</div>
                </div>
                <div className="bg-gray-800/50 border border-white/5 rounded-lg p-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-blue-500">{currentSeries.totalVolumes > 0 ? Math.floor((currentSeries.ownedVolumes / currentSeries.totalVolumes) * 100) : 0}%</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Progress</div>
                </div>
            </div>
        </section>

        <div className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 pt-2 px-4 pb-0">
            <div className="flex space-x-6">
                <button 
                    onClick={() => setActiveTab('volumes')}
                    className={`relative pb-3 font-semibold text-sm transition-colors ${activeTab === 'volumes' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    Volumes
                    {activeTab === 'volumes' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('wishlist')}
                    className={`relative pb-3 font-semibold text-sm transition-colors ${activeTab === 'wishlist' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    Wishlist
                    {activeTab === 'wishlist' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
                </button>
            </div>
        </div>

        <main className="px-4 pb-24 pt-4 space-y-3">
             {/* Search Bar */}
             <div className="relative mb-4 z-30">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search (e.g., '5', 'Vol 5', 'Title')" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-[#151b26] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder-gray-500 transition-all shadow-sm"
                />
            </div>

             <div className="flex justify-between items-center mb-2 text-xs text-gray-500 font-medium relative z-30">
                <span>Showing {sortedVolumes.length} volumes</span>
                <div className="relative">
                    <button 
                        onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                        <Icon name="sort" className="text-sm" />
                        Sort
                    </button>
                    
                    {isSortMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden animate-fade-in z-50">
                             {[
                                { label: 'Number', value: 'number' },
                                { label: 'Title', value: 'title' },
                                { label: 'Condition', value: 'condition' },
                             ].map((opt) => (
                                 <button
                                    key={opt.value}
                                    onClick={() => handleSort(opt.value as any)}
                                    className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${sortBy === opt.value ? 'text-primary font-bold bg-primary/5' : 'text-gray-700 dark:text-gray-300'}`}
                                 >
                                    {opt.label}
                                    {sortBy === opt.value && (
                                        <Icon name={sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'} className="text-xs" />
                                    )}
                                 </button>
                             ))}
                        </div>
                    )}
                </div>
            </div>
            
            {sortedVolumes.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No volumes found.</p>
                </div>
            )}

            {sortedVolumes.map((vol) => (
                 <div 
                    key={vol.id} 
                    onClick={() => setViewingVolume(vol)}
                    className={`group bg-white dark:bg-[#151b26] rounded-lg p-3 flex items-start gap-4 border shadow-sm transition-all cursor-pointer ${!vol.isOwned ? 'border-red-500/20' : 'border-gray-100 dark:border-gray-800 hover:border-primary/30'}`}
                 >
                    <div className="relative shrink-0 group/cover">
                        <img 
                            src={vol.coverUrl === PLACEHOLDER_COVER ? PLACEHOLDER_COVER : vol.coverUrl} 
                            alt={`Vol ${vol.number}`} 
                            className={`w-16 h-24 object-cover rounded shadow-md ${!vol.isOwned ? 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100' : ''}`} 
                        />
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteVolumeId(vol.id);
                            }}
                            className="absolute bottom-1 left-1 p-1 bg-black/60 hover:bg-red-500/80 rounded-md backdrop-blur-sm text-white opacity-0 group-hover/cover:opacity-100 transition-opacity"
                        >
                            <Icon name="delete" className="text-[12px]" />
                        </button>
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start">
                            <div className="pr-2">
                                <h3 className={`font-semibold truncate ${!vol.isOwned ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>Volume {vol.number}</h3>
                                {vol.title ? (
                                    <p className="text-xs text-gray-500 mt-1">{vol.title}</p>
                                ) : (
                                    !vol.isOwned && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Missing</span>
                                        </div>
                                    )
                                )}
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleVolumeFavorite(vol.id); }}
                                    className={`p-1.5 rounded-full transition-colors ${vol.isFavorite ? 'bg-red-500/10 text-red-500' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                >
                                    <Icon name={vol.isFavorite ? "favorite" : "favorite_border"} type="round" className="text-lg" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleVolumeWishlist(vol.id); }}
                                    className={`p-1.5 rounded-full transition-colors ${vol.isInWishlist ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                >
                                    <Icon name={vol.isInWishlist ? "shopping_cart" : "add_shopping_cart"} type="round" className="text-lg" />
                                </button>
                            </div>
                        </div>

                        {vol.notes && (
                             <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-md text-xs text-slate-600 dark:text-slate-400 flex gap-2 items-start">
                                <Icon name="sticky_note_2" className="text-yellow-500 text-[14px] mt-0.5" />
                                <p className="line-clamp-2 flex-1">{vol.notes}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                            {vol.isOwned ? (
                                <div className="flex items-center gap-2 w-full">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${getReadStatusColor(vol.readStatus)}`}>
                                        {getReadStatusLabel(vol.readStatus)}
                                    </span>
                                    {vol.condition && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${getConditionColor(vol.condition)}`}>
                                            {vol.condition}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-primary font-medium ml-auto">Collected</span>
                                </div>
                            ) : (
                                <span className="text-[10px] text-gray-500 italic">Not collected yet</span>
                            )}
                        </div>
                    </div>
                 </div>
            ))}
        </main>

        {/* Fixed Position FAB above Bottom Nav */}
        <div className="fixed bottom-24 right-6 z-50">
            <button 
                onClick={() => navigate('/scan')}
                className="bg-primary hover:bg-blue-600 text-white rounded-full p-4 shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-background-light dark:border-background-dark"
            >
                <Icon name="add" type="round" className="text-3xl" />
            </button>
        </div>

        {/* Viewing Volume Details (Now also the Edit Page) */}
        {viewingVolume && (
            <div className="fixed inset-0 z-[60] flex flex-col bg-background-light dark:bg-background-dark animate-fade-in overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none z-0"></div>
                <header className="relative z-20 px-4 pt-12 pb-2 flex items-center justify-between mt-safe-pt">
                    <button 
                        onClick={() => setViewingVolume(null)}
                        className="p-2 rounded-full hover:bg-slate-200/20 dark:hover:bg-white/10 transition-colors"
                    >
                        <Icon name="chevron_left" type="round" className="text-2xl" />
                    </button>
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Details</span>
                     <button 
                        onClick={() => setViewingVolume(null)}
                        className="p-2 rounded-full hover:bg-slate-200/20 dark:hover:bg-white/10 transition-colors text-primary font-medium"
                    >
                        Done
                    </button>
                </header>
                
                <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-24">
                    <div className="flex flex-col items-center pt-4 pb-8 px-8">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-white/20 to-black/40 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                            <div className="absolute top-4 left-4 right-4 bottom-0 bg-black/60 blur-xl rounded-full transform scale-90 translate-y-4"></div>
                            <img 
                                src={viewingVolume.coverUrl === PLACEHOLDER_COVER ? PLACEHOLDER_COVER : viewingVolume.coverUrl} 
                                alt={`${currentSeries.title} Volume ${viewingVolume.number}`} 
                                className="relative w-[220px] h-[330px] object-cover rounded-lg shadow-2xl border border-white/10 z-10 transform transition-transform duration-500 hover:scale-[1.02]" 
                            />
                            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">Change Cover</span>
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleFileSelect(e, 'volume')}
                        />

                        <div className="mt-8 text-center space-y-2 w-full">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{currentSeries.title}</h1>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-lg font-medium text-slate-500 dark:text-slate-400">Volume {viewingVolume.number}</span>
                                {viewingVolume.title && <span className="text-slate-400">•</span>}
                            </div>
                            <input 
                                type="text"
                                placeholder="Subtitle (Optional)"
                                value={viewingVolume.title || ''}
                                onChange={(e) => updateViewingVolume({ title: e.target.value })}
                                className="w-full text-center bg-transparent border-none text-slate-500 dark:text-slate-300 placeholder-slate-400/50 focus:ring-0 p-0 text-sm"
                            />
                        </div>
                    </div>

                    {/* Owned Toggle */}
                    <div className="px-6 mb-4">
                        <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">Owned</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Do you have this volume?</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={viewingVolume.isOwned} 
                                    onChange={(e) => updateViewingVolume({ isOwned: e.target.checked })}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                    
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-4 divide-x divide-slate-200 dark:divide-slate-800">
                            <div className="text-center px-2">
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">Publisher</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{currentSeries.publisher || 'Unknown'}</p>
                            </div>
                            <div className="text-center px-2">
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">Language</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">English</p>
                            </div>
                            <div className="text-center px-2">
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">Genre</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{currentSeries.tags[0] || 'Manga'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mx-6 h-px bg-slate-200 dark:bg-slate-800 my-4"></div>

                    {/* Condition Selector (If Owned) */}
                    {viewingVolume.isOwned && (
                        <div className="px-6 py-4 space-y-3">
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">Condition</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['New', 'Good', 'Fair', 'Bad'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => updateViewingVolume({ condition: c as any })}
                                        className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all ${
                                            viewingVolume.condition === c 
                                            ? 'bg-primary/10 border-primary text-primary' 
                                            : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300 dark:hover:border-white/20'
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Reading Status Selector */}
                    <div className="px-6 py-4 space-y-3">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">Reading Status</label>
                        <div className="bg-slate-200 dark:bg-slate-800/60 p-1 rounded-lg flex relative">
                            {['Unread', 'Reading', 'Read'].map((status) => {
                                let activeClass = '';
                                if (status === 'Unread') activeClass = 'bg-slate-200 text-slate-800 shadow-sm font-bold'; // Greyish for Unread active? Or maybe white/slate in dark mode? Let's use standard slate.
                                if (status === 'Reading') activeClass = 'bg-yellow-500 text-white shadow-sm font-bold';
                                if (status === 'Read') activeClass = 'bg-green-500 text-white shadow-sm font-bold';

                                const isSelected = (viewingVolume.readStatus || 'Unread') === status || (status === 'Unread' && !viewingVolume.readStatus);

                                return (
                                    <button
                                        key={status}
                                        onClick={() => updateViewingVolume({ readStatus: status as any })}
                                        className={`flex-1 py-2 text-sm font-medium rounded transition-all relative z-10 ${
                                            isSelected
                                            ? activeClass
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {status === 'Read' ? 'Completed' : status}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">Collector's Notes</label>
                            <Icon name="edit" className="text-primary text-sm" />
                        </div>
                        <textarea
                            rows={4}
                            value={viewingVolume.notes || ''}
                            onChange={(e) => updateViewingVolume({ notes: e.target.value })}
                            placeholder="Add notes regarding edition, extras, printing..."
                            className="w-full bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary resize-none outline-none transition-all"
                        />
                    </div>
                    
                    <div className="px-6 py-2">
                        <button 
                            onClick={handleCopyISBN}
                            className="w-full py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 group active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
                        >
                            <span className="text-sm font-medium text-slate-900 dark:text-white">ISBN-13</span>
                            <div className="flex items-center text-slate-500 dark:text-slate-400">
                                <span className="text-sm mr-2 font-mono">978-1974715466</span>
                                <Icon name={isbnCopied ? "check" : "content_copy"} type={isbnCopied ? "filled" : "outlined"} className={`text-base transition-colors ${isbnCopied ? "text-green-500" : "group-hover:text-primary"}`} />
                            </div>
                        </button>
                        <div className="w-full py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 group">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">Page Count</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">~200</span>
                        </div>
                    </div>
                </main>
                
                <div className="absolute bottom-0 w-full z-30">
                    <div className="h-12 w-full bg-gradient-to-b from-transparent to-background-light dark:to-background-dark pointer-events-none"></div>
                    <div className="bg-background-light/90 dark:bg-[#151c2b]/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 pt-4 pb-8 flex items-center gap-4 safe-pb">
                        <button 
                            onClick={() => {
                                toggleVolumeFavorite(viewingVolume.id);
                                setViewingVolume({...viewingVolume, isFavorite: !viewingVolume.isFavorite});
                            }}
                            className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group ${
                                viewingVolume.isFavorite 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-500' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-500'
                            }`}
                        >
                            <Icon name={viewingVolume.isFavorite ? "favorite" : "favorite_border"} type="round" className="text-2xl group-hover:animate-pulse" />
                            <span className="font-medium">Favorite</span>
                        </button>
                        <button 
                            onClick={() => setIsShareOpen(true)}
                            className="h-14 w-14 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors active:scale-95"
                        >
                            <Icon name="ios_share" type="outlined" className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isShareOpen && viewingVolume && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsShareOpen(false)}>
                <div className="bg-background-light dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up border border-white/10" onClick={e => e.stopPropagation()}>
                     <h3 className="text-lg font-bold mb-4 text-center dark:text-white">Share Volume</h3>
                     
                     {/* The Card */}
                     <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-1 shadow-lg mb-6 transform transition-transform hover:scale-[1.02]">
                        <div className="bg-white dark:bg-surface-darker rounded-lg p-4 flex gap-4">
                            <img src={viewingVolume.coverUrl === PLACEHOLDER_COVER ? PLACEHOLDER_COVER : viewingVolume.coverUrl} className="w-20 h-28 object-cover rounded shadow-md" alt="cover" />
                            <div className="flex flex-col justify-center">
                                <h4 className="font-bold text-lg dark:text-white leading-tight">{currentSeries.title}</h4>
                                <p className="text-primary font-medium">Volume {viewingVolume.number}</p>
                                <div className="mt-2 flex items-center gap-1">
                                     <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                                        <Icon name="star" className="text-[10px] text-black" />
                                     </div>
                                     <span className="text-xs text-gray-500 dark:text-gray-400">Highly Recommended</span>
                                </div>
                            </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-4 gap-4">
                         {/* Social Icons mock */}
                         <button className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white group-active:scale-95 transition-transform"><Icon name="content_copy" /></div>
                            <span className="text-xs text-gray-500">Copy</span>
                         </button>
                         <button className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white group-active:scale-95 transition-transform"><Icon name="message" /></div>
                            <span className="text-xs text-gray-500">Message</span>
                         </button>
                         <button className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white group-active:scale-95 transition-transform"><Icon name="send" /></div>
                            <span className="text-xs text-gray-500">Twitter</span>
                         </button>
                         <button className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white group-active:scale-95 transition-transform"><Icon name="image" /></div>
                            <span className="text-xs text-gray-500">Instagram</span>
                         </button>
                     </div>
                     <button onClick={() => setIsShareOpen(false)} className="w-full mt-6 py-3 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white font-medium text-sm">Cancel</button>
                </div>
            </div>
        )}

        {isEditingSeries && (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up border border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold dark:text-white">Edit Series</h3>
                        <button onClick={() => setIsEditingSeries(false)} className="text-gray-400 hover:text-white transition-colors">
                            <Icon name="close" type="round" />
                        </button>
                    </div>
                    
                    <form onSubmit={saveSeriesChanges} className="space-y-5">
                        <div className="flex flex-col items-center mb-4">
                            <div 
                                className="relative group cursor-pointer w-32 h-48 rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800"
                                onClick={() => seriesFileInputRef.current?.click()}
                            >
                                <img 
                                    src={tempSeries.coverUrl} 
                                    alt="Series Cover" 
                                    className="w-full h-full object-cover transition-opacity group-hover:opacity-75" 
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icon name="edit" className="text-white text-3xl" />
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => seriesFileInputRef.current?.click()}
                                className="mt-2 text-xs font-medium text-primary hover:text-primary/80"
                            >
                                Change Poster
                            </button>
                            <input 
                                type="file" 
                                ref={seriesFileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleFileSelect(e, 'series')}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                            <input 
                                type="text" 
                                value={tempSeries.title} 
                                onChange={e => setTempSeries({...tempSeries, title: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Author</label>
                            <input 
                                type="text" 
                                value={tempSeries.author} 
                                onChange={e => setTempSeries({...tempSeries, author: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Volumes</label>
                            <input 
                                type="number" 
                                min="1"
                                value={tempSeries.totalVolumes} 
                                onChange={e => setTempSeries({...tempSeries, totalVolumes: Math.max(1, parseInt(e.target.value) || 1)})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Publisher</label>
                            <input 
                                type="text" 
                                value={tempSeries.publisher || ''} 
                                onChange={e => setTempSeries({...tempSeries, publisher: e.target.value})}
                                placeholder="e.g. Viz Media"
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Genres</label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_GENRES.map(genre => (
                                    <button
                                        key={genre}
                                        type="button"
                                        onClick={() => toggleGenre(genre)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                            tempSeries.tags.includes(genre)
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
        {deleteVolumeId && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in border border-white/5 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <Icon name="delete_forever" className="text-3xl" type="round" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-2">Delete Volume?</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        Are you sure you want to remove this volume from your collection? <br/>
                        <span className="font-semibold text-red-500">This action cannot be reversed.</span>
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setDeleteVolumeId(null)}
                            className="flex-1 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDeleteVolume}
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

export default SeriesDetails;