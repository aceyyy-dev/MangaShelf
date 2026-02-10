import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      // Simulate network request
      setTimeout(() => {
          setIsSent(true);
          setIsLoading(false);
      }, 1500);
  };

  return (
    <div className="h-full w-full flex flex-col relative bg-background-dark overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale opacity-10"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/95 to-background-dark/80"></div>
        </div>

        {/* Back Button */}
        <div className="absolute top-0 left-0 z-50 pt-safe-pt px-6 py-4">
            <button 
                onClick={() => navigate('/login')} 
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
            >
                <Icon name="arrow_back" type="round" className="text-xl" />
            </button>
        </div>

        <div className="relative z-10 flex flex-col h-full px-6 pt-safe-pt pb-safe-pb justify-center">
            {isSent ? (
                <div className="text-center w-full max-w-sm mx-auto animate-fade-in">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                        <Icon name="mark_email_read" className="text-green-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        We've sent password reset instructions to <br/>
                        <span className="text-white font-medium">{email}</span>
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all rounded-xl text-white font-bold"
                    >
                        Back to Log In
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-8 text-center w-full max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                            <Icon name="lock_reset" className="text-primary text-3xl" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-slate-400">Enter your email to receive reset instructions</p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-4 w-full max-w-sm mx-auto">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Icon name="mail" className="text-slate-500 text-lg group-focus-within:text-primary transition-colors" />
                                </div>
                                <input 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" 
                                    placeholder="otaku@example.com" 
                                    type="email" 
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading || !email}
                            className="w-full py-4 bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all rounded-xl text-white font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <span>Send Reset Link</span>
                            )}
                        </button>
                    </form>
                </>
            )}
        </div>
    </div>
  );
};

export default ForgotPassword;