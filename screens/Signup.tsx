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

  const handleGoogleSignup = async () => {
      setError('');
      setLoading(true);

      try {
          console.log('Initiating Google OAuth signup...');
          console.log('Redirect URL:', `${window.location.origin}/auth/callback`);

          const { data, error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  skipBrowserRedirect: false,
              },
          });

          if (error) {
              console.error('OAuth error:', error);
              throw error;
          }

          console.log('OAuth initiated successfully:', data);
      } catch (err: any) {
          console.error('Google signup error:', err);
          setError(err.message || 'Failed to sign up with Google');
          setLoading(false);
      }
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
                            <button
                                onClick={handleGoogleSignup}
                                disabled={loading}
                                className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 border border-white/10 rounded-full flex items-center justify-center space-x-3 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span className="text-gray-700 font-medium text-sm">Continue with Google</span>
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