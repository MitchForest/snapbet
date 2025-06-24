-- Create function to handle new user creation from auth.users
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
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create initial bankroll for the user
  INSERT INTO public.bankrolls (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Handle existing auth users that might not have records
-- This will create records for any auth users that don't have a corresponding users record
INSERT INTO public.users (
  id,
  email,
  oauth_provider,
  oauth_id,
  username,
  display_name,
  avatar_url
)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.raw_app_meta_data->>'provider' = 'google' THEN 'google'::oauth_provider
    WHEN au.raw_app_meta_data->>'provider' = 'twitter' THEN 'twitter'::oauth_provider
    ELSE 'google'::oauth_provider
  END,
  COALESCE(au.raw_app_meta_data->>'provider_id', au.id::TEXT),
  NULL,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Create bankrolls for any users that don't have one
INSERT INTO public.bankrolls (user_id)
SELECT u.id
FROM public.users u
LEFT JOIN public.bankrolls b ON u.id = b.user_id
WHERE b.user_id IS NULL; 