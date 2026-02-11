import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useStore } from '../StoreContext';

const Paywall: React.FC = () => {
  const navigate = useNavigate();
  const { login, tempUserData } = useStore();

  const handleFinish = () => {
      login({ 
          name: tempUserData.name || 'Collector', 
          username: tempUserData.username || 'collector' 
      });
      navigate('/home');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased h-full w-full overflow-hidden flex flex-col relative selection:bg-primary selection:text-white animate-flow-enter">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        <div className="absolute top-0 inset-x-0 h-[45vh] z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background-dark/80 to-background-dark z-10"></div>
            <img 
                alt="Abstract manga panels or bookshelf silhouette" 
                className="w-full h-full object-cover opacity-40 mix-blend-overlay" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJrL-6h9fUbYi2bk1CLAqZz7f530lcZhV8A-JXPLtFECxyOFcY8j6VCmc7v2-HREVBLWDyaci1YhetKvqyi-s4TjzqU0olJHUf6QnaehonQX6Zdd8mkYorApnMAf-EjIyAW74b7n3VLexa9tY7hF9jcbgfnqHNHVZWabBYPuKXIdogdOx2qKiNG1kQSkWsXyLL8M5LZ1zDwgYcK6hDki4nON-ftLS6crvCPUKfa66SNYF_ZPt3oPqIJAd_fTS9FoPD-2LFWDMfj_0"
            />
        </div>

        <main className="relative z-10 flex flex-col h-full px-5 pt-safe-pt pb-safe-pb">
            {/* Header - Pushed down to create space at the top */}
            <div className="flex-none text-center mt-10 mb-4 transition-all duration-300">
                <div className="inline-flex items-center justify-center p-3 mb-3 rounded-2xl bg-gradient-to-tr from-gold/20 to-gold/5 ring-1 ring-gold/30 shadow-2xl shadow-gold/10">
                    <svg className="w-10 h-10 text-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect height="18" rx="4" width="18" x="3" y="3"></rect>
                        <path d="M8 7v10"></path>
                        <path d="M12 7v10"></path>
                        <path d="M16 7l-1 10"></path>
                    </svg>
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-1 text-white">
                    MangaShelf<span className="text-gold">+</span>
                </h1>
                <p className="text-slate-400 text-xs font-medium">Unlock the ultimate collector's experience.</p>
            </div>

            {/* Scrollable Features - Flex-1 allows it to take available space and scroll behind bottom section */}
            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 mb-2 space-y-2 pr-1 pb-4">
                 {[
                    { icon: 'bar_chart', title: 'Advanced Insights', desc: 'Detailed stats, trends, and breakdowns.' },
                    { icon: 'all_inclusive', title: 'Unlimited Collection', desc: 'Track thousands of volumes without limits.' },
                    { icon: 'cloud_upload', title: 'Secure Cloud Backup', desc: 'Never lose your reading progress again.' },
                    { icon: 'palette', title: 'Custom Themes', desc: 'Personalize your shelf with exclusive skins.' },
                    { icon: 'school', title: 'Personal Manga Sensei', desc: 'AI-powered tracking companion.' },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                        <div className="flex-none w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center mr-3">
                            <Icon name={item.icon} className="text-gold text-lg" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-xs">{item.title}</h3>
                            <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pricing & CTA - Fixed at bottom via flex layout with gradient backdrop */}
            <div className="flex-none space-y-3 pt-2 relative z-20 pb-2">
                {/* Gradient fade to ensure features scroll "behind" nicely */}
                <div className="absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background-dark to-transparent pointer-events-none"></div>
                
                <div className="space-y-2">
                    <label className="relative group cursor-pointer block">
                        <input type="radio" name="plan" className="peer sr-only" defaultChecked />
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 to-primary/50 rounded-xl opacity-75 blur transition duration-200 group-hover:opacity-100 peer-checked:opacity-100 animate-pulse"></div>
                        <div className="relative flex items-center justify-between p-3 rounded-xl bg-background-dark border-2 border-transparent peer-checked:border-gold/50 transition-all shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-slate-600 peer-checked:border-gold peer-checked:bg-gold flex items-center justify-center transition-colors">
                                    <div className="w-2 h-2 bg-background-dark rounded-full opacity-0 peer-checked:opacity-100"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-sm">Yearly Access</span>
                                    <span className="text-[10px] text-gold font-medium">Best Value • Save ~33%</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-white">$39.99</span>
                                <span className="text-[10px] text-slate-400">/year</span>
                            </div>
                            <div className="absolute -top-2.5 right-4 bg-gold text-black text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg transform translate-y-1">
                                BEST OFFER
                            </div>
                        </div>
                    </label>
                    
                    <label className="group cursor-pointer block">
                        <input type="radio" name="plan" className="peer sr-only" />
                        <div className="relative flex items-center justify-between p-3 rounded-xl bg-white/5 border-2 border-transparent hover:bg-white/10 peer-checked:bg-background-dark peer-checked:border-primary/50 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-slate-600 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center transition-colors">
                                    <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 peer-checked:text-white text-sm">Monthly Access</span>
                                    <span className="text-[10px] text-slate-500 peer-checked:text-primary/80">Flexible billing</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-slate-200 peer-checked:text-white">$4.99</span>
                                <span className="text-[10px] text-slate-500">/month</span>
                            </div>
                        </div>
                    </label>
                </div>

                <div className="space-y-2">
                    <button 
                        onClick={handleFinish}
                        className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-bold text-base rounded-xl shadow-lg shadow-primary/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        Start MangaShelf+
                        <Icon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="text-center">
                        <button onClick={handleFinish} className="w-full py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-bold transition-all active:scale-95">
                            Continue with Limited Version
                        </button>
                        <div className="flex justify-center items-center gap-4 text-[10px] text-slate-600 uppercase tracking-wider font-semibold mt-1">
                            <button className="hover:text-slate-400 transition-colors">Terms of Service</button>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <button className="hover:text-slate-400 transition-colors">Privacy Policy</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default Paywall;