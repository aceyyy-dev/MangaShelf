import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { Series, Volume, UserStats, UserProfile } from './types';
import { MOCK_SERIES, MOCK_VOLUMES } from './constants';
import { supabase } from './supabase';

const PLACEHOLDER_COVER = "https://placehold.co/400x600/1e293b/ffffff?text=?";

interface StoreContextType {
  series: Series[];
  volumes: Volume[];
  stats: UserStats;
  userProfile: UserProfile;
  tempUserData: { username?: string; name?: string; };
  setTempUserData: (data: { username?: string; name?: string; }) => void;
  updateSeries: (updated: Series) => void;
  updateVolume: (updated: Volume) => void;
  addSeries: (series: Series) => void;
  addVolume: (volume: Volume) => void;
  toggleVolumeFavorite: (volumeId: string) => void;
  toggleVolumeWishlist: (volumeId: string) => void;
  toggleVolumeOwned: (volumeId: string) => void;
  deleteSeries: (seriesId: string) => void;
  deleteVolume: (volumeId: string) => void;
  restoreData: (data: { series: Series[], volumes: Volume[] }) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  isUsernameTaken: (username: string) => boolean;
  logout: () => void;
  login: (profile?: Partial<UserProfile>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with MOCK data
  const [series, setSeries] = useState<Series[]>(MOCK_SERIES);
  const [volumes, setVolumes] = useState<Volume[]>(MOCK_VOLUMES);

  // Mock "Backend" Database of taken usernames
  const [takenUsernames, setTakenUsernames] = useState<Set<string>>(new Set(['admin', 'support']));

  // Temporary Data for Signup Flow
  const [tempUserData, setTempUserData] = useState<{ username?: string; name?: string; }>({});

  // Start as "Guest" by default to trigger onboarding
  const [userProfile, setUserProfile] = useState<UserProfile>({
      name: "",
      username: "guest",
      avatarUrl: "",
      joinDate: new Date().getFullYear().toString(),
      lastUsernameChange: null
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setUserProfile({
            name: profile.name || '',
            username: profile.username || 'user',
            avatarUrl: profile.avatar_url || '',
            joinDate: profile.join_date || new Date().getFullYear().toString(),
            lastUsernameChange: profile.last_username_change || null,
            subscriptionStatus: profile.subscription_status || 'free',
            subscriptionTier: profile.subscription_tier || null,
            subscriptionExpiresAt: profile.subscription_expires_at || null,
          });
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setUserProfile({
              name: profile.name || '',
              username: profile.username || 'user',
              avatarUrl: profile.avatar_url || '',
              joinDate: profile.join_date || new Date().getFullYear().toString(),
              lastUsernameChange: profile.last_username_change || null,
              subscriptionStatus: profile.subscription_status || 'free',
              subscriptionTier: profile.subscription_tier || null,
              subscriptionExpiresAt: profile.subscription_expires_at || null,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUserProfile({
            name: "",
            username: "guest",
            avatarUrl: "",
            joinDate: new Date().getFullYear().toString(),
            lastUsernameChange: null,
          });
        }
      })
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Dynamic Stats Calculation
  const stats = useMemo((): UserStats => {
    const ownedVols = volumes.filter(v => v.isOwned);
    const totalOwned = ownedVols.length;
    const activeCount = series.filter(s => s.status === 'Reading').length;
    
    // Calculate estimated value (default $11.99 per vol if price missing)
    const val = ownedVols.reduce((acc, v) => acc + (v.price || 11.99), 0);
    
    // Calculate completion rate (Total Owned / Total Possible across all tracked series)
    const totalPossible = series.reduce((acc, s) => acc + s.totalVolumes, 0);
    const rate = totalPossible > 0 ? Math.round((totalOwned / totalPossible) * 100) : 0;
    
    // Calculate Monthly Growth (volumes added in current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyGrowth = ownedVols.filter(v => {
        if (!v.dateAdded) return false;
        const d = new Date(v.dateAdded);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return {
        totalVolumes: totalOwned,
        activeSeries: activeCount,
        completionRate: rate,
        estimatedValue: Math.round(val),
        monthlyGrowth: monthlyGrowth
    };
  }, [series, volumes]);

  const updateSeries = (updated: Series) => {
    setSeries(prev => prev.map(s => s.id === updated.id ? updated : s));

    // Automatically generate or remove volumes if totalVolumes changes
    setVolumes(prev => {
        let newVols = prev.filter(v => {
            if (v.seriesId === updated.id) {
                return v.number <= updated.totalVolumes;
            }
            return true;
        });

        const seriesVols = newVols.filter(v => v.seriesId === updated.id);
        const existingNumbers = new Set(seriesVols.map(v => v.number));

        if (updated.totalVolumes > 0) {
            for (let i = 1; i <= updated.totalVolumes; i++) {
                if (!existingNumbers.has(i)) {
                    newVols.push({
                        id: Math.random().toString(36).substr(2, 9),
                        seriesId: updated.id,
                        number: i,
                        coverUrl: PLACEHOLDER_COVER,
                        isOwned: false,
                        isFavorite: false,
                        isInWishlist: false,
                    });
                }
            }
        }
        return newVols;
    });
  };

  const updateVolume = (updated: Volume) => {
    setVolumes(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const addSeries = (newSeries: Series) => {
    setSeries(prev => [newSeries, ...prev]);
  };

  const addVolume = (newVolume: Volume) => {
    const volWithDate = {
        ...newVolume,
        dateAdded: newVolume.dateAdded || new Date().toISOString()
    };
    setVolumes(prev => [...prev, volWithDate]);
  };
  
  const toggleVolumeFavorite = (volumeId: string) => {
      setVolumes(prev => prev.map(v => v.id === volumeId ? { ...v, isFavorite: !v.isFavorite } : v));
  };

  const toggleVolumeWishlist = (volumeId: string) => {
      setVolumes(prev => prev.map(v => v.id === volumeId ? { ...v, isInWishlist: !v.isInWishlist } : v));
  };

  const toggleVolumeOwned = (volumeId: string) => {
      setVolumes(prev => {
          const newVolumes = prev.map(v => v.id === volumeId ? { 
              ...v, 
              isOwned: !v.isOwned,
              dateAdded: !v.isOwned ? new Date().toISOString() : undefined 
          } : v);
          
          const changedVol = newVolumes.find(v => v.id === volumeId);
          if (changedVol) {
              setSeries(prevSeries => prevSeries.map(s => {
                  if (s.id === changedVol.seriesId) {
                       const ownedCount = newVolumes.filter(v => v.seriesId === s.id && v.isOwned).length;
                       return { ...s, ownedVolumes: ownedCount };
                  }
                  return s;
              }));
          }
          return newVolumes;
      });
  };

  const deleteSeries = (seriesId: string) => {
    setSeries(prev => prev.filter(s => s.id !== seriesId));
    setVolumes(prev => prev.filter(v => v.seriesId !== seriesId));
  };

  const deleteVolume = (volumeId: string) => {
    setVolumes(prev => {
        const volToDelete = prev.find(v => v.id === volumeId);
        const newVolumes = prev.filter(v => v.id !== volumeId);

        if (volToDelete && volToDelete.isOwned) {
             setSeries(prevSeries => prevSeries.map(s => {
                  if (s.id === volToDelete.seriesId) {
                       const ownedCount = newVolumes.filter(v => v.seriesId === s.id && v.isOwned).length;
                       return { ...s, ownedVolumes: ownedCount };
                  }
                  return s;
              }));
        }
        return newVolumes;
    });
  };

  const restoreData = (data: { series: Series[], volumes: Volume[] }) => {
      if (data.series && Array.isArray(data.series)) {
          setSeries(data.series);
      }
      if (data.volumes && Array.isArray(data.volumes)) {
          setVolumes(data.volumes);
      }
  };

  const isUsernameTaken = (username: string): boolean => {
      return takenUsernames.has(username.toLowerCase());
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
      setUserProfile(prev => {
          const newProfile = { ...prev, ...updates };
          if (updates.username && updates.username !== prev.username) {
              setTakenUsernames(prevTaken => {
                  const newSet = new Set(prevTaken);
                  newSet.add(updates.username!.toLowerCase());
                  return newSet;
              });
          }
          return newProfile;
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          await supabase
              .from('profiles')
              .update({
                  name: updates.name,
                  username: updates.username?.toLowerCase(),
                  avatar_url: updates.avatarUrl,
                  last_username_change: updates.username ? new Date().toISOString() : undefined,
              })
              .eq('id', user.id);
      }
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setUserProfile({
          name: "",
          username: "guest",
          avatarUrl: "",
          joinDate: new Date().getFullYear().toString(),
          lastUsernameChange: null
      });
      setTempUserData({});
  };

  const login = (profile?: Partial<UserProfile>) => {
      setUserProfile(prev => ({
          ...prev,
          name: profile?.name || "Collector",
          username: profile?.username || "collector",
          avatarUrl: profile?.avatarUrl || prev.avatarUrl,
          joinDate: prev.joinDate || new Date().getFullYear().toString(),
          lastUsernameChange: null 
      }));
  };

  return (
    <StoreContext.Provider value={{ series, volumes, stats, userProfile, tempUserData, setTempUserData, updateSeries, updateVolume, addSeries, addVolume, toggleVolumeFavorite, toggleVolumeWishlist, toggleVolumeOwned, deleteSeries, deleteVolume, restoreData, updateUserProfile, isUsernameTaken, logout, login }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};