import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';

type FilterType = 'All' | 'Completed' | 'Reading' | 'Dropped';

const SeriesCompletion: React.FC = () => {
  const navigate = useNavigate();
  const { series } = useStore();
  const [filter, setFilter] = useState<FilterType>('All');

  const stats = useMemo(() => {
    const total = series.length || 1;
    const completed = series.filter(s => s.status === 'Completed').length;
    const reading = series.filter(s => s.status === 'Reading').length;
    const dropped = series.filter(s => s.status === 'Dropped').length;

    // Calculate percentages for donut
    const pctCompleted = (completed / total) * 100;
    const pctReading = (reading / total) * 100;
    const pctDropped = (dropped / total) * 100;

    // SVG Circle Calculations (r=40, circumference ~ 251.2)
    const C = 251.2;
    const offset1 = 0; // Starts at top
    const dash1 = (pctCompleted / 100) * C;
    
    const offset2 = -dash1; // Starts where green ends
    const dash2 = (pctReading / 100) * C;

    const offset3 = -(dash1 + dash2); // Starts where yellow ends
    const dash3 = (pctDropped / 100) * C;

    return {
        total,
        completed,
        reading,
        dropped,
        dash1,
        dash2,
        dash3,
        offset1,
        offset2,
        offset3,
        pctCompleted,
        pctReading,
        pctDropped
    };
  }, [series]);

  const filteredSeries = useMemo(() => {
      return series.filter(s => {
          if (filter === 'All') return true;
          return s.status === filter;
      });
  }, [series, filter]);

  // Find "Smart Insights" (Closest to completion)
  const nearlyCompleteSeries = useMemo(() => {
      return series
        .filter(s => s.status === 'Reading' && s.totalVolumes - s.ownedVolumes <= 5 && s.totalVolumes - s.ownedVolumes > 0)
        .sort((a,b) => (a.totalVolumes - a.ownedVolumes) - (b.totalVolumes - b.ownedVolumes))
        .slice(0, 3);
  }, [series]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200 antialiased selection:bg-primary selection:text-white h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl w-full min-h-screen relative flex flex-col pb-24">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 pt-12 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400">
                        <Icon name="arrow_back" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Series Completion</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Progress across all tracked series</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 pt-6 pb-8 space-y-8">
                {/* Donut Chart */}
                <div className="flex flex-col items-center justify-center py-2 relative">
                    <div className="relative w-64 h-64">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Base Circle */}
                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#1e293b" strokeWidth="12" className="text-slate-200 dark:text-slate-800" strokeOpacity="0.3"></circle>
                            
                            {/* Dropped Segment (Red) */}
                            {stats.dropped > 0 && (
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#ef4444" strokeDasharray={`${stats.dash3} 251.2`} strokeDashoffset={stats.offset3} strokeLinecap="round" strokeWidth="12"></circle>
                            )}

                            {/* Reading Segment (Yellow) */}
                            {stats.reading > 0 && (
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#eab308" strokeDasharray={`${stats.dash2} 251.2`} strokeDashoffset={stats.offset2} strokeLinecap="round" strokeWidth="12"></circle>
                            )}

                            {/* Completed Segment (Teal/Green) */}
                            {stats.completed > 0 && (
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#2dd4bf" strokeDasharray={`${stats.dash1} 251.2`} strokeDashoffset="0" strokeLinecap="round" strokeWidth="12"></circle>
                            )}
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Total Series</span>
                        </div>
                        
                        {/* Floating Percentages - Simplified positioning for dynamic data */}
                        {stats.pctCompleted > 0 && (
                            <div className="absolute top-2 right-2 bg-surface-dark/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-chart-teal border border-chart-teal/20">
                                {Math.round(stats.pctCompleted)}%
                            </div>
                        )}
                        {stats.pctReading > 0 && (
                            <div className="absolute bottom-6 right-0 bg-surface-dark/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-yellow-500 border border-yellow-500/20">
                                {Math.round(stats.pctReading)}%
                            </div>
                        )}
                        {stats.pctDropped > 0 && (
                             <div className="absolute top-1/2 left-0 transform -translate-x-2 bg-surface-dark/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-red-500 border border-red-500/20">
                                {Math.round(stats.pctDropped)}%
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-chart-teal"></span>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-400">Complete</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.completed}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-400">Reading</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.reading}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-400">Dropped</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.dropped}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-slate-200 dark:bg-surface-dark p-1 rounded-xl flex justify-between text-sm font-medium">
                    {(['All', 'Completed', 'Reading', 'Dropped'] as FilterType[]).map(type => (
                        <button 
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`flex-1 py-2 px-3 rounded-lg transition-all ${filter === type ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Your Library ({filteredSeries.length})</h3>
                    
                    {filteredSeries.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm italic">
                            No series found in this category.
                        </div>
                    )}

                    {filteredSeries.map(s => {
                        const progress = s.totalVolumes > 0 ? (s.ownedVolumes / s.totalVolumes) * 100 : 0;
                        let badgeColor = "bg-slate-200 text-slate-600";
                        let barColor = "bg-slate-400";
                        
                        if (s.status === 'Completed') {
                            badgeColor = "bg-chart-teal/10 text-chart-teal";
                            barColor = "bg-chart-teal";
                        } else if (s.status === 'Reading') {
                            badgeColor = "bg-yellow-500/10 text-yellow-500";
                            barColor = "bg-yellow-500";
                        } else if (s.status === 'Dropped') {
                            badgeColor = "bg-red-500/10 text-red-500";
                            barColor = "bg-red-500";
                        }

                        return (
                            <div key={s.id} onClick={() => navigate(`/series/${s.id}`)} className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-all">
                                <div className="w-12 h-16 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden flex-shrink-0 relative">
                                    <img src={s.coverUrl} className="w-full h-full object-cover" alt="cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-slate-900 dark:text-white truncate pr-2">{s.title}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badgeColor}`}>{s.status}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                                        <span>Vol {s.ownedVolumes} / {s.totalVolumes}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Smart Insights (Only show if we have nearly complete series) */}
                {nearlyCompleteSeries.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-lg border border-slate-700/50 relative overflow-hidden mt-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-chart-teal/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Icon name="auto_awesome" className="text-chart-teal text-sm" />
                                <h3 className="text-xs font-bold text-chart-teal uppercase tracking-widest">Smart Insights</h3>
                            </div>
                            <p className="text-white font-medium mb-4 text-sm pr-4">You're closest to completing these series. Just a few volumes left!</p>
                            <div className="flex gap-3">
                                {nearlyCompleteSeries.map(s => (
                                    <div key={s.id} onClick={() => navigate(`/series/${s.id}`)} className="flex flex-col items-center gap-1 cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors">
                                            <span className="text-[10px] font-bold text-white">{s.totalVolumes - s.ownedVolumes} Vol</span>
                                        </div>
                                        <span className="text-[9px] text-slate-300 truncate w-14 text-center">{s.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default SeriesCompletion;