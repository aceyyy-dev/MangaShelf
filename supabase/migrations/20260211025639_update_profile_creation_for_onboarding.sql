/*
  # Update Profile Creation for Onboarding Flow
  
  1. Changes
    - Updates the `handle_new_user()` function to create profiles with a temporary username
    - Temporary usernames are prefixed with `temp_` to identify incomplete onboarding
    - New users will be required to complete username setup and full onboarding
  
  2. Purpose
    - Ensures new users (email signups and OAuth) go through complete onboarding flow
    - Allows login flow to detect incomplete profiles and redirect to username-setup
    - Maintains data integrity by always having a username (non-null constraint)
*/

-- Update function to create profiles with temporary username
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, join_date)
  VALUES (
    NEW.id,
    'temp_' || substr(NEW.id::text, 1, 8),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      ''
    ),
    EXTRACT(YEAR FROM NOW())::text
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;