-- Fix the user profile creation trigger to handle race conditions
-- and ensure proper data synchronization

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = new.id
  ) INTO profile_exists;

  -- Only create profile if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.users (
      id, 
      email, 
      name,
      avatar_url,
      created_at, 
      updated_at,
      last_login,
      onboarding_completed
    )
    VALUES (
      new.id, 
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'avatar_url',
      COALESCE(new.created_at, NOW()),
      NOW(),
      NOW(),
      FALSE
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = NOW(),
      last_login = NOW()
    WHERE public.users.email IS NULL OR public.users.email = '';
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also handle user updates (for OAuth signups)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  -- Update user profile with latest metadata
  UPDATE public.users
  SET
    email = COALESCE(new.email, old.email),
    name = COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name',
      old.raw_user_meta_data->>'full_name',
      old.raw_user_meta_data->>'name',
      name
    ),
    avatar_url = COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      old.raw_user_meta_data->>'avatar_url',
      avatar_url
    ),
    updated_at = NOW()
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    (NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data) OR
    (NEW.email IS DISTINCT FROM OLD.email)
  )
  EXECUTE FUNCTION public.handle_user_update();

-- Ensure RLS policies are correct
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Can insert own user data" ON public.users;
DROP POLICY IF EXISTS "Can read own user data" ON public.users;
DROP POLICY IF EXISTS "Can update own user data" ON public.users;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add profile_completed column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE public.users ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;