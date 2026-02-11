import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';
import { supabase } from '../supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
      // Trigger animation after mount
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => navigate('/'), 500); // Match new duration
  };

  const handleFormLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setNeedsConfirmation(false);

      if (!email || !password) {
          setError('Please fill in all fields');
          return;
      }

      setLoading(true);

      try {
          const { data, error: loginError } = await supabase.auth.signInWithPassword({
              email,
              password,
          });

          if (loginError) {
              if (loginError.message.toLowerCase().includes('email not confirmed')) {
                  setNeedsConfirmation(true);
                  setError('Please confirm your email address to log in.');
                  return;
              }
              throw loginError;
          }

          if (data.user) {
              const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', data.user.id)
                  .maybeSingle();

              if (profile) {
                  login({
                      name: profile.name,
                      username: profile.username,
                      avatarUrl: profile.avatar_url,
                      joinDate: profile.join_date,
                  });
              }

              navigate('/home');
          }
      } catch (err: any) {
          setError(err.message || 'Failed to log in');
      } finally {
          setLoading(false);
      }
  };

  const handleResendConfirmation = async () => {
      if (!email) {
          setError('Please enter your email address');
          return;
      }

      setResendingEmail(true);
      setError('');

      try {
          const { error } = await supabase.auth.resend({
              type: 'signup',
              email: email,
              options: {
                  emailRedirectTo: `${window.location.origin}/auth/confirm`,
              },
          });

          if (error) throw error;

          setError('');
          setNeedsConfirmation(false);
          alert('Confirmation email sent! Please check your inbox.');
      } catch (err: any) {
          setError(err.message || 'Failed to resend confirmation email');
      } finally {
          setResendingEmail(false);
      }
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
                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Log in with email</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                        {needsConfirmation && (
                            <button
                                type="button"
                                onClick={handleResendConfirmation}
                                disabled={resendingEmail}
                                className="mt-3 w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendingEmail ? 'Sending...' : 'Resend confirmation email'}
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleFormLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="sr-only" htmlFor="email">Email</label>
                        <input
                            className="w-full bg-[#1F2937] border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            id="email"
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="space-y-1 relative">
                        <label className="sr-only" htmlFor="password">Password</label>
                        <input
                            className="w-full bg-[#1F2937] border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                            id="password"
                            placeholder="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                        >
                            <span className="material-icons text-xl">
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-primary hover:text-blue-400 font-medium transition-colors">Forgot password?</button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-4 px-6 bg-cream hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>{loading ? 'Logging in...' : 'Log In'}</span>
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