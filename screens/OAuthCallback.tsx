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
    const handleOAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') {
              throw profileError;
            }

            if (profile) {
              login({
                name: profile.name,
                username: profile.username,
                avatarUrl: profile.avatar_url,
                joinDate: profile.join_date,
              });

              setStatus('success');
              setTimeout(() => {
                navigate('/home');
              }, 1000);
            } else {
              const name = session.user.user_metadata?.full_name ||
                          session.user.user_metadata?.name ||
                          session.user.email?.split('@')[0] ||
                          'User';

              setTempUserData({ name });
              setStatus('success');

              setTimeout(() => {
                navigate('/username-setup');
              }, 1000);
            }
          } else {
            throw new Error('No session found');
          }
        } else {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) throw error;

          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') {
              throw profileError;
            }

            if (profile) {
              login({
                name: profile.name,
                username: profile.username,
                avatarUrl: profile.avatar_url,
                joinDate: profile.join_date,
              });

              setStatus('success');
              setTimeout(() => {
                navigate('/home');
              }, 1000);
            } else {
              const name = session.user.user_metadata?.full_name ||
                          session.user.user_metadata?.name ||
                          session.user.email?.split('@')[0] ||
                          'User';

              setTempUserData({ name });
              setStatus('success');

              setTimeout(() => {
                navigate('/username-setup');
              }, 1000);
            }
          } else {
            throw new Error('No authentication tokens found');
          }
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to complete authentication');
      }
    };

    handleOAuthCallback();
  }, [navigate, login, setTempUserData]);

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
