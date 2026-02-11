import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/scan', label: 'Scan', icon: 'qr_code_scanner', isAction: false },
    { path: '/library', label: 'Library', icon: 'library_books' },
    { path: '/insights', label: 'Insights', icon: 'bar_chart' },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ];

  const hiddenPaths = [
      '/', 
      '/signup', 
      '/login', 
      '/username-setup', 
      '/scan-onboarding', 
      '/onboarding-progress', 
      '/paywall',
      '/forgot-password'
  ];

  if (hiddenPaths.includes(location.pathname)) return null;

  const isScan = location.pathname === '/scan';

  return (
    <nav className={`fixed bottom-0 left-0 right-0 w-full pb-safe pt-2 px-4 md:px-6 z-50 transition-all duration-300 ${
        isScan
        ? 'bg-transparent'
        : 'glass-panel border-t border-white/5'
    }`}>
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === '/' && item.path === '/home' || location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center min-w-[56px] gap-1 transition-all ${
                isActive ? 'text-primary' : isScan ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive ? (
                <div className="bg-primary/20 rounded-full px-4 py-1 flex items-center justify-center">
                  <Icon name={item.icon} type="round" className="text-xl md:text-2xl" />
                </div>
              ) : (
                <Icon name={item.icon} type="outlined" className="text-2xl md:text-3xl" />
              )}
              <span className={`text-[10px] md:text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;