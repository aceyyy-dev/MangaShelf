import { supabase } from '../supabase';
import { SubscriptionStatus } from '../types';

export async function fetchSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, subscription_expires_at')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      return {
        isPremium: false,
        status: 'free',
        tier: null,
        expiresAt: null,
        willRenew: false
      };
    }

    const isPremium = profile.subscription_status === 'premium';

    return {
      isPremium,
      status: profile.subscription_status || 'free',
      tier: profile.subscription_tier || null,
      expiresAt: profile.subscription_expires_at || null,
      willRenew: isPremium && profile.subscription_expires_at
        ? new Date(profile.subscription_expires_at) > new Date()
        : false
    };
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return {
      isPremium: false,
      status: 'free',
      tier: null,
      expiresAt: null,
      willRenew: false
    };
  }
}

export function isPremiumFeature(featureName: string): boolean {
  const premiumFeatures = [
    'advanced-insights',
    'unlimited-collection',
    'cloud-backup',
    'custom-themes',
    'ai-sensei'
  ];

  return premiumFeatures.includes(featureName);
}

export function formatSubscriptionExpiry(expiresAt: string | null): string {
  if (!expiresAt) return 'N/A';

  const expiryDate = new Date(expiresAt);
  const now = new Date();

  if (expiryDate < now) {
    return 'Expired';
  }

  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry === 0) {
    return 'Expires today';
  } else if (daysUntilExpiry === 1) {
    return 'Expires tomorrow';
  } else if (daysUntilExpiry <= 7) {
    return `Expires in ${daysUntilExpiry} days`;
  } else {
    return expiryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

export function getSubscriptionDisplayName(tier: 'monthly' | 'yearly' | null): string {
  switch (tier) {
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    default:
      return 'Free';
  }
}

export function getSubscriptionPrice(tier: 'monthly' | 'yearly' | null): string {
  switch (tier) {
    case 'monthly':
      return '$4.99/month';
    case 'yearly':
      return '$39.99/year';
    default:
      return 'Free';
  }
}
