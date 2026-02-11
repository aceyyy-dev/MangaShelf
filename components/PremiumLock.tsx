import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../StoreContext';
import Icon from './Icon';

interface PremiumLockProps {
  featureName: string;
  children: React.ReactNode;
  overlay?: boolean;
}

const PremiumLock: React.FC<PremiumLockProps> = ({ featureName, children, overlay = true }) => {
  const navigate = useNavigate();
  const { userProfile } = useStore();
  const isPremium = userProfile.subscriptionStatus === 'premium';

  if (isPremium) {
    return <>{children}</>;
  }

  if (overlay) {
    return (
      <div className="relative">
        <div className="opacity-30 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-sm rounded-2xl border border-slate-800">
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="flex justify-center">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Icon name="workspace_premium" className="text-yellow-400 text-3xl" type="outlined" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Premium Feature</h3>
              <p className="text-sm text-slate-300">
                Unlock <span className="text-yellow-400 font-medium">{featureName}</span> with MangaShelf+
              </p>
            </div>
            <button
              onClick={() => navigate('/paywall')}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-bold text-sm rounded-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <span>Upgrade Now</span>
              <Icon name="arrow_forward" type="outlined" className="text-base" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/95 to-black/95 border border-slate-800 p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-yellow-500/10 rounded-full">
            <Icon name="workspace_premium" className="text-yellow-400 text-3xl" type="outlined" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Premium Feature</h3>
          <p className="text-sm text-slate-300">
            Unlock <span className="text-yellow-400 font-medium">{featureName}</span> with MangaShelf+
          </p>
        </div>
        <button
          onClick={() => navigate('/paywall')}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-bold text-sm rounded-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
        >
          <span>Upgrade Now</span>
          <Icon name="arrow_forward" type="outlined" className="text-base" />
        </button>
      </div>
    </div>
  );
};

export default PremiumLock;
