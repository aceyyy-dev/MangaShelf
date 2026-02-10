import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col relative bg-background-light dark:bg-background-dark overflow-hidden selection:bg-primary selection:text-white font-display">
      {/* Background Texture with Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay">
        <div 
            className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale contrast-125"
            aria-hidden="true"
        ></div>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background-dark/80 via-background-dark/95 to-background-dark pointer-events-none"></div>

      <main className="relative z-10 flex flex-col h-full px-8 pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Header with SVG Logo */}
        <header className="flex flex-col items-center justify-center pt-8 pb-4 animate-fade-in">
           <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30 mb-4 shadow-[0_0_20px_rgba(17,82,212,0.4)] relative overflow-hidden group">
             <div className="absolute inset-0 bg-primary/10 blur-xl opacity-50"></div>
             {/* Custom SVG Logo */}
             <svg className="text-primary w-12 h-12 relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect height="20" rx="4" stroke="currentColor" strokeWidth="2.5" width="20" x="2" y="2"></rect>
                <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" width="2.8" x="6" y="6"></rect>
                <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" width="2.8" x="10.5" y="6"></rect>
                <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" transform="rotate(15 16.5 12)" width="2.8" x="15" y="6"></rect>
             </svg>
           </div>
           <h1 className="text-2xl font-bold tracking-widest uppercase text-white">MangaShelf</h1>
        </header>

        {/* Spacer to push content down */}
        <div className="flex-grow"></div>
        
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        {/* Text Content */}
        <div className="flex flex-col items-start mb-10 space-y-4 relative z-20">
             <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
                Your manga collection, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">beautifully organized.</span>
            </h2>
            <p className="text-lg text-slate-300 font-light leading-relaxed max-w-xs">
                Scan, track, and grow your library—without spreadsheets.
            </p>
        </div>

        {/* Actions & Pagination */}
        <div className="flex flex-col items-center gap-8 w-full">
            {/* Pagination Dots (Static) */}
            <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(17,82,212,0.8)]"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            </div>

            <button 
                onClick={() => navigate('/signup')}
                className="w-full py-4 px-6 bg-[#F5E6CA] hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center group"
            >
                <span>Get Started</span>
                <span className="material-icons ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors pb-2">
                Already have an account? <span className="text-primary hover:underline">Log in</span>
            </button>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;