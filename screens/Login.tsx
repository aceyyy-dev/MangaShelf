import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
      // Trigger animation after mount
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => navigate('/'), 500); // Match new duration
  };

  const handleDirectLogin = () => {
      login({ name: 'Collector', username: 'collector' });
      navigate('/home');
  };

  const handleFormLogin = (e: React.FormEvent) => {
      e.preventDefault();
      login({ name: 'Collector', username: 'collector' });
      navigate('/home');
  };

  return (
    <div 
        className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose} // Close on backdrop click
    >
        <div 
            className={`w-full bg-[#151C2C] rounded-t-[32px] border-t border-white/10 transition-transform duration-500 flex flex-col max-h-[90vh] ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            onClick={e => e.stopPropagation()} // Prevent close when clicking sheet
        >
            
            <div className="px-6 pt-2 pb-2 relative shrink-0">
                <div className="w-12 h-1.5 bg-slate-600 rounded-full mx-auto mb-6 opacity-50"></div>
                <button 
                    onClick={handleClose} 
                    className="absolute top-2 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                >
                    <Icon name="close" className="text-lg" />
                </button>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Log In</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-safe-pb">
                <div className="space-y-3 mb-6">
                    <button onClick={handleDirectLogin} className="w-full flex items-center justify-center space-x-3 bg-black text-white py-3.5 rounded-full font-medium hover:bg-gray-900 transition-colors border border-white/10">
                        <Icon name="apple" className="text-lg" />
                        <span>Continue with Apple</span>
                    </button>
                    <button onClick={handleDirectLogin} className="w-full flex items-center justify-center space-x-3 bg-white text-black border border-slate-200 py-3.5 rounded-full font-medium hover:bg-slate-50 transition-colors">
                        <Icon name="android" className="text-lg text-green-600" />
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>

                <form onSubmit={handleFormLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="sr-only" htmlFor="email">Email</label>
                        <input className="w-full bg-[#1F2937] border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" id="email" placeholder="Email" type="email" />
                    </div>
                    <div className="space-y-1 relative">
                        <label className="sr-only" htmlFor="password">Password</label>
                        <input className="w-full bg-[#1F2937] border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12" id="password" placeholder="Password" type="password" />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" type="button">
                            <span className="material-icons text-xl">visibility_off</span>
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-primary hover:text-blue-400 font-medium transition-colors">Forgot password?</button>
                    </div>
                    <button type="submit" className="w-full mt-2 py-4 px-6 bg-cream hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center">
                        <span>Log In</span>
                    </button>
                </form>

                <div className="py-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Don't have an account? 
                        <button onClick={() => navigate('/signup')} className="text-white hover:text-primary font-medium transition-colors ml-1">Get Started</button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;