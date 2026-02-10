import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
      // Trigger animation shortly after mount
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
  }, []);

  const handleSignup = (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword) {
          alert("Passwords do not match");
          return;
      }
      setIsLoading(true);
      // Simulate network request
      setTimeout(() => {
          setIsLoading(false);
          // Pass email state to the next screen if needed
          navigate('/username-setup', { state: { email } });
      }, 1000);
  };

  const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => navigate('/'), 250); // Match animation duration
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-full w-full overflow-hidden flex flex-col relative selection:bg-primary selection:text-white">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
            <div className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale contrast-125" data-alt="Abstract manga panel layout lines and screentones texture"></div>
        </div>
        <div className="absolute inset-0 z-0 bg-background-dark/90 backdrop-blur-md pointer-events-none"></div>

        {/* Header Content (Background Layer) with Smooth Fade Transition */}
        <main 
            aria-hidden="true" 
            className={`relative z-0 flex flex-col h-full px-8 pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))] pointer-events-none transition-all duration-500 ease-in-out ${isVisible ? 'opacity-30 blur-sm' : 'opacity-100 blur-none'}`}
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
        </main>

        {/* Bottom Sheet - Faster Animation (duration-200) */}
        <div 
            className={`absolute inset-x-0 bottom-0 z-50 flex flex-col justify-end transition-transform duration-200 cubic-bezier(0.2, 0.8, 0.2, 1) ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        >
            <div className="w-full bg-[#151c2b] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5 pt-2 pb-8 px-6 safe-area-bottom h-[85vh] overflow-y-auto no-scrollbar relative">
                {/* Close Button Inside Sheet */}
                <button 
                    onClick={handleClose} 
                    className="absolute top-6 left-6 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                >
                    <Icon name="close" className="text-lg" />
                </button>

                <div className="w-full flex justify-center mb-6 pt-2">
                    <div className="w-12 h-1.5 bg-slate-600/40 rounded-full"></div>
                </div>
                
                <div className="flex flex-col h-full pb-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                        <p className="text-slate-400 text-sm">Start tracking your premium collection</p>
                    </div>

                    {/* Social Logins */}
                    <div className="flex flex-col space-y-3 mb-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/username-setup')}
                            className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center space-x-3 transition-colors group"
                        >
                            <svg aria-hidden="true" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                            </svg>
                            <span className="text-white font-medium text-sm">Continue with Google</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => navigate('/username-setup')}
                            className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center space-x-3 transition-colors group"
                        >
                            <svg aria-hidden="true" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"></path>
                            </svg>
                            <span className="text-white font-medium text-sm">Continue with Apple</span>
                        </button>
                    </div>

                    <div className="relative flex items-center py-4 mb-6">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">or</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <form onSubmit={handleSignup} className="flex flex-col space-y-4 mb-8">
                        <div className="group">
                            <label className="sr-only" htmlFor="email">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-icons text-slate-500 group-focus-within:text-primary transition-colors text-xl">mail</span>
                                </div>
                                <input 
                                    className="block w-full pl-11 pr-4 py-4 bg-background-dark border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium" 
                                    id="email" 
                                    placeholder="Email address" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="sr-only" htmlFor="password">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-icons text-slate-500 group-focus-within:text-primary transition-colors text-xl">lock</span>
                                </div>
                                <input 
                                    className="block w-full pl-11 pr-12 py-4 bg-background-dark border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium" 
                                    id="password" 
                                    placeholder="Password" 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div 
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-icons text-slate-500 hover:text-slate-300 transition-colors text-xl">
                                        {showPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="sr-only" htmlFor="confirm-password">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-icons text-slate-500 group-focus-within:text-primary transition-colors text-xl">verified_user</span>
                                </div>
                                <input 
                                    className="block w-full pl-11 pr-12 py-4 bg-background-dark border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium" 
                                    id="confirm-password" 
                                    placeholder="Confirm Password" 
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <div 
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <span className="material-icons text-slate-500 hover:text-slate-300 transition-colors text-xl">
                                        {showConfirmPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-[#F5E6CA] hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center group mb-4 mt-auto"
                        >
                            {isLoading ? 'Creating Account...' : 'Continue'}
                        </button>
                    </form>

                    <div className="mt-auto">
                        <p className="text-center text-xs text-slate-500">
                            By signing up, you agree to our <a className="text-slate-400 underline hover:text-primary transition-colors" href="#">Terms</a> and <a className="text-slate-400 underline hover:text-primary transition-colors" href="#">Privacy Policy</a>.
                        </p>
                        <p className="text-center text-sm text-slate-500 mt-4">
                            Already have an account? <button onClick={() => navigate('/login')} className="text-white font-bold hover:underline">Log In</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Signup;