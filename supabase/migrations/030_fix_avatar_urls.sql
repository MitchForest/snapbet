-- Fix avatar URLs for existing users who signed in with OAuth
-- This migration updates users who have OAuth avatars but the avatar_url column is null

-- First, update existing users who have avatar URLs in their auth metadata
UPDATE public.users u
SET avatar_url = au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE u.id = au.id
  AND u.avatar_url IS NULL
  AND au.raw_user_meta_data->>'avatar_url' IS NOT NULL
  AND au.raw_user_meta_data->>'avatar_url' != '';

-- Also check for 'picture' field (some OAuth providers use this)
UPDATE public.users u
SET avatar_url = au.raw_user_meta_data->>'picture'
FROM auth.users au
WHERE u.id = au.id
  AND u.avatar_url IS NULL
  AND au.raw_user_meta_data->>'picture' IS NOT NULL
  AND au.raw_user_meta_data->>'picture' != '';

-- Update the auth trigger to handle both avatar_url and picture fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user into public.users table
  INSERT INTO public.users (
    id,
    email,
    oauth_provider,
    oauth_id,
    username,
    display_name,
    avatar_url
  ) VALUES (
    NEW.id,
    NEW.email,
    -- Extract provider from raw_app_meta_data
    CASE 
      WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'::oauth_provider
      WHEN NEW.raw_app_meta_data->>'provider' = 'twitter' THEN 'twitter'::oauth_provider
      ELSE 'google'::oauth_provider -- fallback
    END,
    COALESCE(NEW.raw_app_meta_data->>'provider_id', NEW.id::TEXT),
    NULL, -- username will be set during onboarding
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    -- Try both avatar_url and picture fields
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  
  -- Create initial bankroll for the user
  INSERT INTO public.bankrolls (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment to document this fix
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user record and bankroll when auth user is created. Fixed to properly handle OAuth avatar URLs from both avatar_url and picture fields.'; 