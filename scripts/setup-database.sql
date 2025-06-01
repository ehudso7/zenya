-- This script sets up the complete database schema for Zenya

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS curriculums CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    bio TEXT,
    avatar_url TEXT,
    learning_style TEXT,
    timezone TEXT DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT false,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    streak_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'landing',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mood_tracking BOOLEAN DEFAULT true,
    daily_reminder_time TIME,
    lesson_duration_minutes INTEGER DEFAULT 5,
    difficulty_preference TEXT DEFAULT 'adaptive',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create curriculums table
CREATE TABLE IF NOT EXISTS public.curriculums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    estimated_hours INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 5,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
    xp_reward INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT,
    xp_bonus INTEGER DEFAULT 0,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    mood_start TEXT,
    mood_end TEXT,
    focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 5),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_lessons_curriculum_id ON public.lessons(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(curriculum_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Waitlist policies (public access)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
    FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Curriculums are viewable by everyone
CREATE POLICY "Curriculums are viewable by everyone" ON public.curriculums
    FOR SELECT USING (is_active = true);

-- Lessons are viewable by everyone
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons
    FOR SELECT USING (is_active = true);

-- User progress policies
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_curriculums_updated_at
    BEFORE UPDATE ON public.curriculums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert sample curriculums
INSERT INTO public.curriculums (title, description, slug, difficulty_level, estimated_hours) VALUES
('Math Basics', 'Master fundamental math concepts with bite-sized lessons', 'math-basics', 'beginner', 10),
('Web Development 101', 'Learn the basics of HTML, CSS, and JavaScript', 'web-dev-101', 'beginner', 20),
('English Grammar', 'Improve your writing with essential grammar rules', 'english-grammar', 'beginner', 15),
('Science Explorers', 'Discover the wonders of science through simple experiments', 'science-explorers', 'beginner', 12),
('History Adventures', 'Journey through time with engaging historical stories', 'history-adventures', 'intermediate', 18)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample lessons (using a DO block to get curriculum IDs)
DO $$
DECLARE
    math_id UUID;
    webdev_id UUID;
    english_id UUID;
    science_id UUID;
    history_id UUID;
BEGIN
    SELECT id INTO math_id FROM public.curriculums WHERE slug = 'math-basics';
    SELECT id INTO webdev_id FROM public.curriculums WHERE slug = 'web-dev-101';
    SELECT id INTO english_id FROM public.curriculums WHERE slug = 'english-grammar';
    SELECT id INTO science_id FROM public.curriculums WHERE slug = 'science-explorers';
    SELECT id INTO history_id FROM public.curriculums WHERE slug = 'history-adventures';

    -- Only insert if curriculums exist and lessons don't
    IF math_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.lessons WHERE curriculum_id = math_id) THEN
        -- Math Basics lessons
        INSERT INTO public.lessons (curriculum_id, title, content, order_index, difficulty_level, xp_reward) VALUES
        (math_id, 'Understanding Numbers', 'Let''s explore how numbers work in everyday life. We''ll start with counting and basic number recognition.', 1, 'easy', 10),
        (math_id, 'Addition Made Simple', 'Adding numbers is like combining groups. Imagine you have 3 apples and get 2 more!', 2, 'easy', 15),
        (math_id, 'Subtraction Basics', 'Taking away is just as important as adding. Let''s learn how to subtract with fun examples.', 3, 'easy', 15),
        (math_id, 'Introduction to Fractions', 'Fractions are everywhere - in pizza slices, pie pieces, and more! Let''s understand parts of a whole.', 4, 'medium', 20),
        (math_id, 'Multiplying Numbers', 'Multiplication is repeated addition. If you have 3 groups of 4 items, how many do you have total?', 5, 'medium', 25);
    END IF;

    IF webdev_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.lessons WHERE curriculum_id = webdev_id) THEN
        -- Web Development lessons
        INSERT INTO public.lessons (curriculum_id, title, content, order_index, difficulty_level, xp_reward) VALUES
        (webdev_id, 'What is HTML?', 'HTML is the skeleton of websites. It''s like the frame of a house that gives structure to everything you see online.', 1, 'easy', 10),
        (webdev_id, 'Your First HTML Page', 'Let''s create a simple webpage with a title and some text. It''s easier than you think!', 2, 'easy', 15),
        (webdev_id, 'Styling with CSS', 'CSS is like the paint and decorations for your HTML house. It makes things look pretty!', 3, 'medium', 20),
        (webdev_id, 'JavaScript Basics', 'JavaScript brings your website to life - it''s what makes buttons click and things move!', 4, 'medium', 25),
        (webdev_id, 'Building Interactive Elements', 'Let''s combine HTML, CSS, and JavaScript to create something that responds when you interact with it.', 5, 'hard', 30);
    END IF;

    IF english_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.lessons WHERE curriculum_id = english_id) THEN
        -- English Grammar lessons
        INSERT INTO public.lessons (curriculum_id, title, content, order_index, difficulty_level, xp_reward) VALUES
        (english_id, 'Parts of Speech', 'Words have different jobs in sentences. Let''s meet nouns, verbs, and their friends!', 1, 'easy', 10),
        (english_id, 'Building Sentences', 'A sentence is like a train - it needs an engine (subject) and cars (predicate) to go somewhere!', 2, 'easy', 15),
        (english_id, 'Punctuation Marks', 'Periods, commas, and question marks are like traffic signs for readers. They tell us when to stop, pause, or ask!', 3, 'medium', 20),
        (english_id, 'Common Grammar Mistakes', 'Even experienced writers make mistakes. Let''s learn about the most common ones and how to avoid them.', 4, 'medium', 25),
        (english_id, 'Writing Clear Paragraphs', 'A good paragraph is like a mini-story with a beginning, middle, and end. Let''s practice!', 5, 'hard', 30);
    END IF;
END $$;