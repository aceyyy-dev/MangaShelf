import React, { useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';

const Insights: React.FC = () => {
  const navigate = useNavigate();
  const { series, volumes, stats } = useStore();
  const [range, setRange] = useState<'30d'|'90d'|'1y'|'All'>('30d');
  
  // AI State
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Data Calculations ---

  // 1. Growth Chart Data (Recharts) - Accurate Bucketing
  const growthData = useMemo(() => {
      const now = new Date();
      let startDate = new Date();
      
      // Determine Start Date
      if (range === '30d') startDate.setDate(now.getDate() - 30);
      else if (range === '90d') startDate.setDate(now.getDate() - 90);
      else if (range === '1y') startDate.setFullYear(now.getFullYear() - 1);
      else startDate = new Date(0); // All time

      const buckets = 6;
      const points = [];
      const totalTimeSpan = now.getTime() - startDate.getTime();
      const step = totalTimeSpan / (buckets - 1);

      // Handle "All" empty case
      let effectiveStart = startDate;
      if (range === 'All' && volumes.length > 0) {
           const earliest = volumes.reduce((acc, v) => {
              if (!v.isOwned || !v.dateAdded) return acc;
              const d = new Date(v.dateAdded).getTime();
              return d < acc ? d : acc;
          }, now.getTime());
          effectiveStart = new Date(earliest);
           // Ensure min span
          if (now.getTime() - effectiveStart.getTime() < 1000 * 60 * 60 * 24 * 7) {
               effectiveStart.setDate(effectiveStart.getDate() - 7);
          }
      }

      const pointsTimeSpan = now.getTime() - effectiveStart.getTime();
      const pointsStep = pointsTimeSpan / (buckets - 1);

      for (let i = 0; i < buckets; i++) {
          const t = new Date(effectiveStart.getTime() + pointsStep * i);
          
          // Force last point to be exactly now
          if (i === buckets - 1) t.setTime(now.getTime());

          let count = 0;
          if (range === 'All') {
              count = volumes.filter(v => v.isOwned && v.dateAdded && new Date(v.dateAdded) <= t).length;
          } else {
               // For specific ranges, we generally show cumulative growth *within* that range, 
               // OR cumulative total. Let's do cumulative total up to that point to match "Growth" concept.
              count = volumes.filter(v => v.isOwned && v.dateAdded && new Date(v.dateAdded) <= t).length;
          }

          let dateLabel = "";
          if (range === '1y' || range === 'All') {
              dateLabel = t.toLocaleDateString(undefined, { month: 'short' });
          } else {
              dateLabel = t.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }

          points.push({
              date: dateLabel,
              val: count
          });
      }
      
      return points;
  }, [volumes, range]);

  // 2. Series Completion Data
  const completionStats = useMemo(() => {
      const completed = series.filter(s => s.status === 'Completed').length;
      const reading = series.filter(s => s.status === 'Reading').length;
      const dropped = series.filter(s => s.status === 'Dropped').length;
      const total = series.length || 1;
      
      return {
          completed,
          reading,
          dropped,
          total,
          percentComplete: Math.round((completed / total) * 100)
      };
  }, [series]);

  // 3. Top Authors (Top 4)
  const topAuthors = useMemo(() => {
      const counts: Record<string, { count: number, title: string }> = {};
      volumes.filter(v => v.isOwned).forEach(v => {
          const s = series.find(ser => ser.id === v.seriesId);
          if (s && s.author) {
              if (!counts[s.author]) counts[s.author] = { count: 0, title: s.title };
              counts[s.author].count++;
          }
      });
      return Object.entries(counts)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 4)
          .map(([name, data]) => ({
              name,
              count: data.count,
              title: data.title,
              percent: Math.min(100, (data.count / volumes.length) * 100 * 3) // Scale up visual bar
          }));
  }, [series, volumes]);

  const handleAskAI = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAiResponse(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are Sensei, a wise manga guide. User asked: "${query}". 
        Context: They own ${volumes.length} volumes across ${series.length} series. 
        Top author: ${topAuthors[0]?.name || 'None'}. 
        Keep answer short, wise, and helpful.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        setAiResponse(response.text || "I cannot answer that right now.");
    } catch (e) {
        setAiResponse("My connection is weak.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 pt-safe-pt pb-4">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Insights</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">MangaShelf Plus</p>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors text-slate-500 dark:text-slate-400">
                <Icon name="download" />
            </button>
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 space-y-6">
        {/* Time Range Selector */}
        <div className="bg-slate-200 dark:bg-surface-dark p-1 rounded-xl flex justify-between text-sm font-medium">
            {(['30d', '90d', '1y', 'All'] as const).map((r) => (
                <button 
                    key={r}
                    onClick={() => setRange(r)}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${range === r ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    {r}
                </button>
            ))}
        </div>

        {/* Collection Growth Card */}
        <div 
            onClick={() => navigate('/collection-growth')}
            className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative cursor-pointer hover:border-primary/30 transition-all group"
        >
            <div className="absolute top-5 right-5 text-slate-400 dark:text-slate-500">
                <Icon name="chevron_right" className="text-xl group-hover:text-primary transition-colors" />
            </div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Collection Growth</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{volumes.length}</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex items-center ${stats.monthlyGrowth > 0 ? 'bg-chart-teal/10 text-chart-teal' : 'bg-slate-100 text-slate-500'}`}>
                            <Icon name="trending_up" className="text-[12px] mr-0.5" /> +{stats.monthlyGrowth}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Volumes added vs previous period</p>
                </div>
            </div>
            
            <div className="relative h-48 w-full pointer-events-none">
                {/* Dashed Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700/50 w-full h-0"></div>
                </div>
                
                {/* Recharts Area Chart */}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                        <defs>
                            <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1978e5" stopOpacity={0.2}/>
                                <stop offset="100%" stopColor="#1978e5" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="val" 
                            stroke="#1978e5" 
                            strokeWidth={2} 
                            fill="url(#gradientPrimary)" 
                            dot={{ r: 3, fill: '#1978e5', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#1978e5', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                {growthData.map((p, i) => (
                    <span key={i}>{p.date}</span>
                ))}
            </div>
        </div>

        {/* Series Completion Card */}
        <div 
            onClick={() => navigate('/series-completion')}
            className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative cursor-pointer hover:border-primary/30 transition-all group"
        >
             <div className="absolute top-5 right-5 text-slate-400 dark:text-slate-500">
                <Icon name="chevron_right" className="text-xl group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Series Completion</h2>
            <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Background Circle */}
                        <path className="text-slate-100 dark:text-slate-700/30" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        {/* Completed Segment (Teal) */}
                        <path 
                            className="text-chart-teal drop-shadow-lg transition-all duration-1000" 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeDasharray={`${completionStats.percentComplete}, 100`} 
                            strokeLinecap="round" 
                            strokeWidth="3"
                        ></path>
                        {/* Reading Segment (Yellow - as requested) */}
                        {completionStats.reading > 0 && (
                            <path 
                                className="text-yellow-500 transition-all duration-1000" 
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeDasharray={`${Math.round((completionStats.reading / completionStats.total) * 100)}, 100`} 
                                strokeDashoffset={`-${completionStats.percentComplete + 5}`} // Gap offset
                                strokeLinecap="round" 
                                strokeWidth="3"
                            ></path>
                        )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{completionStats.percentComplete}%</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Complete</span>
                    </div>
                </div>
                
                <div className="flex-1 space-y-3">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-chart-teal"></span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Complete</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{completionStats.completed} Series</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-1.5">
                            <div className="bg-chart-teal h-1.5 rounded-full" style={{ width: `${completionStats.percentComplete}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Reading</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{completionStats.reading} Series</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-1.5">
                            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(completionStats.reading / completionStats.total) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Dropped</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{completionStats.dropped} Series</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Top Authors Card */}
        <div 
            onClick={() => navigate('/top-authors')}
            className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative cursor-pointer hover:border-primary/30 transition-all group"
        >
            <div className="absolute top-5 right-5 text-slate-400 dark:text-slate-500">
                <Icon name="chevron_right" className="text-xl group-hover:text-primary transition-colors" />
            </div>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Authors</h2>
                <button onClick={(e) => { e.stopPropagation(); navigate('/top-authors'); }} className="text-xs font-semibold text-primary hover:text-primary/80 dark:text-blue-400 mr-5">View All</button>
            </div>
            <div className="space-y-4">
                {topAuthors.map((author, idx) => (
                    <div key={idx} className="group/bar">
                        <div className="flex justify-between items-end mb-1 text-sm">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{author.name}</span>
                            <span className="font-mono text-slate-500 dark:text-slate-400 text-xs">{author.count} Vols</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700/30 rounded-full h-2">
                            <div className="bg-primary dark:bg-primary h-2 rounded-full relative" style={{ width: `${author.percent}%` }}>
                                <div className="hidden group-hover/bar:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap z-10">
                                    {author.title}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {topAuthors.length === 0 && <div className="text-sm text-slate-500 text-center py-2">No data yet</div>}
            </div>
        </div>

        {/* Estimated Value Card */}
        <div onClick={() => navigate('/value-tracker')} className="bg-gradient-to-br from-surface-dark to-background-dark dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all group">
            <div className="absolute top-5 right-5 text-white/50">
                <Icon name="chevron_right" className="text-xl group-hover:text-primary transition-colors" />
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Estimated Value</h2>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">${stats.estimatedValue.toLocaleString()}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">USD</span>
            </div>
            <div className="mt-4 flex gap-2">
                <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                    Avg Vol: ${(stats.estimatedValue / (volumes.length || 1)).toFixed(2)}
                </span>
            </div>
        </div>

        {/* Sensei AI Card */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/5 dark:to-transparent rounded-2xl p-5 border border-primary/20 dark:border-primary/20 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(25,120,229,0.3)] border border-primary/30">
                        <img 
                            alt="Sensei Owl Avatar" 
                            className="w-full h-full object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW_oT8qiDyhpFrthBaA806F4EOzx200n-m2b8lrN4_XsN5lc0kkMXdR2a6BSbi2_sPQl5qjHZdhysGzrM4hICZsS05Bu5QSBkHS2Zs2D3sjcu-JC7J7WlklrhkC7Vdy9ADsaRgSeGCCIuPYf_RPNaQA6sQ7DyZy1ZK-Sx1gR2wpIfoXVgHnJX_jd3EW8Jsn_DgOtBuqXs8IL9RMeonbbCUtJf-6mM2m9baRhoi6wZMt3WngeVBf3SC1XzlDOs7wF1wVWha_sYOVOw"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-surface-dark flex items-center justify-center">
                        <Icon name="smart_toy" className="text-[10px] text-white" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sensei</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white uppercase tracking-wider">Beta</span>
                    </div>
                    {aiResponse ? (
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-4 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-primary/10 animate-fade-in">{aiResponse}</p>
                    ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Your personal manga guide. Ask me anything about your collection or new series.
                        </p>
                    )}
                    
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full py-2 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                                placeholder={loading ? "Thinking..." : "Ask Sensei..."} 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                                disabled={loading}
                            />
                        </div>
                        <button 
                            onClick={handleAskAI}
                            disabled={loading || !query.trim()}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full p-2 flex items-center justify-center transition-colors shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            <Icon name={loading ? "hourglass_empty" : "send"} className={`text-sm ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;