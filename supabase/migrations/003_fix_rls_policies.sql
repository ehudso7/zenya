-- Comprehensive RLS Policy Fix for Authentication
-- This ensures all auth-related operations work correctly

-- First, ensure the users table has all necessary columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS learning_preferences JSONB DEFAULT '{}'::jsonb;

-- Update user_id to match id if not set
UPDATE public.users SET user_id = id WHERE user_id IS NULL;

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);

-- Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Can read own user data" ON public.users;
DROP POLICY IF EXISTS "Can update own user data" ON public.users;
DROP POLICY IF EXISTS "Can insert own user data" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Enable read access for authenticated users to own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Enable update for users based on id" 
ON public.users FOR UPDATE 
USING (auth.uid() = id OR auth.uid() = user_id)
WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on id" 
ON public.users FOR DELETE 
USING (auth.uid() = id OR auth.uid() = user_id);

-- Fix user_preferences table RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Can read own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Can update own preferences" ON public.user_preferences;

CREATE POLICY "Enable all operations for users on their preferences" 
ON public.user_preferences FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.users WHERE users.id = user_preferences.user_id))
WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE users.id = user_preferences.user_id));

-- Fix other related tables
-- Fix user_progress table
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress" 
ON public.user_progress FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix collaborative_sessions table
ALTER TABLE public.collaborative_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions they participate in" 
ON public.collaborative_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions" 
ON public.collaborative_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.collaborative_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix achievements table
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all achievements" 
ON public.achievements FOR SELECT 
USING (true);

-- Fix user_achievements table
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own achievements" 
ON public.user_achievements FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix journals table
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own journals" 
ON public.journals FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to check if user profile exists
CREATE OR REPLACE FUNCTION public.user_profile_exists(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_uuid UUID, user_email TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.users (id, user_id, email, created_at, updated_at)
  VALUES (user_uuid, user_uuid, user_email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.user_profile_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO authenticated;

-- Ensure service role can bypass RLS for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;