import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const ScanOnboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-full w-full overflow-hidden flex flex-col relative selection:bg-primary selection:text-white animate-flow-enter">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
            <div className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale contrast-125"></div>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background-dark/90 via-background-dark/95 to-background-dark pointer-events-none"></div>
        
        <main className="relative z-10 flex flex-col h-full px-6 pt-safe-pt pb-safe-pb">
            {/* Visual Section */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative py-2 mt-2">
                <div className="absolute w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="relative w-40 sm:w-48 aspect-[9/23] max-h-[40vh] bg-slate-900 rounded-[2.25rem] border-[4px] border-slate-700 shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/50 z-10">
                    
                    {/* Dynamic Island / Notch */}
                    <div className="absolute top-0 left-0 right-0 h-6 z-30 flex justify-center items-start pt-2 pointer-events-none">
                        <div className="w-14 h-4 bg-black rounded-full"></div>
                    </div>

                    {/* Screen Content */}
                    <div className="flex-1 bg-slate-900 relative w-full h-full flex flex-col">
                        <div className="relative flex-1 overflow-hidden">
                             <img 
                                alt="Book spine view" 
                                className="w-full h-full object-cover opacity-60 scale-110" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB3bi7TPUx5C6fBE7_OcJGSGf4Y6-V91Fv3rbv2Xpzr2YKPE78Ndy4ouAsHiWdZbVEBgCdfA5ZjnVBR0nWnA6rRAxVKm18MUGMEyjX0bE5wKR_Vm7KMqhNxmNhbtF99hOahOZOpmKQV7JBvAjab8VmeeaQAIZxG5rg_8KZAQjudEBb-N08I84zzdtsSLCU04o_bwTVUqpaqNrZxnCtyBDarzkOSLg-7DJeiKeIZZqbKA_YfhPU3v0j9XjWhyAFEwj8DpY0jl2MSTo"
                            />
                            {/* Scanning Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-20 border-[1.5px] border-primary/90 rounded-xl relative">
                                    {/* Corner Markers */}
                                    <div className="absolute top-0 left-0 w-3 h-3 border-t-[3px] border-l-[3px] border-white -mt-0.5 -ml-0.5 rounded-tl-sm"></div>
                                    <div className="absolute top-0 right-0 w-3 h-3 border-t-[3px] border-r-[3px] border-white -mt-0.5 -mr-0.5 rounded-tr-sm"></div>
                                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-[3px] border-l-[3px] border-white -mb-0.5 -ml-0.5 rounded-bl-sm"></div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[3px] border-r-[3px] border-white -mb-0.5 -mr-0.5 rounded-br-sm"></div>
                                    
                                    {/* Scan Line */}
                                    <div className="absolute top-1/2 left-2 right-2 h-[2px] bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Card Notification */}
                        <div className="relative z-20 mx-2.5 mb-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-2xl shadow-lg transform translate-y-0 animate-slide-up border border-white/20">
                            <div className="w-8 h-1 bg-slate-200/80 rounded-full mx-auto mb-2"></div>
                            <div className="flex gap-2.5 items-center">
                                <div className="w-9 h-12 bg-slate-200 rounded-md shadow-sm flex-shrink-0 bg-[url('https://images.unsplash.com/photo-1626548307930-deac221f87d9?q=80&w=200&auto=format&fit=crop')] bg-cover border border-black/5"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 pr-1">
                                            <h4 className="text-[11px] font-bold text-slate-800 truncate">Berserk Vol. 1</h4>
                                            <p className="text-[9px] text-slate-500 font-medium">Kentaro Miura</p>
                                        </div>
                                        <Icon name="check_circle" className="text-green-500 text-xs" />
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold tracking-wide">Dark Fantasy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating QR Icon */}
                <div className="absolute top-[38%] right-8 bg-white p-2.5 rounded-2xl shadow-xl shadow-blue-500/20 transform rotate-12 animate-float z-20">
                    <Icon name="qr_code_scanner" className="text-primary text-xl" />
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-center text-center space-y-2 px-2 shrink-0 pb-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
                    <span className="text-blue-400">Scan</span> and catalog<br/>your collection
                </h2>
                <p className="text-sm text-slate-300 font-light leading-relaxed max-w-sm">
                    Add volumes instantly by scanning barcodes or covers.
                </p>
                
                <div className="flex flex-col w-full max-w-xs gap-2 mt-1">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                        <Icon name="filter_center_focus" className="text-primary text-sm" />
                        <span className="text-xs font-medium text-slate-200">Barcode & cover scanning</span>
                    </div>
                     <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                        <Icon name="edit" className="text-primary text-sm" />
                        <span className="text-xs font-medium text-slate-200">Manual edits anytime</span>
                    </div>
                </div>
            </div>

            {/* Footer with increased bottom padding */}
            <div className="flex flex-col items-center gap-3 w-full mt-auto shrink-0 pb-4">
                <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 transition-colors"></div>
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(17,82,212,0.8)] transition-all"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 transition-colors"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 transition-colors"></div>
                </div>
                <button 
                    onClick={() => navigate('/onboarding-progress')}
                    className="w-full py-3.5 px-6 bg-cream hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-base shadow-lg flex items-center justify-center group"
                >
                    <span>Continue</span>
                    <Icon name="arrow_forward" className="ml-2 text-xl group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </main>
    </div>
  );
};

export default ScanOnboarding;