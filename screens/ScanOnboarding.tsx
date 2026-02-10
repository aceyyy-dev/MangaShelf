import React from 'react';
import { useNavigate } from 'react-router-dom';

const ScanOnboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-full w-full overflow-hidden flex flex-col relative selection:bg-primary selection:text-white">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
            <div className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale contrast-125"></div>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background-dark/90 via-background-dark/95 to-background-dark pointer-events-none"></div>
        
        <main className="relative z-10 flex flex-col h-full px-6 pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="h-8 shrink-0"></div>
            
            {/* Visual Content - Middle */}
            <div className="flex-grow flex items-center justify-center relative my-4">
                <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
                
                {/* Book Spine / Card Container */}
                <div className="relative w-64 h-[420px] bg-slate-800 rounded-[2.5rem] border-[6px] border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                    {/* Notch */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-black/20 z-20 flex justify-center items-center">
                        <div className="w-20 h-4 bg-black rounded-b-xl"></div>
                    </div>
                    
                    {/* Screen Content - Scan View */}
                    <div className="flex-1 bg-slate-900 relative">
                        <img 
                            alt="Book spine view" 
                            className="w-full h-full object-cover opacity-60" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB3bi7TPUx5C6fBE7_OcJGSGf4Y6-V91Fv3rbv2Xpzr2YKPE78Ndy4ouAsHiWdZbVEBgCdfA5ZjnVBR0nWnA6rRAxVKm18MUGMEyjX0bE5wKR_Vm7KMqhNxmNhbtF99hOahOZOpmKQV7JBvAjab8VmeeaQAIZxG5rg_8KZAQjudEBb-N08I84zzdtsSLCU04o_bwTVUqpaqNrZxnCtyBDarzkOSLg-7DJeiKeIZZqbKA_YfhPU3v0j9XjWhyAFEwj8DpY0jl2MSTo"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-32 border-2 border-primary/70 rounded-lg relative">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white -mt-0.5 -ml-0.5"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white -mt-0.5 -mr-0.5"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white -mb-0.5 -ml-0.5"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white -mb-0.5 -mr-0.5"></div>
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Sheet Popup in Phone */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.3)] transform translate-y-2">
                        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3"></div>
                        <div className="flex gap-3 items-start">
                            <div className="w-10 h-14 bg-slate-200 rounded shadow-sm flex-shrink-0 bg-[url('https://images.unsplash.com/photo-1626548307930-deac221f87d9?q=80&w=200&auto=format&fit=crop')] bg-cover"></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 truncate">Berserk Vol. 1</h4>
                                        <p className="text-[10px] text-slate-500">Kentaro Miura</p>
                                    </div>
                                    <span className="material-icons text-green-500 text-sm">check_circle</span>
                                </div>
                                <div className="mt-2 flex gap-1">
                                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">Dark Fantasy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Floating Action Icon */}
                <div className="absolute -right-2 top-1/3 bg-white p-2 rounded-xl shadow-lg shadow-blue-500/20 transform rotate-12">
                    <span className="material-icons text-primary text-2xl">qr_code_scanner</span>
                </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center text-center mb-8 space-y-3 px-2">
                <h2 className="text-3xl font-extrabold text-white leading-tight">
                    <span className="text-[#60A5FA]">Scan</span> and catalog<br/>your collection
                </h2>
                <p className="text-base text-slate-300 font-light leading-relaxed max-w-sm">
                    Add volumes instantly by scanning barcodes or covers.
                </p>
                <div className="grid grid-cols-1 gap-3 w-full max-w-xs mt-6">
                    <div className="flex items-center space-x-3 bg-slate-800/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                        <div className="bg-primary/20 p-1.5 rounded-lg text-primary flex items-center justify-center">
                            <span className="material-icons text-sm">filter_center_focus</span>
                        </div>
                        <span className="text-sm text-slate-200 font-medium">Barcode & cover scanning</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-800/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                        <div className="bg-primary/20 p-1.5 rounded-lg text-primary flex items-center justify-center">
                            <span className="material-icons text-sm">edit</span>
                        </div>
                        <span className="text-sm text-slate-200 font-medium">Manual edits anytime</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-800/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                        <div className="bg-primary/20 p-1.5 rounded-lg text-primary flex items-center justify-center">
                            <span className="material-icons text-sm">shelves</span>
                        </div>
                        <span className="text-sm text-slate-200 font-medium">Clean shelf organization</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col items-center gap-6 w-full mt-auto">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(17,82,212,0.8)]"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                </div>
                <button 
                    onClick={() => navigate('/home')}
                    className="w-full py-4 px-6 bg-[#F5E6CA] hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center group"
                >
                    <span>Get Started</span>
                    <span className="material-icons ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <div className="h-4"></div>
            </div>
        </main>
    </div>
  );
};

export default ScanOnboarding;