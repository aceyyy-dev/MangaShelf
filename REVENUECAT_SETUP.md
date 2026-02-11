# RevenueCat Subscription Setup Guide

This guide will walk you through setting up RevenueCat subscriptions for the MangaShelf app on iOS and Android.

## Prerequisites

- RevenueCat account (sign up at https://www.revenuecat.com)
- Apple Developer account (for iOS)
- Google Play Developer account (for Android)
- Xcode installed (for iOS builds)
- Android Studio installed (for Android builds)

## Part 1: RevenueCat Dashboard Setup

### 1.1 Create a RevenueCat Project

1. Go to https://app.revenuecat.com
2. Click "Create New Project"
3. Enter project name: "MangaShelf"
4. Select your project

### 1.2 Add iOS App

1. In your RevenueCat project, go to "Apps"
2. Click "Add App" → Select "iOS"
3. Enter your iOS Bundle ID (should match what's in Xcode, e.g., `com.mangashelf.app`)
4. Upload your App Store Connect API Key:
   - Go to App Store Connect → Users and Access → Keys
   - Create a new key with "Admin" access
   - Download the .p8 file
   - Upload to RevenueCat along with Issuer ID and Key ID

5. Copy your iOS API Key from RevenueCat (shown after adding the app)
6. Add it to your `.env` file:
   ```
   VITE_REVENUECAT_IOS_API_KEY=your_actual_ios_key_here
   ```

### 1.3 Add Android App

1. Click "Add App" → Select "Android"
2. Enter your Android Package Name (e.g., `com.mangashelf.app`)
3. Upload your Google Play Service Account JSON:
   - Go to Google Play Console → Setup → API access
   - Create a service account or use existing one
   - Grant "Admin" permissions
   - Download JSON key file
   - Upload to RevenueCat

4. Copy your Android API Key from RevenueCat
5. Add it to your `.env` file:
   ```
   VITE_REVENUECAT_ANDROID_API_KEY=your_actual_android_key_here
   ```

### 1.4 Create Products in RevenueCat

1. Go to "Products" in RevenueCat dashboard
2. Click "Add Product"

**Monthly Subscription:**
- Product ID: `mangashelf_monthly`
- Display Name: Monthly Access
- Price: $4.99/month
- Duration: 1 month
- Type: Auto-renewable subscription

**Yearly Subscription:**
- Product ID: `mangashelf_yearly`
- Display Name: Yearly Access
- Price: $39.99/year
- Duration: 1 year
- Type: Auto-renewable subscription

3. Create an Entitlement:
   - Go to "Entitlements"
   - Click "Add Entitlement"
   - Entitlement ID: `premium`
   - Display Name: Premium Features
   - Attach both products (monthly and yearly) to this entitlement

4. Create an Offering:
   - Go to "Offerings"
   - Create offering named "default"
   - Add both packages (monthly and yearly)
   - Make it the current offering

## Part 2: App Store Connect Setup (iOS)

### 2.1 Create In-App Purchases

1. Go to App Store Connect → My Apps → Select your app
2. Go to "In-App Purchases" (or "Subscriptions" in newer interface)
3. Click "+" to create a new subscription group
   - Name: "MangaShelf Plus"
   - Create the group

4. Add Monthly Subscription:
   - Product ID: `mangashelf_monthly` (MUST match RevenueCat)
   - Reference Name: MangaShelf Monthly
   - Subscription Group: MangaShelf Plus
   - Subscription Duration: 1 Month
   - Price: $4.99
   - Add localized titles and descriptions

5. Add Yearly Subscription:
   - Product ID: `mangashelf_yearly` (MUST match RevenueCat)
   - Reference Name: MangaShelf Yearly
   - Subscription Group: MangaShelf Plus
   - Subscription Duration: 1 Year
   - Price: $39.99
   - Add localized titles and descriptions

6. Submit both for review (they need to be approved before testing)

### 2.2 Set Up Sandbox Testing

1. Go to App Store Connect → Users and Access → Sandbox Testers
2. Create test accounts for testing subscriptions
3. Use these accounts on your device (Settings → App Store → Sandbox Account)

## Part 3: Google Play Console Setup (Android)

### 3.1 Create Subscription Products

1. Go to Google Play Console → Your App → Monetize → Subscriptions
2. Click "Create subscription"

**Monthly Subscription:**
- Product ID: `mangashelf_monthly` (MUST match RevenueCat)
- Name: MangaShelf Monthly
- Description: Monthly access to premium features
- Billing period: 1 Month
- Base plan price: $4.99
- Grace period: 3 days (optional)
- Add pricing for all countries

**Yearly Subscription:**
- Product ID: `mangashelf_yearly` (MUST match RevenueCat)
- Name: MangaShelf Yearly
- Description: Yearly access to premium features
- Billing period: 1 Year
- Base plan price: $39.99
- Add pricing for all countries

3. Activate both subscriptions

### 3.2 Set Up Testing

1. Go to Setup → License Testing
2. Add test Gmail accounts
3. Create an internal testing track
4. Add testers to internal testing

## Part 4: Configure RevenueCat Webhooks

### 4.1 Get Your Webhook URL

Your webhook URL is:
```
https://xfddnlnfcjqxlsbyloyb.supabase.co/functions/v1/revenuecat-webhook
```

### 4.2 Add Webhook in RevenueCat

1. Go to RevenueCat Dashboard → Project Settings → Integrations
2. Click "Webhooks" or scroll to Webhook section
3. Add your webhook URL
4. Select the following events to send:
   - `INITIAL_PURCHASE` - User subscribes for the first time
   - `RENEWAL` - Subscription renews
   - `CANCELLATION` - User cancels (subscription still active until expiry)
   - `EXPIRATION` - Subscription expires
   - `UNCANCELLATION` - User resubscribes before expiration
   - `PRODUCT_CHANGE` - User switches plans
   - `BILLING_ISSUE` - Payment failed

5. Save webhook configuration

### 4.3 Test Webhook

1. Use RevenueCat's webhook testing tool to send test events
2. Check Supabase Edge Function logs to verify events are received
3. Check your `profiles` table to see if subscription status updates

## Part 5: Build and Deploy Your Apps

### 5.1 Build for iOS

1. Open terminal in your project directory:
   ```bash
   npm run build
   npx cap sync
   npx cap open ios
   ```

2. In Xcode:
   - Select your team in Signing & Capabilities
   - Add "In-App Purchase" capability
   - Ensure Bundle ID matches what you configured
   - Build and run on device or simulator

### 5.2 Build for Android

1. Build the app:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

2. In Android Studio:
   - Configure signing keys
   - Build APK or App Bundle
   - Install on device for testing

## Part 6: Testing Subscriptions

### 6.1 iOS Testing

1. Sign out of App Store on your device
2. Sign in with Sandbox test account
3. Launch your app
4. Go through onboarding to paywall
5. Purchase a subscription
6. Verify:
   - Purchase completes
   - User profile shows premium status
   - Premium features unlock
   - Profile screen shows subscription details

### 6.2 Android Testing

1. Ensure your Google account is added as a tester
2. Install app from internal testing track
3. Purchase a subscription
4. Verify same points as iOS

### 6.3 Test Scenarios

Test the following scenarios:

1. **Purchase Monthly**
   - Subscribe to monthly plan
   - Verify profile shows "Monthly" tier
   - Verify premium features unlock

2. **Purchase Yearly**
   - Subscribe to yearly plan
   - Verify profile shows "Yearly" tier
   - Check expiration date is ~1 year out

3. **Restore Purchases**
   - Delete and reinstall app
   - Log in with same account
   - Tap "Restore" button in Profile
   - Verify subscription restored

4. **Cancel Subscription**
   - Go to subscription management (via Profile)
   - Cancel subscription
   - Verify status remains "premium" until expiry
   - Webhook should update expiration date

5. **Subscription Expiry**
   - For testing, use short-duration test subscriptions
   - Wait for expiry
   - Verify status changes to "expired"
   - Premium features lock

## Part 7: Production Deployment

### 7.1 Pre-Launch Checklist

- [ ] All subscription products created in App Store Connect
- [ ] All subscription products created in Google Play Console
- [ ] Product IDs match exactly across platforms and RevenueCat
- [ ] Webhook configured and tested
- [ ] API keys added to environment variables
- [ ] Tested all purchase flows
- [ ] Tested restore purchases
- [ ] Tested subscription management links
- [ ] Privacy policy updated with subscription info
- [ ] Terms of service updated

### 7.2 App Store Submission (iOS)

1. In Xcode, Archive your app
2. Upload to App Store Connect
3. Fill out all metadata
4. Add screenshots
5. Submit for review
6. Note: In-app purchases must be approved separately

### 7.3 Google Play Submission (Android)

1. Generate signed App Bundle
2. Upload to Google Play Console
3. Fill out store listing
4. Submit for review

## Troubleshooting

### Purchases Not Working

**Issue:** Purchase button does nothing
- Check that API keys are correctly set in `.env`
- Verify product IDs match across all platforms
- Check console logs for errors
- Ensure you're testing on a real device (simulators have limitations)

**Issue:** "No products available"
- Products may not be synced yet (can take 24 hours)
- Verify products are active in App Store Connect / Google Play
- Check RevenueCat dashboard shows products correctly
- Try restarting the app

### Webhook Not Updating Database

**Issue:** Purchases complete but profile not updating
- Check Edge Function logs in Supabase
- Verify webhook URL is correct
- Test webhook manually in RevenueCat dashboard
- Check that user ID matches between RevenueCat and Supabase

### Restore Purchases Not Working

**Issue:** Restore button doesn't restore subscription
- Ensure user is signed in with same account used for purchase
- Check that they're using the correct App Store / Google account
- Verify RevenueCat customer info is linked correctly
- Check logs for restore errors

## Support Resources

- RevenueCat Documentation: https://docs.revenuecat.com
- RevenueCat Community: https://community.revenuecat.com
- App Store Connect Help: https://developer.apple.com/app-store-connect/
- Google Play Help: https://support.google.com/googleplay/android-developer

## Important Notes

1. **Sandbox vs Production**: Sandbox subscriptions have accelerated durations for testing. A 1-month subscription in sandbox might only last 5 minutes.

2. **RevenueCat Customer IDs**: The app uses Supabase user IDs as RevenueCat customer IDs for easy linking.

3. **Grace Periods**: Both platforms offer grace periods for failed payments. Webhooks will notify you of billing issues.

4. **Subscription Changes**: Users can upgrade/downgrade between monthly and yearly plans.

5. **Refunds**: Handle refund requests through App Store Connect or Google Play Console. RevenueCat will send webhook events when refunds occur.

6. **Testing Limitations**:
   - iOS simulators cannot make purchases (use real devices)
   - Android emulators can make test purchases if signed in with test account

## Security Best Practices

1. Never commit API keys to git (use `.env` and `.gitignore`)
2. Use different API keys for development vs production
3. Validate webhook signatures in production (RevenueCat provides this)
4. Always verify subscription status server-side (via Supabase)
5. Never trust client-side subscription checks alone for critical features

---

For questions or issues with this setup, refer to the RevenueCat documentation or reach out to their support team.
