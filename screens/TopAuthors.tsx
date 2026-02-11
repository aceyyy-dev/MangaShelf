import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';

const TopAuthors: React.FC = () => {
  const navigate = useNavigate();
  const { series, volumes } = useStore();
  const [timeFilter, setTimeFilter] = useState<'all' | 'year'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Trigger animation on mount and when sorting changes
  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, [sortOrder, timeFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // 1. Filter Volumes based on time range
    const filteredVolumes = volumes.filter(v => {
        if (!v.isOwned) return false;
        if (timeFilter === 'year') {
            if (!v.dateAdded) return false;
            return new Date(v.dateAdded) >= oneYearAgo;
        }
        return true;
    });

    const totalFilteredVolumes = filteredVolumes.length;

    // 2. Aggregate Data
    const authorMap = new Map<string, { count: number, seriesTitles: Set<string> }>();
    const genreCounts: Record<string, number> = {};
    const authorsNow = new Set<string>();
    const authorsLastMonth = new Set<string>();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    filteredVolumes.forEach(v => {
        const s = series.find(ser => ser.id === v.seriesId);
        if (s && s.author) {
            // Author Counts
            const entry = authorMap.get(s.author) || { count: 0, seriesTitles: new Set() };
            entry.count++;
            entry.seriesTitles.add(s.title);
            authorMap.set(s.author, entry);

            // Genre Counts
            if (s.tags) {
                s.tags.forEach(tag => {
                    genreCounts[tag] = (genreCounts[tag] || 0) + 1;
                });
            }

            // Unique Authors Calculation (for growth metric)
            if (v.dateAdded) {
                const d = new Date(v.dateAdded);
                authorsNow.add(s.author);
                if (d < startOfMonth) {
                    authorsLastMonth.add(s.author);
                }
            }
        }
    });

    // 3. Sort Authors
    const sortedAuthors = Array.from(authorMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        titles: Array.from(data.seriesTitles).join(', '),
        percentage: totalFilteredVolumes > 0 ? (data.count / totalFilteredVolumes) * 100 : 0
    })).sort((a, b) => {
        return sortOrder === 'desc' ? b.count - a.count : a.count - b.count;
    });

    // 4. Find Top Genre
    let topGenre = 'N/A';
    let topGenreCount = 0;
    Object.entries(genreCounts).forEach(([genre, count]) => {
        if (count > topGenreCount) {
            topGenre = genre;
            topGenreCount = count;
        }
    });
    const topGenrePercent = totalFilteredVolumes > 0 ? Math.round((topGenreCount / totalFilteredVolumes) * 100) : 0;

    return {
        sortedAuthors,
        totalVolumes: totalFilteredVolumes,
        uniqueAuthorsCount: sortedAuthors.length,
        uniqueAuthorsGrowth: authorsNow.size - authorsLastMonth.size,
        topGenre,
        topGenrePercent
    };

  }, [series, volumes, timeFilter, sortOrder]);

  const topAuthorVolumeCount = stats.sortedAuthors.length > 0 ? stats.sortedAuthors[0].count : 0;
  const topAuthorName = stats.sortedAuthors.length > 0 ? stats.sortedAuthors[0].name : "None";

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-24">
        <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-safe-pt pb-4">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400"
                >
                    <Icon name="arrow_back" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Top Authors</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Most collected authors by volume</p>
                </div>
                <button 
                    onClick={() => setIsShareOpen(true)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400"
                >
                    <Icon name="ios_share" type="outlined" />
                </button>
            </div>
        </header>

        <main className="flex-1 px-4 pt-6 space-y-6 pb-8">
            <div className="flex gap-2">
                <button 
                    onClick={() => setTimeFilter('all')}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                        timeFilter === 'all' 
                        ? 'bg-primary text-white shadow-primary/20' 
                        : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    All Time
                </button>
                <button 
                    onClick={() => setTimeFilter('year')}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
                        timeFilter === 'year' 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    Last Year
                </button>
            </div>

            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">Sorted by</span>
                <div 
                    className="flex items-center gap-2 text-xs font-medium text-primary cursor-pointer hover:bg-primary/5 px-2 py-1 rounded transition-colors select-none"
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                >
                    <span>Volume Count ({sortOrder === 'desc' ? 'Most' : 'Least'})</span>
                    <Icon name={sortOrder === 'desc' ? "arrow_downward" : "arrow_upward"} className="text-sm" />
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{topAuthorVolumeCount}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mt-1">Volumes by {sortOrder === 'desc' ? '#1 Author' : 'Last Author'}</p>
                    </div>
                    <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
                        <Icon name="emoji_events" className="text-primary text-xl" />
                    </div>
                </div>

                <div className="space-y-6">
                    {stats.sortedAuthors.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">No authors found for this period.</div>
                    ) : (
                        stats.sortedAuthors.slice(0, 10).map((author, index) => (
                            <div key={author.name} className="group relative">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 && sortOrder === 'desc' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                            {sortOrder === 'desc' ? index + 1 : stats.sortedAuthors.length - index}
                                        </div>
                                        <div className="min-w-0 flex-1 pr-2">
                                            <span className="block font-semibold text-slate-800 dark:text-white text-sm truncate">{author.name}</span>
                                            <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">{author.titles}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="block font-mono font-bold text-slate-900 dark:text-white text-sm">{author.count} Vols</span>
                                        <span className="block text-[10px] text-primary font-medium">{author.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(17,82,212,0.4)] ${index === 0 && sortOrder === 'desc' ? 'bg-primary' : 'bg-primary/70'}`} 
                                        style={{ width: animate ? `${author.percentage}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-surface-dark dark:to-background-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-blue-400/10 rounded-full blur-xl group-hover:bg-blue-400/20 transition-all"></div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Unique Authors</h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.uniqueAuthorsCount}</p>
                    <div className="mt-2 flex items-center text-[10px] text-slate-400">
                        <span className={`flex items-center mr-1 ${stats.uniqueAuthorsGrowth >= 0 ? 'text-chart-teal' : 'text-chart-red'}`}>
                            <Icon name={stats.uniqueAuthorsGrowth >= 0 ? "arrow_upward" : "arrow_downward"} className="text-[10px]" /> 
                            {Math.abs(stats.uniqueAuthorsGrowth)}
                        </span>
                        this month
                    </div>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-surface-dark dark:to-background-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Top Genre</h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{stats.topGenre}</p>
                    <div className="mt-2 text-[10px] text-slate-400">
                        {stats.topGenrePercent}% of total vols
                    </div>
                </div>
            </div>
        </main>

        {/* Share Modal */}
        {isShareOpen && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsShareOpen(false)}>
                <div className="bg-background-light dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up border border-white/10" onClick={e => e.stopPropagation()}>
                     <h3 className="text-lg font-bold mb-4 text-center dark:text-white">Share Stats</h3>
                     
                     <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-1 shadow-lg mb-6 transform transition-transform hover:scale-[1.02]">
                        <div className="bg-white dark:bg-surface-darker rounded-lg p-5 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                <Icon name="emoji_events" className="text-3xl text-primary" />
                            </div>
                            <h4 className="font-bold text-lg dark:text-white leading-tight">MangaShelf Stats</h4>
                            <p className="text-slate-500 text-xs mt-1">Top Author</p>
                            <p className="text-xl font-black text-primary mt-1">{topAuthorName}</p>
                            <div className="mt-4 flex gap-4 text-center w-full">
                                <div className="flex-1 p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-slate-400">Volumes</div>
                                    <div className="font-bold dark:text-white">{stats.totalVolumes}</div>
                                </div>
                                <div className="flex-1 p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-slate-400">Authors</div>
                                    <div className="font-bold dark:text-white">{stats.uniqueAuthorsCount}</div>
                                </div>
                            </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-4 gap-4">
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
                     <button onClick={() => setIsShareOpen(false)} className="w-full mt-6 py-3 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white font-medium text-sm">Close</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default TopAuthors;