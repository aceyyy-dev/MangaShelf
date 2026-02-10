import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';

type TimeRange = '30d' | '90d' | '1y' | 'All';

const CollectionGrowth: React.FC = () => {
  const navigate = useNavigate();
  const { volumes, series } = useStore();
  const [range, setRange] = useState<TimeRange>('1y');
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Filter Data based on Time Range
  const { currentData, previousCount, chartPoints, xLabels } = useMemo(() => {
      const now = new Date();
      let startDate = new Date();
      let prevStartDate = new Date();
      let prevEndDate = new Date();
      
      // Determine time boundaries
      if (range === '30d') {
          startDate.setDate(now.getDate() - 30);
          prevStartDate.setDate(now.getDate() - 60);
          prevEndDate.setDate(now.getDate() - 30);
      } else if (range === '90d') {
          startDate.setDate(now.getDate() - 90);
          prevStartDate.setDate(now.getDate() - 180);
          prevEndDate.setDate(now.getDate() - 90);
      } else if (range === '1y') {
          startDate.setFullYear(now.getFullYear() - 1);
          prevStartDate.setFullYear(now.getFullYear() - 2);
          prevEndDate.setFullYear(now.getFullYear() - 1);
      } else {
          // All Time - handled specifically below for start date
          startDate = new Date(0); 
          prevStartDate = new Date(0);
          prevEndDate = new Date(0);
      }

      const filterByDate = (v: any, start: Date, end: Date) => {
          if (!v.isOwned || !v.dateAdded) return false;
          const d = new Date(v.dateAdded);
          return d >= start && d <= end;
      };

      const current = volumes.filter(v => filterByDate(v, startDate, now));
      const prevCount = range === 'All' ? 0 : volumes.filter(v => filterByDate(v, prevStartDate, prevEndDate)).length;

      // Chart Data Generation
      const buckets = 6; 
      const points = [];
      const labels = [];
      
      let effectiveStart = new Date(startDate);
      
      if (range === 'All') {
          if (volumes.length === 0) {
               effectiveStart = new Date();
               effectiveStart.setMonth(effectiveStart.getMonth() - 1); // Default to 1 month view if empty
          } else {
               const earliest = volumes.reduce((acc, v) => {
                  if (!v.isOwned || !v.dateAdded) return acc;
                  const d = new Date(v.dateAdded).getTime();
                  return d < acc ? d : acc;
              }, now.getTime());
              effectiveStart = new Date(earliest);
              // Ensure we have a minimum span so graph isn't a single point
              if (now.getTime() - effectiveStart.getTime() < 1000 * 60 * 60 * 24 * 7) {
                   effectiveStart.setDate(effectiveStart.getDate() - 7);
              }
          }
      }

      const totalTimeSpan = now.getTime() - effectiveStart.getTime();
      const step = totalTimeSpan / (buckets - 1);

      for (let i = 0; i < buckets; i++) {
          const t = new Date(effectiveStart.getTime() + step * i);
          
          // CRITICAL: Force the last point to be exactly NOW to avoid floating point drift (e.g. showing tomorrow's date)
          if (i === buckets - 1) {
              t.setTime(now.getTime());
          }
          
          // Cumulative count logic
          let count = 0;
          if (range === 'All') {
              count = volumes.filter(v => v.isOwned && v.dateAdded && new Date(v.dateAdded) <= t).length;
          } else {
              count = volumes.filter(v => v.isOwned && v.dateAdded && new Date(v.dateAdded) >= startDate && new Date(v.dateAdded) <= t).length;
          }
          
          points.push({ x: i, y: count });
          
          // Labels
          let label = "";
          if (range === '1y') {
              // Just month name for yearly view
              label = t.toLocaleDateString('en-US', { month: 'short' });
          } else if (range === 'All') {
              // Smart formatting for All
              if (totalTimeSpan > 1000 * 60 * 60 * 24 * 365) {
                   label = t.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
              } else {
                   label = t.toLocaleDateString('en-US', { month: 'short' });
              }
          } else {
              // Day/Month for shorter ranges
              label = t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          labels.push(label);
      }

      return { 
          currentData: current, 
          previousCount: prevCount,
          chartPoints: points,
          xLabels: labels
      };

  }, [volumes, range]);

  // Derived Stats
  const totalVolumes = currentData.length;
  const diff = totalVolumes - previousCount;
  
  // Avg/Month
  const monthsDivisor = range === '30d' ? 1 : range === '90d' ? 3 : range === '1y' ? 12 : 12;
  const avgPerMonth = (totalVolumes / monthsDivisor).toFixed(1);

  // Active Month
  const activeMonth = useMemo(() => {
      if (currentData.length === 0) return 'N/A';
      const counts: Record<string, number> = {};
      currentData.forEach(v => {
            const d = new Date(v.dateAdded!);
            const k = d.toLocaleString('default', { month: 'short' });
            counts[k] = (counts[k] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
      return sorted.length > 0 ? sorted[0][0] : 'N/A';
  }, [currentData]);

  const totalSpent = useMemo(() => {
      return currentData.reduce((acc, v) => acc + (v.price || 11.99), 0);
  }, [currentData]);

  // Generate SVG Path
  const { pathD, fillD, lastPointX, lastPointY } = useMemo(() => {
      const width = 100;
      const height = 50;
      
      const maxY = Math.max(...chartPoints.map(p => p.y), 1); // Avoid div by 0
      const minY = 0;
      const rangeY = maxY - minY;

      const normalizedPoints = chartPoints.map(p => ({
          x: (p.x / (chartPoints.length - 1)) * width,
          y: height - ((p.y / rangeY) * (height - 10)) - 5 // Padding
      }));

      // Bezier Curve
      let d = `M ${normalizedPoints[0].x},${normalizedPoints[0].y}`;
      for (let i = 1; i < normalizedPoints.length; i++) {
           const prev = normalizedPoints[i-1];
           const curr = normalizedPoints[i];
           const cp1x = prev.x + (curr.x - prev.x) / 2;
           const cp1y = prev.y;
           const cp2x = prev.x + (curr.x - prev.x) / 2;
           const cp2y = curr.y;
           d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
      }

      const fill = `${d} L ${width},${height} L 0,${height} Z`;
      const last = normalizedPoints[normalizedPoints.length - 1];
      
      return { pathD: d, fillD: fill, lastPointX: last.x, lastPointY: last.y };
  }, [chartPoints]);

  const getSeriesInfo = (seriesId: string) => series.find(s => s.id === seriesId);

  // Sort current data by date desc for the list
  const recentAdditions = useMemo(() => {
      return [...currentData].sort((a,b) => {
          const dA = new Date(a.dateAdded || 0).getTime();
          const dB = new Date(b.dateAdded || 0).getTime();
          return dB - dA;
      });
  }, [currentData]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400"
          >
            <Icon name="arrow_back" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Collection Growth</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Volumes added over time</p>
          </div>
          <button 
            onClick={() => setIsShareOpen(true)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400"
          >
            <Icon name="ios_share" type="outlined" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 space-y-6">
        <div className="bg-slate-200 dark:bg-surface-dark p-1 rounded-xl flex justify-between text-sm font-medium">
            {(['30d', '90d', '1y', 'All'] as TimeRange[]).map((r) => (
                <button 
                    key={r}
                    onClick={() => setRange(r)}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                        range === r 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    {r}
                </button>
            ))}
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-0 overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="p-5 pb-0">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{totalVolumes}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {range === 'All' ? 'Total Volumes' : 'Volumes Added'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold ${diff >= 0 ? 'text-chart-teal bg-chart-teal/10' : 'text-chart-red bg-chart-red/10'}`}>
                            <Icon name={diff >= 0 ? "trending_up" : "trending_down"} className="text-sm" /> 
                            {diff >= 0 ? '+' : ''}{diff}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">vs previous {range}</p>
                    </div>
                </div>
            </div>
            
            <div className="relative h-64 w-full">
                <div className="absolute inset-0 flex flex-col justify-between px-5 text-xs text-slate-400 dark:text-slate-500 font-mono pb-8 pt-4">
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                </div>
                
                <svg className="absolute inset-0 w-full h-full pb-6 pt-2" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <defs>
                        <linearGradient id="gradientLarge" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#1978e5" stopOpacity="0.3"></stop>
                            <stop offset="100%" stopColor="#1978e5" stopOpacity="0"></stop>
                        </linearGradient>
                    </defs>
                    <path d={fillD} fill="url(#gradientLarge)"></path>
                    <path d={pathD} fill="none" stroke="#1978e5" strokeLinecap="round" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></path>
                    {/* Only the last point dot */}
                    <circle className="fill-primary stroke-white dark:stroke-surface-dark shadow-lg shadow-primary/50" cx={lastPointX} cy={lastPointY} r="3" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></circle>
                </svg>
            </div>
            
            <div className="flex justify-between px-5 text-xs text-slate-400 pb-4 font-mono">
                {xLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg/Month</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{avgPerMonth}</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Active Month</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{activeMonth}</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Spent</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">${Math.round(totalSpent).toLocaleString()}</div>
            </div>
        </div>

        <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 px-1">
                {range === 'All' ? 'Recent Additions' : `Additions (${range})`}
            </h3>
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {recentAdditions.slice(0, 10).map(vol => {
                    const seriesInfo = getSeriesInfo(vol.seriesId);
                    return (
                        <div key={vol.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/series/${vol.seriesId}`)}>
                            <div className="h-12 w-8 bg-slate-200 dark:bg-slate-700 rounded-sm flex-shrink-0 relative overflow-hidden">
                                <img src={vol.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">{seriesInfo?.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Vol. {vol.number} • {seriesInfo?.author}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">${vol.price || 11.99}</div>
                                <div className="text-[10px] text-slate-400">
                                    {vol.dateAdded ? new Date(vol.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Unknown'}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {recentAdditions.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-500">No volumes added in this period</div>
                )}
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
                                <Icon name="trending_up" className="text-3xl text-primary" />
                            </div>
                            <h4 className="font-bold text-lg dark:text-white leading-tight">MangaShelf Stats</h4>
                            <p className="text-slate-500 text-xs mt-1">Growth Overview ({range})</p>
                            <p className="text-xl font-black text-primary mt-1">+{diff} Volumes</p>
                            <div className="mt-4 flex gap-4 text-center w-full">
                                <div className="flex-1 p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-slate-400">Total</div>
                                    <div className="font-bold dark:text-white">{totalVolumes}</div>
                                </div>
                                <div className="flex-1 p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-slate-400">Avg/Mo</div>
                                    <div className="font-bold dark:text-white">{avgPerMonth}</div>
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

export default CollectionGrowth;