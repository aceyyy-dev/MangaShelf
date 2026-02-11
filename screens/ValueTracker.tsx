import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';

type TimeRange = '1M' | '6M' | '1Y' | 'All';

const ValueTracker: React.FC = () => {
  const navigate = useNavigate();
  const { stats, series, volumes } = useStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [sortDesc, setSortDesc] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Dynamic calculations for Top Series
  const seriesList = useMemo(() => {
    const list = series.map(s => {
        // Calculate real value based on owned volumes of this series
        const sVols = volumes.filter(v => v.seriesId === s.id && v.isOwned);
        const val = sVols.reduce((acc, v) => acc + (v.price || 11.99), 0); // Default price fallback
        return { 
            id: s.id,
            title: s.title, 
            volumes: sVols.length, 
            value: Math.round(val),
            coverUrl: s.coverUrl,
            code: s.title.substring(0, 2).toUpperCase()
        };
    });

    return list.sort((a, b) => sortDesc ? b.value - a.value : a.value - b.value);
  }, [series, volumes, stats, sortDesc]);

  const highestValueSeries = useMemo(() => {
     return seriesList.length > 0 ? seriesList.sort((a,b) => b.value - a.value)[0] : { title: 'None', value: 0 };
  }, [seriesList]);

  const avgPrice = useMemo(() => {
      return stats.totalVolumes > 0 ? (stats.estimatedValue / stats.totalVolumes) : 0;
  }, [stats]);

  // Chart Data Logic
  const chartData = useMemo(() => {
    const current = stats.estimatedValue;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let dataPoints: number[] = [];
    let xAxisLabels: string[] = [];

    // Helper to generate realistic looking fake history based on current value
    const generateHistory = (count: number, volatility: number, growthFactor: number) => {
        const arr = [current];
        for (let i = 1; i < count; i++) {
            const prev = arr[0];
            const change = (prev * growthFactor) + (prev * volatility * (Math.random() - 0.5));
            arr.unshift(Math.max(0, prev - change));
        }
        return arr;
    };

    if (timeRange === '1M') {
        dataPoints = generateHistory(5, 0.01, 0.005); 
        xAxisLabels = ["W1", "W2", "W3", "W4", "Now"];
    } else if (timeRange === '6M') {
        dataPoints = generateHistory(6, 0.03, 0.015);
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            xAxisLabels.push(i === 0 ? "Now" : monthNames[d.getMonth()]);
        }
    } else if (timeRange === '1Y') {
        dataPoints = generateHistory(7, 0.05, 0.02);
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - (i * 2));
            xAxisLabels.push(i === 0 ? "Now" : monthNames[d.getMonth()]);
        }
    } else {
        dataPoints = generateHistory(5, 0.08, 0.05);
        const currentYear = new Date().getFullYear();
        xAxisLabels = [
            (currentYear - 3).toString(), 
            (currentYear - 2).toString(), 
            (currentYear - 1).toString(), 
            "Jan", 
            "Now"
        ];
    }

    return { dataPoints, xAxisLabels };
  }, [timeRange, stats.estimatedValue]);

  // Generate SVG Path
  const { pathD, fillD, lastPointY } = useMemo(() => {
      const { dataPoints } = chartData;
      if (dataPoints.length === 0) return { pathD: '', fillD: '', lastPointY: 0 };

      const max = Math.max(...dataPoints) * 1.05 || 100;
      const min = Math.min(...dataPoints) * 0.95 || 0;
      const height = 50;
      const width = 100;
      const padding = 5;
      const effectiveHeight = height - (padding * 2);
      const range = max - min || 1;

      const points = dataPoints.map((val, i) => {
          const x = (i / (dataPoints.length - 1)) * width;
          const normalizedY = (val - min) / range;
          const y = height - padding - (normalizedY * effectiveHeight);
          return { x, y };
      });

      let d = `M ${points[0].x},${points[0].y}`;
      points.slice(1).forEach(p => {
          d += ` L ${p.x},${p.y}`;
      });

      const fill = `${d} L ${width},${height} L 0,${height} Z`;
      
      return { pathD: d, fillD: fill, lastPointY: points[points.length - 1].y };
  }, [chartData]);

  const ranges: TimeRange[] = ['1M', '6M', '1Y', 'All'];

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-safe-pt pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400"
          >
            <Icon name="arrow_back" className="text-2xl" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Estimated Value</h1>
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
        {/* Main Value Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-surface-dark dark:to-background-dark rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#d4af37]/20 rounded-full blur-3xl"></div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-3">Total Estimated Value</h2>
          <div className="flex items-start justify-center gap-1 text-white">
            <span className="text-5xl font-bold tracking-tight text-white drop-shadow-sm">${stats.estimatedValue.toLocaleString()}</span>
            <span className="text-sm font-semibold text-[#d4af37] mt-2">USD</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <Icon name="trending_up" className="text-green-400 text-sm" />
            <span className="text-xs font-medium text-green-400">+5.2% this month</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between mb-2">
              <span className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Icon name="payments" className="text-xl" />
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">${avgPrice.toFixed(2)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg price per volume</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between mb-2">
              <span className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                <Icon name="emoji_events" className="text-xl" />
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{highestValueSeries.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Highest-value series</p>
          </div>
        </div>

        {/* Value Chart */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Value Over Time</h2>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 flex text-[10px] font-medium">
              {ranges.map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                        timeRange === r 
                        ? 'bg-white dark:bg-surface-dark shadow-sm text-slate-900 dark:text-white font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                      {r}
                  </button>
              ))}
            </div>
          </div>
          <div className="relative h-40 w-full">
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
              <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
            </div>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
              <defs>
                <linearGradient id="gradientGreen" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d={fillD} fill="url(#gradientGreen)"></path>
              <path d={pathD} fill="none" stroke="#22c55e" strokeLinecap="round" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
              <circle className="fill-green-500 stroke-white dark:stroke-surface-dark" cx="100" cy={lastPointY} r="3" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></circle>
            </svg>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
             {chartData.xAxisLabels.map((label, i) => (
                 <span key={i}>{label}</span>
             ))}
          </div>
        </div>

        {/* Most Valuable Collection List */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 pb-8">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Most Valuable Manga Collection</h2>
            <button 
                onClick={() => setSortDesc(!sortDesc)}
                className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded transition-colors"
            >
                <Icon name={sortDesc ? "arrow_downward" : "arrow_upward"} className="text-xs" />
                Value
            </button>
          </div>
          <div className="space-y-4">
            {seriesList.length > 0 ? seriesList.map((s) => (
                <div 
                    key={s.id} 
                    onClick={() => navigate(`/series/${s.id}`)}
                    className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 relative">
                            <img src={s.coverUrl} alt={s.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{s.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.volumes} Owned</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">${s.value.toLocaleString()}</p>
                    </div>
                </div>
            )) : (
                <div className="text-center py-6 text-slate-500 text-sm">No data available</div>
            )}
          </div>
        </div>
      </main>

      {/* Share Modal */}
        {isShareOpen && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsShareOpen(false)}>
                <div className="bg-background-light dark:bg-surface-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up border border-white/10" onClick={e => e.stopPropagation()}>
                     <h3 className="text-lg font-bold mb-4 text-center dark:text-white">Share Value</h3>
                     
                     <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-1 shadow-lg mb-6 transform transition-transform hover:scale-[1.02]">
                        <div className="bg-white dark:bg-surface-darker rounded-lg p-5 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                                <Icon name="payments" className="text-3xl text-green-500" />
                            </div>
                            <h4 className="font-bold text-lg dark:text-white leading-tight">Collection Valuation</h4>
                            <p className="text-slate-500 text-xs mt-1">Estimated Worth</p>
                            <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">${stats.estimatedValue.toLocaleString()}</p>
                            <div className="mt-4 flex gap-4 text-center w-full">
                                <div className="flex-1 p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-slate-400">Items</div>
                                    <div className="font-bold dark:text-white">{stats.totalVolumes}</div>
                                </div>
                                <div className="flex-1 p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-slate-400">Avg Price</div>
                                    <div className="font-bold dark:text-white">${avgPrice.toFixed(2)}</div>
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

export default ValueTracker;