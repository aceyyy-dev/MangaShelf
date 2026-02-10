import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../StoreContext';

const UsernameSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  // Basic mock auth details passed from previous screen or defaults
  const email = location.state?.email || 'collector@example.com';

  useEffect(() => {
    // Trigger animation after mount with a slight delay
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFinish = () => {
      const finalUsername = username.trim() || email.split('@')[0] || "Collector";
      login({ name: 'Collector', username: finalUsername });
      // Go to the Scan Onboarding screen as the next step
      navigate('/onboarding-scan');
  };

  const handleBack = () => {
      setIsVisible(false);
      setTimeout(() => navigate(-1), 300);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-full w-full overflow-hidden flex flex-col relative selection:bg-primary selection:text-white">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay">
            <div className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale contrast-125"></div>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background-dark/80 via-background-dark/95 to-background-dark pointer-events-none"></div>
        
        {/* Background Content (Blurred) with fade transition */}
        <main className={`relative z-10 flex flex-col h-full px-8 pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))] pointer-events-none select-none transition-all duration-500 ease-out ${isVisible ? 'opacity-40 blur-[2px]' : 'opacity-100 blur-none'}`}>
            <header className="flex flex-col items-center justify-center pt-8 pb-4">
                <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30 mb-4 shadow-[0_0_20px_rgba(17,82,212,0.4)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/10 blur-xl opacity-50"></div>
                    <svg className="text-primary w-12 h-12 relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect height="20" rx="4" stroke="currentColor" strokeWidth="2.5" width="20" x="2" y="2"></rect>
                        <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" width="2.8" x="6" y="6"></rect>
                        <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" width="2.8" x="10.5" y="6"></rect>
                        <rect fill="currentColor" fillOpacity="0.8" height="12" rx="0.5" transform="rotate(15 16.5 12)" width="2.8" x="15" y="6"></rect>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold tracking-widest uppercase text-white">MangaShelf</h1>
            </header>
            <div className="flex-grow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            <div className="flex flex-col items-start mb-10 space-y-4">
                <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
                    Your manga collection, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">beautifully organized.</span>
                </h2>
                <p className="text-lg text-slate-300 font-light leading-relaxed max-w-xs">
                    Scan, track, and grow your library—without spreadsheets.
                </p>
            </div>
            <div className="flex flex-col items-center gap-8 w-full">
                <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(17,82,212,0.8)]"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                </div>
            </div>
        </main>

        {/* Username Setup Sheet */}
        <div className={`absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-full bg-[#0B1019] rounded-t-[32px] pt-8 px-8 border-t border-white/5 shadow-2xl relative transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) pb-[max(5rem,env(safe-area-inset-bottom))] ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-700/50 rounded-full"></div>
                
                <button 
                    onClick={handleBack}
                    className="flex items-center text-slate-400 hover:text-white transition-colors mb-6 group"
                >
                    <span className="material-icons text-xl mr-1 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-sm font-medium">Back</span>
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Choose a username</h2>
                    <p className="text-slate-400 text-sm font-light">This will be visible on your profile.</p>
                </div>

                <div className="mb-10 w-full">
                    <div className="relative group">
                        <span className="absolute left-0 top-3 text-slate-500 text-xl font-medium">@</span>
                        <input 
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            className="w-full bg-transparent border-0 border-b-2 border-slate-700 focus:border-primary focus:ring-0 text-white text-3xl font-bold placeholder:text-slate-700 pl-8 pr-4 py-2 transition-colors duration-200" 
                            placeholder="username" 
                            type="text"
                        />
                    </div>
                    <p className="mt-4 text-xs text-slate-500 flex items-start gap-2">
                        <span className="material-icons text-sm mt-0.5">info</span>
                        Usernames must be unique and contain no spaces.
                    </p>
                </div>

                <button 
                    onClick={handleFinish}
                    className="w-full py-4 px-6 bg-[#F5E6CA] hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center mb-2"
                >
                    <span>Finish Setup</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default UsernameSetup;