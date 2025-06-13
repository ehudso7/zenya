-- Ensure curriculums and related tables exist
-- This migration ensures all learning system tables are created

-- Create curriculums table if not exists
CREATE TABLE IF NOT EXISTS public.curriculums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    estimated_hours INTEGER DEFAULT 0,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create lessons table if not exists (update schema to match current needs)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lessons' 
                   AND column_name = 'curriculum_id') THEN
        -- Add curriculum_id to existing lessons table
        ALTER TABLE public.lessons 
        ADD COLUMN curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE CASCADE,
        ADD COLUMN slug TEXT,
        ADD COLUMN order_index INTEGER DEFAULT 0,
        ADD COLUMN duration_minutes INTEGER DEFAULT 15,
        ADD COLUMN difficulty_level TEXT DEFAULT 'easy',
        ADD COLUMN xp_reward INTEGER DEFAULT 10,
        ADD COLUMN is_active BOOLEAN DEFAULT true,
        ADD COLUMN is_published BOOLEAN DEFAULT true,
        ADD COLUMN estimated_time INTEGER DEFAULT 15,
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create user_progress table if not exists
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    time_spent_seconds INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Create adaptive learning tables
CREATE TABLE IF NOT EXISTS public.user_learning_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    learning_style TEXT DEFAULT 'visual',
    preferred_difficulty NUMERIC DEFAULT 5,
    strong_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    weak_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    avg_session_time NUMERIC DEFAULT 15,
    completion_rate NUMERIC DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    response TEXT,
    mood TEXT,
    tone TEXT,
    provider TEXT,
    model TEXT,
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    content_type TEXT,
    reading_time INTEGER,
    avg_reading_time INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.adaptive_learning_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    profile_snapshot JSONB,
    interaction_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create embedding classifications table
CREATE TABLE IF NOT EXISTS public.embedding_classifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    classification JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_curriculums_slug ON public.curriculums(slug);
CREATE INDEX IF NOT EXISTS idx_curriculums_active ON public.curriculums(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lessons_curriculum_id ON public.lessons(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(curriculum_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_learning_profiles_user_id ON public.user_learning_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created ON public.ai_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embedding_classifications_user_id ON public.embedding_classifications(user_id);
CREATE INDEX IF NOT EXISTS idx_embedding_classifications_created ON public.embedding_classifications(created_at DESC);

-- Add RLS policies
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embedding_classifications ENABLE ROW LEVEL SECURITY;

-- Curriculums are readable by everyone
CREATE POLICY IF NOT EXISTS "Curriculums are viewable by everyone" ON public.curriculums
    FOR SELECT USING (is_active = true);

-- Users can only manage their own learning profiles
CREATE POLICY IF NOT EXISTS "Users can view own learning profile" ON public.user_learning_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own learning profile" ON public.user_learning_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own learning profile" ON public.user_learning_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only view their own AI interactions
CREATE POLICY IF NOT EXISTS "Users can view own AI interactions" ON public.ai_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own AI interactions" ON public.ai_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin access to learning logs (no user access)
CREATE POLICY IF NOT EXISTS "Only admins can view learning logs" ON public.adaptive_learning_logs
    FOR SELECT USING (false);

-- Users can manage their own embedding classifications
CREATE POLICY IF NOT EXISTS "Users can view own classifications" ON public.embedding_classifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own classifications" ON public.embedding_classifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update lessons RLS if needed
DROP POLICY IF EXISTS "Public read access" ON public.lessons;
CREATE POLICY IF NOT EXISTS "Lessons are viewable by everyone" ON public.lessons
    FOR SELECT USING (is_active = true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_curriculums_updated_at BEFORE UPDATE ON public.curriculums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_profiles_updated_at BEFORE UPDATE ON public.user_learning_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();