import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useStore } from '../StoreContext';
import Icon from '../components/Icon';

const EmailConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { setTempUserData } = useStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          if (session?.user) {
            const email = session.user.email || '';
            setTempUserData({ name: email.split('@')[0] });
            setStatus('success');

            setTimeout(() => {
              navigate('/username-setup');
            }, 2000);
          } else {
            throw new Error('No session found');
          }
        } else {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) throw error;

          if (session?.user) {
            const email = session.user.email || '';
            setTempUserData({ name: email.split('@')[0] });
            setStatus('success');

            setTimeout(() => {
              navigate('/username-setup');
            }, 2000);
          } else {
            throw new Error('No confirmation token found');
          }
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to confirm email');
      }
    };

    handleEmailConfirmation();
  }, [navigate, setTempUserData]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background-dark px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-manga-texture bg-cover bg-center grayscale opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/95 to-background-dark/80"></div>
      </div>

      <div className="relative z-10 text-center w-full max-w-sm">
        {status === 'loading' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirming your email</h2>
            <p className="text-slate-400">Please wait a moment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <Icon name="check_circle" className="text-green-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email confirmed!</h2>
            <p className="text-slate-400 mb-4">Your account has been verified.</p>
            <p className="text-sm text-slate-500">Redirecting to setup...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <Icon name="error" className="text-red-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirmation failed</h2>
            <p className="text-slate-400 mb-8">{errorMessage}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all rounded-xl text-white font-bold"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;
