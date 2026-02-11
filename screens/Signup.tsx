import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { supabase } from '../supabase';
import { useStore } from '../StoreContext';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { setTempUserData } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
      // Trigger animation after mount
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => navigate('/'), 500); // Match new duration
  };

  const handleContinue = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!email || !password) {
          setError('Please fill in all fields');
          return;
      }

      if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
      }

      setLoading(true);

      try {
          const { data, error: signupError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                  emailRedirectTo: `${window.location.origin}/auth/confirm`,
              },
          });

          if (signupError) throw signupError;

          if (data.user) {
              if (data.session) {
                  setTempUserData({ name: email.split('@')[0] });
                  navigate('/username-setup');
              } else {
                  setEmailSent(true);
              }
          }
      } catch (err: any) {
          setError(err.message || 'Failed to create account');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div 
        className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
    >
        <div 
            className={`w-full bg-[#151c2b] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5 pt-2 flex flex-col max-h-[90vh] transition-transform duration-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            onClick={e => e.stopPropagation()}
        >
            
            <div className="px-6 pb-2 pt-2 relative shrink-0">
                <div className="w-full flex justify-center mb-6">
                    <div className="w-12 h-1.5 bg-slate-600/40 rounded-full"></div>
                </div>
                <button 
                    onClick={handleClose} 
                    className="absolute top-2 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                >
                    <Icon name="close" className="text-lg" />
                </button>
                
                <div className="text-center mb-2">
                    <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
                    <p className="text-slate-400 text-sm">Start tracking your collection</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-safe-pb">
                {emailSent ? (
                    <div className="text-center py-8 animate-fade-in">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                            <Icon name="mark_email_read" className="text-primary text-4xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Check your email</h3>
                        <p className="text-slate-400 mb-4 leading-relaxed">
                            We've sent a confirmation link to<br/>
                            <span className="text-white font-medium">{email}</span>
                        </p>
                        <p className="text-sm text-slate-500 mb-8">
                            Click the link in the email to confirm your account and continue setup.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all rounded-xl text-white font-bold"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col space-y-3 mb-6">
                            <button onClick={() => navigate('/username-setup')} className="w-full py-3.5 px-4 bg-[#1F2937] hover:bg-[#2d3748] border border-white/10 rounded-full flex items-center justify-center space-x-3 transition-colors group">
                                <Icon name="android" className="text-white text-lg" />
                                <span className="text-white font-medium text-sm">Continue with Google</span>
                            </button>
                            <button onClick={() => navigate('/username-setup')} className="w-full py-3.5 px-4 bg-[#1F2937] hover:bg-[#2d3748] border border-white/10 rounded-full flex items-center justify-center space-x-3 transition-colors group">
                                <Icon name="apple" className="text-white text-lg" />
                                <span className="text-white font-medium text-sm">Continue with Apple</span>
                            </button>
                        </div>

                <div className="relative flex items-center py-2 mb-6">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">or</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleContinue} className="flex flex-col space-y-4 mb-4">
                    <div className="group">
                        <label className="sr-only" htmlFor="email">Email address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-icons text-slate-500 text-xl">mail</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-4 py-4 bg-[#1F2937] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                                id="email"
                                placeholder="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="sr-only" htmlFor="password">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-icons text-slate-500 text-xl">lock</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-12 py-4 bg-[#1F2937] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                                id="password"
                                placeholder="Password (min. 6 characters)"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                                disabled={loading}
                            >
                                <span className="material-icons text-slate-500 hover:text-slate-300 transition-colors text-xl">
                                    {showPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-cream hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{loading ? 'Creating account...' : 'Continue'}</span>
                        </button>
                    </div>
                </form>

                        <div className="pb-6">
                            <p className="text-center text-xs text-slate-500">
                                By signing up, you agree to our <a className="text-slate-400 underline hover:text-primary transition-colors" href="#">Terms</a> and <a className="text-slate-400 underline hover:text-primary transition-colors" href="#">Privacy Policy</a>.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default Signup;