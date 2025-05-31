-- Add email and profile fields to users table
ALTER TABLE users 
ADD COLUMN email TEXT UNIQUE,
ADD COLUMN name TEXT,
ADD COLUMN avatar_url TEXT,
ADD COLUMN bio TEXT,
ADD COLUMN learning_style TEXT,
ADD COLUMN notification_preferences JSONB DEFAULT '{"email": false, "push": false}'::jsonb,
ADD COLUMN timezone TEXT DEFAULT 'UTC',
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, last_login)
  VALUES (new.id, new.email, new.created_at, new.created_at);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing RLS policies to include email
DROP POLICY IF EXISTS "Can insert own user data" ON users;
CREATE POLICY "Can insert own user data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create user preferences table for more complex settings
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system',
  font_size TEXT DEFAULT 'medium',
  contrast_mode BOOLEAN DEFAULT FALSE,
  reduce_animations BOOLEAN DEFAULT FALSE,
  focus_mode BOOLEAN DEFAULT FALSE,
  daily_goal_minutes INTEGER DEFAULT 30,
  reminder_time TIME,
  preferred_topics TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for preferences
CREATE POLICY "Can read own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for preferences
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Function to update user last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users 
  SET last_login = NOW() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_login on auth
CREATE TRIGGER update_user_last_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (NEW.last_sign_in_at IS NOT NULL AND NEW.last_sign_in_at != OLD.last_sign_in_at)
  EXECUTE FUNCTION update_last_login();