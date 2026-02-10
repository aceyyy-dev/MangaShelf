import React, { useMemo } from 'react';
import { useStore } from '../StoreContext';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { stats, series: allSeries, userProfile } = useStore();

  // 1. Get "Continue Tracking" series (Only 'Reading' status)
  const readingSeries = useMemo(() => {
      return allSeries.filter(s => s.status === 'Reading');
  }, [allSeries]);

  // 2. Get "Jump Back In" (The first 'Reading' series or most recently updated)
  const featuredSeries = readingSeries.length > 0 ? readingSeries[0] : null;

  // 3. Calculate Missing Volumes
  const missingVolumesCount = useMemo(() => {
      if (allSeries.length === 0) return 0;
      return allSeries.reduce((acc, s) => {
          const missing = Math.max(0, s.totalVolumes - s.ownedVolumes);
          return acc + missing;
      }, 0);
  }, [allSeries]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar pb-24 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="px-6 pt-safe-pt mt-4 py-4 flex items-center justify-between sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-transparent transition-all duration-300">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Welcome back,</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{userProfile.name}</h1>
        </div>
        <div className="relative cursor-pointer group" onClick={() => navigate('/profile')}>
          <Avatar src={userProfile.avatarUrl} size="lg" className="border-2 border-primary/20 ring-2 ring-background-light dark:ring-background-dark shadow-sm group-hover:border-primary/50 transition-colors" />
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-background-light dark:border-background-dark rounded-full"></div>
        </div>
      </header>

      <main className="px-6 space-y-8 pt-2">
        {/* Featured Daily Pick - Visual Interest */}
        {featuredSeries ? (
            <section 
                onClick={() => navigate(`/series/${featuredSeries.id}`)}
                className="relative rounded-2xl overflow-hidden shadow-lg h-48 cursor-pointer group"
            >
                <img src={featuredSeries.coverUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Featured" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white mb-2 uppercase tracking-wider shadow-sm">Jump Back In</span>
                    <h2 className="text-white font-bold text-xl truncate pr-4">{featuredSeries.title}</h2>
                    <p className="text-gray-300 text-xs mt-1">Volume {featuredSeries.ownedVolumes + 1} is waiting...</p>
                </div>
            </section>
        ) : (
            <section 
                onClick={() => navigate('/scan')}
                className="relative rounded-2xl overflow-hidden shadow-sm border border-dashed border-slate-300 dark:border-slate-700 h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Icon name="add" className="text-primary" />
                </div>
                <p className="text-sm font-medium text-slate-500">Start your collection</p>
            </section>
        )}

        {/* Stats Summary Card */}
        <section onClick={() => navigate('/library')} className="cursor-pointer">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                  <Icon name="shelves" className="text-primary" />
                  Your Shelf
              </h2>
              <Icon name="arrow_forward" className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalVolumes}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-1">Volumes Owned</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeSeries}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-1">Series Active</p>
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completion Goal</span>
                <span className="text-sm font-bold text-primary">{stats.completionRate}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(17,82,212,0.5)] transition-all duration-1000 ease-out" 
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Continue Tracking (Horizontal Scroll) */}
        <section className="relative">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Continue Tracking</h3>
            <button onClick={() => navigate('/library')} className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wide">View all</button>
          </div>
          
          {/* Scroll Container with Negative Margins to hit edges */}
          <div className="-mx-6 px-6 overflow-x-auto pb-6 scrollbar-hide snap-x flex gap-4 no-scrollbar">
            {readingSeries.length > 0 ? readingSeries.slice(0, 6).map((series) => (
              <div key={series.id} className="flex-shrink-0 w-32 snap-start group relative cursor-pointer" onClick={() => navigate(`/series/${series.id}`)}>
                <div className="aspect-[2/3] w-full rounded-xl overflow-hidden shadow-md mb-3 relative bg-gray-100 dark:bg-surface-darker">
                  <img 
                    src={series.coverUrl} 
                    alt={series.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  {/* Floating Action Button for Adding Volume */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); navigate(`/series/${series.id}`); }} 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]"
                  >
                     <span className="material-icons-round text-white bg-primary rounded-full p-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">add</span>
                  </div>
                </div>
                <p className="text-sm font-bold truncate text-gray-900 dark:text-white leading-tight">{series.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{series.author}</p>
              </div>
            )) : (
                <div className="flex-shrink-0 w-64 snap-start p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center">
                    <p className="text-xs text-gray-500">No active series being read.</p>
                </div>
            )}
            
             {/* Add New Card */}
             <div className="flex-shrink-0 w-32 snap-start group relative cursor-pointer" onClick={() => navigate('/scan')}>
                <div className="aspect-[2/3] w-full rounded-xl overflow-hidden shadow-sm mb-3 bg-white dark:bg-surface-dark flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <Icon name="add" type="round" className="text-gray-400 dark:text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">Add New</span>
                </div>
             </div>
          </div>
        </section>

        {/* Missing Volumes Alert */}
        <section>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-2xl p-4 border border-red-100 dark:border-red-900/20 flex items-center space-x-4 shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-white/5 rounded-full flex items-center justify-center text-red-500 shadow-sm border border-red-100 dark:border-transparent">
              <Icon name={allSeries.length === 0 ? "help_outline" : "priority_high"} type="round" className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Missing Volumes</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                  {allSeries.length === 0 ? (
                      "Start collecting to see what's missing!"
                  ) : missingVolumesCount > 0 ? (
                      <>You have gaps in your collection. <span className="font-bold text-red-600 dark:text-red-400">{missingVolumesCount} missing</span>.</>
                  ) : (
                      "Your collection is up to date!"
                  )}
              </p>
            </div>
            <button 
                onClick={() => navigate('/library')} 
                className="px-3 py-1.5 bg-white dark:bg-white/10 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 shadow-sm hover:bg-red-50 dark:hover:bg-white/20 transition-colors"
            >
                {allSeries.length === 0 ? "?" : "Check"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;