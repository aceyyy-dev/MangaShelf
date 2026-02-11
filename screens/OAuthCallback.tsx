import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useStore } from '../StoreContext';
import Icon from '../components/Icon';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login, setTempUserData } = useStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    let authListener: { data: { subscription: any } } | null = null;

    const processSession = async (session: any) => {
      if (!mounted || !session?.user) return;

      try {
        console.log('Processing session for user:', session.user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!mounted) return;

        if (profile) {
          // Check if user has completed onboarding (username doesn't start with 'temp_')
          if (profile.username.startsWith('temp_')) {
            console.log('Incomplete profile detected, redirecting to username setup');
            const name = profile.name ||
                        session.user.user_metadata?.full_name ||
                        session.user.user_metadata?.name ||
                        session.user.email?.split('@')[0] ||
                        'User';

            setTempUserData({ name });
            setStatus('success');

            setTimeout(() => {
              if (mounted) navigate('/username-setup');
            }, 1000);
          } else {
            // Existing user with complete profile - go to home
            console.log('Found existing profile:', profile.username);
            login({
              name: profile.name,
              username: profile.username,
              avatarUrl: profile.avatar_url,
              joinDate: profile.join_date,
            });

            setStatus('success');
            setTimeout(() => {
              if (mounted) navigate('/home');
            }, 1000);
          }
        } else {
          // No profile found (shouldn't happen with trigger, but handle it)
          console.log('No profile found, creating new user flow');
          const name = session.user.user_metadata?.full_name ||
                      session.user.user_metadata?.name ||
                      session.user.email?.split('@')[0] ||
                      'User';

          setTempUserData({ name });
          setStatus('success');

          setTimeout(() => {
            if (mounted) navigate('/username-setup');
          }, 1000);
        }
      } catch (err: any) {
        console.error('Error processing session:', err);
        if (mounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Failed to process authentication');
        }
      }
    };

    const handleOAuthCallback = async () => {
      try {
        console.log('Starting OAuth callback handler');
        console.log('Current URL:', window.location.href);

        // Check if there are OAuth tokens in the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasAccessToken = hashParams.has('access_token');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        console.log('Has access token in URL:', hasAccessToken);

        // Set up auth state change listener
        authListener = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');

          if (event === 'SIGNED_IN' && session) {
            await processSession(session);
          } else if (event === 'TOKEN_REFRESHED' && session) {
            await processSession(session);
          }
        });

        // Also try to get existing session immediately
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session) {
          console.log('Session found immediately');
          await processSession(session);
        } else {
          console.log('No immediate session, waiting for auth state change...');
        }

        // Set a timeout in case nothing happens
        timeoutId = setTimeout(() => {
          if (mounted && status === 'loading') {
            console.error('Timeout: No session received after 10 seconds');
            setStatus('error');
            setErrorMessage('Authentication timed out. Please try again.');
          }
        }, 10000);

      } catch (err: any) {
        console.error('OAuth callback error:', err);
        if (mounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Failed to complete authentication');
        }
      }
    };

    // Small delay to ensure URL is fully loaded
    const initTimer = setTimeout(() => {
      handleOAuthCallback();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(initTimer);
      if (timeoutId) clearTimeout(timeoutId);
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [navigate, login, setTempUserData, status]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background-dark px-6">
      <div className="absolute inset-0 z-0"></div>

      {status === 'loading' && (
        <div className="relative z-10 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Completing sign in...</h2>
          <p className="text-slate-400">Please wait while we set up your account</p>
        </div>
      )}

      {status === 'success' && (
        <div className="relative z-10 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <Icon name="check_circle" className="text-green-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Success!</h2>
          <p className="text-slate-400">Redirecting you now...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="relative z-10 text-center animate-fade-in max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Icon name="error" className="text-red-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Authentication Failed</h2>
          <p className="text-slate-400 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 px-6 bg-cream hover:bg-[#ebdcb0] active:scale-[0.98] transition-all duration-200 rounded-full text-background-dark font-bold text-lg shadow-lg"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;
