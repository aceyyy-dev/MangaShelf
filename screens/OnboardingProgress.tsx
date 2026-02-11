import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const OnboardingProgress: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-full w-full overflow-hidden flex flex-col relative selection:bg-primary selection:text-white animate-flow-enter">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
            <div className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale contrast-125"></div>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background-dark/90 via-background-dark/95 to-background-dark pointer-events-none"></div>
        
        <main className="relative z-10 flex flex-col h-full px-6 pt-safe-pt pb-safe-pb">
            {/* Visual Section - Centered Card */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative py-4 mt-8">
                <div className="absolute w-64 h-64 bg-chart-teal/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                {/* Dashboard Card - Styled to match the Phone aesthetic but for stats */}
                <div className="relative w-60 aspect-[3/4] max-h-[48vh] bg-slate-900 rounded-[2.25rem] border-[1px] border-slate-700/50 shadow-2xl overflow-hidden flex flex-col z-10 ring-1 ring-black/50">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-20"></div>

                    {/* Content */}
                    <div className="p-5 flex flex-col h-full relative z-10">
                        {/* Header: Completion */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Completion</h3>
                                <div className="relative w-16 h-16">
                                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        <path className="text-primary" strokeDasharray="76, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">76%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-2">
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    <div className="text-[9px] text-slate-300">
                                        <div className="font-semibold leading-none mb-0.5">One Piece</div>
                                        <div className="text-slate-500 leading-none">Vol 98/104</div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                    <div className="text-[9px] text-slate-300">
                                        <div className="font-semibold leading-none mb-0.5">Berserk</div>
                                        <div className="text-slate-500 leading-none">Vol 14/41</div>
                                    </div>
                                 </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-800 w-full mb-4"></div>

                        {/* Middle: Library Growth Chart */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-end mb-3">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth</h3>
                                <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded font-bold">+12 vols</span>
                            </div>
                            <div className="flex-1 flex items-end gap-1.5 pb-2">
                                {/* Fake bars */}
                                {[30, 45, 40, 60, 75].map((h, i) => (
                                    <div key={i} className="flex-1 bg-slate-800 rounded-t-sm hover:bg-slate-700 transition-colors" style={{ height: `${h}%` }}></div>
                                ))}
                                <div className="flex-1 bg-chart-teal rounded-t-sm relative group" style={{ height: '90%' }}>
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-[8px] font-bold text-white px-1.5 py-0.5 rounded opacity-100 border border-slate-700">Oct</div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-center text-center space-y-4 px-2 shrink-0 pb-6">
                <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
                    Track <span className="text-chart-teal">progress</span> like a<br/>collector
                </h2>
                <p className="text-sm text-slate-300 font-light leading-relaxed max-w-sm">
                    See what you own, what you're missing, and how your library grows.
                </p>

                {/* Feature List (Replacing chips from previous screen) */}
                <div className="flex flex-col w-full max-w-xs gap-1 mt-1">
                     <div className="flex items-center gap-3 px-3 py-1.5">
                        <Icon name="check_circle" className="text-primary text-sm" />
                        <span className="text-xs font-medium text-slate-300">Series completion tracking</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1.5">
                         <Icon name="warning" className="text-yellow-500 text-sm" />
                        <span className="text-xs font-medium text-slate-300">Missing volume detection</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1.5">
                         <Icon name="trending_up" className="text-chart-teal text-sm" />
                        <span className="text-xs font-medium text-slate-300">Library growth insights</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center gap-4 w-full mt-auto shrink-0 pb-8">
                <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 transition-colors"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 transition-colors"></div>
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(17,82,212,0.8)] transition-all"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 transition-colors"></div>
                </div>

                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex-1 py-4 bg-slate-800/80 hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 rounded-full text-white font-bold text-lg border border-slate-700 backdrop-blur-sm"
                    >
                        Back
                    </button>
                    <button 
                        onClick={() => navigate('/paywall')}
                        className="flex-[2] py-4 bg-cream hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center group"
                    >
                        <span>Continue</span>
                        <Icon name="arrow_forward" className="ml-2 text-xl group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </main>
    </div>
  );
};

export default OnboardingProgress;