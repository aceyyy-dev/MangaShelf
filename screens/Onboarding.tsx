import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Icon from '../components/Icon';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-full w-full overflow-hidden flex flex-col relative selection:bg-primary selection:text-white">
        <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay">
            <div className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale contrast-125"></div>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background-dark/80 via-background-dark/95 to-background-dark pointer-events-none"></div>

        <main className="relative z-10 flex flex-col h-full px-6 md:px-8 pt-safe-pt pb-safe-pb max-w-3xl mx-auto w-full">
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                <header className="flex flex-col items-center justify-center mb-12 animate-fade-in-down">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30 mb-6 shadow-[0_0_20px_rgba(17,82,212,0.4)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-50"></div>
                        <svg className="text-primary w-10 h-10 md:w-12 md:h-12 relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <rect height="20" rx="4" stroke="currentColor" strokeWidth="2.5" width="20" x="2" y="2"></rect>
                            <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" width="2.8" x="6" y="6"></rect>
                            <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" width="2.8" x="10.5" y="6"></rect>
                            <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" transform="rotate(15 16.5 12)" width="2.8" x="15" y="6"></rect>
                        </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-white">MangaShelf</h1>
                </header>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-primary rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

                <div className="flex flex-col items-start space-y-4 px-2">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                        Your manga collection, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">beautifully organized.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-xs md:max-w-md">
                        Scan, track, and grow your library—without spreadsheets.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-6 w-full pt-8 pb-4 shrink-0">
                <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(17,82,212,0.8)]"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                </div>
                
                <div className="w-full space-y-4">
                    <button 
                        onClick={() => navigate('/signup')}
                        className="w-full py-4 px-6 bg-cream hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center group"
                    >
                        <span>Get Started</span>
                        <span className="material-icons ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full text-sm font-medium text-slate-400 hover:text-white transition-colors pb-2"
                    >
                        Already have an account? <span className="text-primary hover:underline">Log in</span>
                    </button>
                </div>
            </div>
            
            {/* Nested Routes (Login/Signup modals) will render here */}
            <Outlet />
        </main>
    </div>
  );
};

export default Onboarding;