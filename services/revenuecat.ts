import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export const PRODUCT_IDS = {
  MONTHLY: 'mangashelf_monthly',
  YEARLY: 'mangashelf_yearly'
};

export const ENTITLEMENT_ID = 'premium';

let isInitialized = false;

export async function initializeRevenueCat(userId: string): Promise<void> {
  if (isInitialized) {
    console.log('RevenueCat already initialized');
    return;
  }

  try {
    const platform = Capacitor.getPlatform();
    let apiKey: string | undefined;

    if (platform === 'ios') {
      apiKey = import.meta.env.VITE_REVENUECAT_IOS_API_KEY;
    } else if (platform === 'android') {
      apiKey = import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY;
    }

    if (!apiKey || apiKey === 'your_ios_api_key_here' || apiKey === 'your_android_api_key_here') {
      console.warn('RevenueCat API key not configured. Subscriptions will not work.');
      return;
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId
    });

    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

    isInitialized = true;
    console.log('RevenueCat initialized successfully for user:', userId);
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
}

export async function getAvailablePackages() {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }

    console.warn('No offerings available');
    return [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

export async function purchasePackage(packageToPurchase: any) {
  try {
    const purchaseResult = await Purchases.purchasePackage({
      aPackage: packageToPurchase
    });

    if (purchaseResult.customerInfo.entitlements.active[ENTITLEMENT_ID]) {
      console.log('Purchase successful! User is now premium.');
      return { success: true, customerInfo: purchaseResult.customerInfo };
    }

    return { success: false, error: 'Purchase completed but entitlement not active' };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
      return { success: false, cancelled: true };
    }

    console.error('Purchase failed:', error);
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

export async function restorePurchases() {
  try {
    const customerInfo = await Purchases.restorePurchases();

    const isPremium = customerInfo.customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return {
      success: true,
      isPremium,
      customerInfo: customerInfo.customerInfo
    };
  } catch (error) {
    console.error('Restore purchases failed:', error);
    return { success: false, error: 'Failed to restore purchases' };
  }
}

export async function checkSubscriptionStatus() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    const isPremium = customerInfo.customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    const entitlement = customerInfo.customerInfo.entitlements.active[ENTITLEMENT_ID];

    return {
      isPremium,
      expirationDate: entitlement?.expirationDate || null,
      productIdentifier: entitlement?.productIdentifier || null,
      willRenew: entitlement?.willRenew || false
    };
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return {
      isPremium: false,
      expirationDate: null,
      productIdentifier: null,
      willRenew: false
    };
  }
}

export async function getManagementURL(): Promise<string | null> {
  try {
    const result = await Purchases.showInAppMessages();
    return null;
  } catch (error) {
    console.error('Failed to show management UI:', error);
    return null;
  }
}

export function isRevenueCatInitialized(): boolean {
  return isInitialized;
}
