/*
  # Add Subscription Tracking to Profiles

  1. Changes to `profiles` table
    - Add `subscription_status` column (text) - Values: 'free', 'premium', 'expired'
    - Add `subscription_tier` column (text) - Values: null, 'monthly', 'yearly'
    - Add `subscription_expires_at` column (timestamptz) - When subscription expires
    - Add `revenuecat_customer_id` column (text) - RevenueCat customer identifier
    - Add `updated_at` column (timestamptz) - Track when profile was last updated

  2. Indexes
    - Add index on `subscription_status` for efficient queries
    - Add index on `revenuecat_customer_id` for webhook lookups

  3. Notes
    - Default subscription_status is 'free' for all users
    - subscription_tier is null for free users
    - subscription_expires_at is null for free users
    - These fields will be updated by RevenueCat webhooks
*/

-- Add subscription-related columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'free' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_expires_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'revenuecat_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN revenuecat_customer_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add check constraint to ensure valid subscription statuses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_subscription_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check 
    CHECK (subscription_status IN ('free', 'premium', 'expired'));
  END IF;
END $$;

-- Add check constraint for subscription tiers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_subscription_tier_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IS NULL OR subscription_tier IN ('monthly', 'yearly'));
  END IF;
END $$;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
  ON profiles(subscription_status);

CREATE INDEX IF NOT EXISTS idx_profiles_revenuecat_customer_id 
  ON profiles(revenuecat_customer_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on profile changes
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();
