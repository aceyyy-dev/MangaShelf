export interface Series {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  totalVolumes: number;
  ownedVolumes: number;
  tags: string[];
  status: 'Reading' | 'Completed' | 'Wishlist' | 'Dropped';
  publisher?: string;
  isFavorite?: boolean;
  dateAdded?: string;
}

export interface Volume {
  id: string;
  seriesId: string;
  number: number;
  title?: string;
  coverUrl: string;
  publishDate?: string;
  isOwned: boolean;
  price?: number;
  condition?: 'New' | 'Good' | 'Fair' | 'Bad';
  notes?: string;
  isFavorite?: boolean;
  isInWishlist?: boolean;
  readStatus?: 'Unread' | 'Reading' | 'Read';
  dateAdded?: string;
}

export interface UserStats {
  totalVolumes: number;
  activeSeries: number;
  completionRate: number;
  estimatedValue: number;
  monthlyGrowth: number;
}

export interface UserProfile {
  name: string;
  username: string;
  avatarUrl: string;
  joinDate: string;
  lastUsernameChange: string | null;
  subscriptionStatus?: 'free' | 'premium' | 'expired';
  subscriptionTier?: 'monthly' | 'yearly' | null;
  subscriptionExpiresAt?: string | null;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  status: 'free' | 'premium' | 'expired';
  tier: 'monthly' | 'yearly' | null;
  expiresAt: string | null;
  willRenew: boolean;
}