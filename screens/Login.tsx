import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
      // Trigger animation shortly after mount for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      // Simulate network request
      setTimeout(() => {
          setIsLoading(false);
          // Log in and go directly to home (skip onboarding steps for existing users)
          login({ name: 'Collector', username: 'collector' });
          navigate('/home');
      }, 1500);
  };

  const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => navigate('/'), 300); // Wait for animation to finish
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-full w-full overflow-hidden flex flex-col relative selection:bg-primary selection:text-white">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay">
            <div 
                className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale contrast-125" 
                data-alt="Abstract manga panel layout lines and screentones texture"
            ></div>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background-dark/80 via-background-dark/95 to-background-dark pointer-events-none"></div>
        
        {/* Background Header Content (Blurred behind popup) */}
        <main 
            className={`relative z-0 flex flex-col h-full px-8 pt-12 safe-area-bottom pointer-events-none transition-all duration-500 ease-out ${isVisible ? 'opacity-40 blur-[2px] scale-95' : 'opacity-100 blur-none scale-100'}`}
        >
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
                <button className="w-full py-4 px-6 bg-[#F5E6CA] rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center">
                    <span>Get Started</span>
                </button>
            </div>
        </main>

        {/* Bottom Sheet */}
        <div 
            className={`absolute inset-x-0 bottom-0 z-50 flex flex-col justify-end transition-transform duration-300 cubic-bezier(0.32, 0.72, 0, 1) ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        >
            <div className="w-full bg-[#151C2C] rounded-t-[32px] p-6 pb-10 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar relative">
                
                {/* Close Button Inside Sheet - Moves with the sheet */}
                <button 
                    onClick={handleClose} 
                    className="absolute top-6 left-6 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                >
                    <Icon name="close" className="text-lg" />
                </button>

                <div className="w-12 h-1.5 bg-slate-600/40 rounded-full mx-auto mb-6"></div>
                
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Log in to MangaShelf</h2>
                
                <div className="space-y-3 mb-6">
                    <button 
                        onClick={() => navigate('/username-setup')}
                        className="w-full flex items-center justify-center space-x-3 bg-black text-white py-3.5 rounded-full font-medium hover:bg-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.16 4.12-.74 1.7.27 2.86 1.12 3.52 2.06-2.92 1.72-2.39 5.86.32 7.02-.74 1.6-1.78 2.87-3.04 3.89zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path></svg>
                        <span>Continue with Apple</span>
                    </button>
                    <button 
                        onClick={() => navigate('/username-setup')}
                        className="w-full flex items-center justify-center space-x-3 bg-white text-black border border-slate-200 py-3.5 rounded-full font-medium hover:bg-slate-50 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="sr-only" htmlFor="email">Email</label>
                        <input 
                            className="w-full bg-[#1F2937] border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                            id="email" 
                            placeholder="Email" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1 relative">
                        <label className="sr-only" htmlFor="password">Password</label>
                        <input 
                            className="w-full bg-[#1F2937] border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12" 
                            id="password" 
                            placeholder="Password" 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <span className="material-icons-outlined text-xl">
                                {showPassword ? "visibility" : "visibility_off"}
                            </span>
                        </button>
                    </div>
                    
                    <div className="flex justify-end">
                        <button 
                            type="button"
                            onClick={() => navigate('/forgot-password')} 
                            className="text-sm text-primary hover:text-blue-400 font-medium transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 py-4 px-6 bg-[#F5E6CA] hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center"
                    >
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Don't have an account? 
                        <button onClick={() => navigate('/signup')} className="text-white hover:text-primary font-medium transition-colors ml-1">
                            Get Started
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;