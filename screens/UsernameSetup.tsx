import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../StoreContext';
import Icon from '../components/Icon';

const UsernameSetup: React.FC = () => {
  const navigate = useNavigate();
  const { setTempUserData } = useStore();
  const [username, setUsername] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay to allow mounting before animating in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleFinish = () => {
      // Basic validation
      if (!username.trim()) return;
      
      // Do NOT log in yet, just save temp data and go to next onboarding step
      setTempUserData({ username: username, name: username }); // Default name to username
      
      // Navigate to the next onboarding page (Scan Onboarding) instead of Home
      navigate('/scan-onboarding');
  };

  const handleBack = () => {
      setIsVisible(false);
      setTimeout(() => navigate(-1), 500); // Wait for animation
  };

  return (
    <div 
        className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleBack}
    >
        <div 
            className={`w-full bg-[#151c2b] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5 pt-6 px-6 pb-safe-pb flex flex-col max-h-[90vh] transition-transform duration-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            onClick={e => e.stopPropagation()}
        >
            <div className="w-12 h-1.5 bg-slate-600/40 rounded-full mx-auto mb-8"></div>

            <button onClick={handleBack} className="flex items-center text-slate-400 hover:text-white transition-colors mb-6 group self-start">
                <Icon name="arrow_back" className="text-xl mr-1 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
            </button>

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Choose a username</h2>
                <p className="text-slate-400 text-base">This will be visible on your profile.</p>
            </div>

            <div className="mb-10 w-full">
                <div className="relative group">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 text-2xl font-medium transition-colors group-focus-within:text-primary">@</span>
                    <input 
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        className="w-full bg-transparent border-0 border-b-2 border-slate-700 focus:border-primary focus:ring-0 text-white text-3xl font-bold placeholder:text-slate-700 pl-8 pr-4 py-2 transition-all duration-200" 
                        placeholder="username" 
                        type="text"
                    />
                </div>
                <p className="mt-4 text-xs text-slate-500 flex items-start gap-2">
                    <Icon name="info" className="text-sm mt-0.5" />
                    Usernames must be unique and contain no spaces.
                </p>
            </div>

            <div className="mt-auto pb-6">
                <button 
                    onClick={handleFinish}
                    disabled={!username.length}
                    className={`w-full py-4 px-6 rounded-full font-bold text-lg shadow-lg flex items-center justify-center transition-all duration-300 ${
                        username.length 
                        ? 'bg-cream hover:bg-[#ebdcb0] active:scale-[0.98] text-background-dark' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    <span>Finish Setup</span>
                    <Icon name="check" className="ml-2 text-xl" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default UsernameSetup;