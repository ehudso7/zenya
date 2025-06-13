-- Complete Database Migration for Zenya AI Learning Platform
-- This script ensures all tables, indexes, and policies are created
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For embeddings (if available)

-- ============================================
-- CURRICULUMS AND LEARNING SYSTEM
-- ============================================

-- Create curriculums table with all premium features
CREATE TABLE IF NOT EXISTS public.curriculums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    estimated_hours INTEGER DEFAULT 0,
    category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    prerequisites UUID[] DEFAULT ARRAY[]::UUID[],
    learning_outcomes TEXT[] DEFAULT ARRAY[]::TEXT[],
    target_audience TEXT,
    instructor_id UUID,
    rating NUMERIC(3,2) DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    completion_rate NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ
);

-- Enhanced lessons table with AI features
DO $$ 
BEGIN
    -- Check if lessons table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        -- Add missing columns if they don't exist
        ALTER TABLE public.lessons 
        ADD COLUMN IF NOT EXISTS curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS slug TEXT,
        ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15,
        ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'easy',
        ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 15,
        ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'standard',
        ADD COLUMN IF NOT EXISTS video_url TEXT,
        ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS quiz_data JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS embedding vector(1536),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    ELSE
        -- Create new lessons table with all features
        CREATE TABLE public.lessons (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            slug TEXT,
            content TEXT NOT NULL,
            content_blocks JSONB DEFAULT '[]'::jsonb,
            order_index INTEGER DEFAULT 0,
            duration_minutes INTEGER DEFAULT 15,
            difficulty_level TEXT DEFAULT 'easy',
            xp_reward INTEGER DEFAULT 10,
            coins_reward INTEGER DEFAULT 5,
            is_active BOOLEAN DEFAULT true,
            is_published BOOLEAN DEFAULT true,
            is_premium BOOLEAN DEFAULT false,
            lesson_type TEXT DEFAULT 'standard',
            video_url TEXT,
            resources JSONB DEFAULT '[]'::jsonb,
            quiz_data JSONB DEFAULT '[]'::jsonb,
            ai_generated BOOLEAN DEFAULT false,
            embedding vector(1536),
            tags TEXT[] DEFAULT ARRAY[]::TEXT[],
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Premium user progress tracking with gamification
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')) DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    score NUMERIC(5,2) DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    time_spent_seconds INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    streak_maintained BOOLEAN DEFAULT false,
    notes TEXT,
    bookmarked BOOLEAN DEFAULT false,
    quiz_results JSONB DEFAULT '[]'::jsonb,
    interaction_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Advanced learning profiles with AI personalization
CREATE TABLE IF NOT EXISTS public.user_learning_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    learning_style TEXT DEFAULT 'visual',
    preferred_difficulty NUMERIC DEFAULT 5,
    strong_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    weak_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    goals TEXT[] DEFAULT ARRAY[]::TEXT[],
    avg_session_time NUMERIC DEFAULT 15,
    best_learning_time TEXT DEFAULT 'morning',
    completion_rate NUMERIC DEFAULT 0,
    engagement_score NUMERIC DEFAULT 0,
    mastery_level INTEGER DEFAULT 1,
    learning_pace TEXT DEFAULT 'moderate',
    preferred_content_types TEXT[] DEFAULT ARRAY['video', 'text', 'interactive']::TEXT[],
    accessibility_needs JSONB DEFAULT '{}'::jsonb,
    ai_recommendations_enabled BOOLEAN DEFAULT true,
    personalization_consent BOOLEAN DEFAULT true,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- AI interaction tracking with embeddings
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE SET NULL,
    session_id UUID,
    message TEXT NOT NULL,
    message_embedding vector(1536),
    response TEXT,
    response_embedding vector(1536),
    mood TEXT,
    tone TEXT,
    provider TEXT,
    model TEXT,
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    quality_score NUMERIC(3,2),
    helpful BOOLEAN,
    flagged BOOLEAN DEFAULT false,
    content_type TEXT,
    interaction_type TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Adaptive learning analytics
CREATE TABLE IF NOT EXISTS public.adaptive_learning_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    profile_snapshot JSONB,
    interaction_data JSONB,
    recommendation_data JSONB,
    performance_metrics JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Embedding classifications for intelligent routing
CREATE TABLE IF NOT EXISTS public.embedding_classifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    input_embedding vector(1536),
    classification JSONB NOT NULL,
    confidence_scores JSONB,
    routing_decision TEXT,
    response_modifications JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Gamification: Achievements and badges
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    rarity TEXT DEFAULT 'common',
    xp_bonus INTEGER DEFAULT 0,
    coin_bonus INTEGER DEFAULT 0,
    icon_url TEXT,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    progress NUMERIC(5,2) DEFAULT 100,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, achievement_id)
);

-- Learning streaks and habits
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_days_learned INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_freeze_available INTEGER DEFAULT 0,
    perfect_weeks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Collaborative learning sessions
CREATE TABLE IF NOT EXISTS public.collaborative_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    session_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'waiting',
    max_participants INTEGER DEFAULT 4,
    current_participants INTEGER DEFAULT 1,
    session_data JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2 hours')
);

-- Voice interaction fine-tuning data
CREATE TABLE IF NOT EXISTS public.voice_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    audio_url TEXT,
    transcript TEXT,
    response_audio_url TEXT,
    response_text TEXT,
    language TEXT DEFAULT 'en-US',
    accent TEXT,
    duration_seconds NUMERIC(10,2),
    quality_score NUMERIC(3,2),
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Curriculum indexes
CREATE INDEX IF NOT EXISTS idx_curriculums_slug ON public.curriculums(slug);
CREATE INDEX IF NOT EXISTS idx_curriculums_active ON public.curriculums(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_curriculums_featured ON public.curriculums(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_curriculums_category ON public.curriculums(category);
CREATE INDEX IF NOT EXISTS idx_curriculums_search ON public.curriculums USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Lesson indexes
CREATE INDEX IF NOT EXISTS idx_lessons_curriculum_id ON public.lessons(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(curriculum_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_active ON public.lessons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lessons_search ON public.lessons USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_curriculum ON public.user_progress(user_id, curriculum_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(completed_at) WHERE completed_at IS NOT NULL;

-- AI interaction indexes
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created ON public.ai_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session ON public.ai_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_quality ON public.ai_interactions(quality_score DESC) WHERE quality_score IS NOT NULL;

-- Learning profile indexes
CREATE INDEX IF NOT EXISTS idx_user_learning_profiles_user_id ON public.user_learning_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_profiles_updated ON public.user_learning_profiles(last_updated DESC);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON public.user_achievements(earned_at DESC);

-- Embedding indexes
CREATE INDEX IF NOT EXISTS idx_embedding_classifications_user_id ON public.embedding_classifications(user_id);
CREATE INDEX IF NOT EXISTS idx_embedding_classifications_created ON public.embedding_classifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embedding_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_interactions ENABLE ROW LEVEL SECURITY;

-- Curriculum policies
CREATE POLICY IF NOT EXISTS "Curriculums viewable by all" ON public.curriculums
    FOR SELECT USING (is_active = true AND is_published = true);

CREATE POLICY IF NOT EXISTS "Curriculum management for admins" ON public.curriculums
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Lesson policies
CREATE POLICY IF NOT EXISTS "Lessons viewable by all" ON public.lessons
    FOR SELECT USING (is_active = true AND is_published = true);

CREATE POLICY IF NOT EXISTS "Premium lessons for subscribers" ON public.lessons
    FOR SELECT USING (
        is_premium = false OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (subscription_status = 'active' OR role = 'admin')
        )
    );

-- User progress policies
CREATE POLICY IF NOT EXISTS "Users view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users manage own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Learning profile policies
CREATE POLICY IF NOT EXISTS "Users manage own profile" ON public.user_learning_profiles
    FOR ALL USING (auth.uid() = user_id);

-- AI interaction policies
CREATE POLICY IF NOT EXISTS "Users manage own AI interactions" ON public.ai_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Achievement policies
CREATE POLICY IF NOT EXISTS "Users view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "System grants achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (true);

-- Streak policies
CREATE POLICY IF NOT EXISTS "Users view own streaks" ON public.user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "System manages streaks" ON public.user_streaks
    FOR ALL USING (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'curriculums', 'lessons', 'user_progress', 
            'user_learning_profiles', 'user_streaks'
        ])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%s_updated_at 
            BEFORE UPDATE ON public.%s
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column()',
            t, t
        );
    EXCEPTION
        WHEN duplicate_object THEN null;
    END LOOP;
END $$;

-- Calculate lesson completion rate
CREATE OR REPLACE FUNCTION calculate_completion_rate(p_curriculum_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_enrolled INTEGER;
    total_completed INTEGER;
BEGIN
    SELECT COUNT(DISTINCT user_id) INTO total_enrolled
    FROM user_progress
    WHERE curriculum_id = p_curriculum_id;
    
    SELECT COUNT(DISTINCT user_id) INTO total_completed
    FROM user_progress
    WHERE curriculum_id = p_curriculum_id
    AND status = 'completed';
    
    IF total_enrolled = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN (total_completed::NUMERIC / total_enrolled) * 100;
END;
$$ LANGUAGE plpgsql;

-- Update streak on activity
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_activity DATE;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Get the user's last activity date
    SELECT last_activity_date INTO last_activity
    FROM user_streaks
    WHERE user_id = NEW.user_id;
    
    -- If no streak record exists, create one
    IF last_activity IS NULL THEN
        INSERT INTO user_streaks (user_id, current_streak, last_activity_date, total_days_learned)
        VALUES (NEW.user_id, 1, current_date, 1)
        ON CONFLICT (user_id) DO NOTHING;
    -- If last activity was yesterday, increment streak
    ELSIF last_activity = current_date - INTERVAL '1 day' THEN
        UPDATE user_streaks
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(current_streak + 1, longest_streak),
            last_activity_date = current_date,
            total_days_learned = total_days_learned + 1
        WHERE user_id = NEW.user_id;
    -- If last activity was today, do nothing
    ELSIF last_activity = current_date THEN
        -- Already counted for today
        NULL;
    -- If last activity was more than 1 day ago, reset streak
    ELSE
        UPDATE user_streaks
        SET current_streak = 1,
            last_activity_date = current_date,
            total_days_learned = total_days_learned + 1
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create streak trigger
CREATE TRIGGER update_streak_on_progress
AFTER INSERT OR UPDATE ON user_progress
FOR EACH ROW
WHEN (NEW.status IN ('completed', 'in_progress'))
EXECUTE FUNCTION update_user_streak();

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================

-- Insert sample curriculums if none exist
INSERT INTO public.curriculums (title, slug, description, difficulty_level, estimated_hours, category, is_active, is_published, is_featured, tags, learning_outcomes)
SELECT * FROM (VALUES
    ('Mathematics Mastery', 'math-mastery', 'Master mathematical concepts from arithmetic to calculus with AI-powered personalized learning', 'beginner', 40, 'mathematics', true, true, true, 
     ARRAY['math', 'algebra', 'geometry', 'calculus']::TEXT[], 
     ARRAY['Solve complex equations', 'Understand mathematical proofs', 'Apply math in real-world scenarios']::TEXT[]),
    
    ('Full-Stack Web Development', 'fullstack-web-dev', 'Build modern web applications with React, Node.js, and cloud technologies', 'intermediate', 120, 'programming', true, true, true,
     ARRAY['javascript', 'react', 'nodejs', 'web', 'fullstack']::TEXT[],
     ARRAY['Build responsive web applications', 'Implement RESTful APIs', 'Deploy to cloud platforms']::TEXT[]),
    
    ('Data Science & AI', 'data-science-ai', 'Learn data analysis, machine learning, and artificial intelligence with hands-on projects', 'advanced', 160, 'technology', true, true, true,
     ARRAY['python', 'machine-learning', 'ai', 'data-science', 'tensorflow']::TEXT[],
     ARRAY['Analyze complex datasets', 'Build ML models', 'Deploy AI solutions']::TEXT[]),
    
    ('Business English Excellence', 'business-english', 'Master professional English communication for global business success', 'intermediate', 60, 'language', true, true, false,
     ARRAY['english', 'business', 'communication', 'professional']::TEXT[],
     ARRAY['Write professional emails', 'Present confidently', 'Negotiate effectively']::TEXT[]),
    
    ('Digital Marketing Pro', 'digital-marketing', 'Become a digital marketing expert with SEO, social media, and analytics', 'beginner', 80, 'business', true, true, false,
     ARRAY['marketing', 'seo', 'social-media', 'analytics', 'digital']::TEXT[],
     ARRAY['Create marketing campaigns', 'Analyze user behavior', 'Optimize conversion rates']::TEXT[])
) AS c(title, slug, description, difficulty_level, estimated_hours, category, is_active, is_published, is_featured, tags, learning_outcomes)
WHERE NOT EXISTS (SELECT 1 FROM public.curriculums LIMIT 1);

-- Insert sample lessons for each curriculum
DO $$
DECLARE
    curr RECORD;
    lesson_order INTEGER;
BEGIN
    FOR curr IN SELECT id, title, slug FROM public.curriculums LOOP
        lesson_order := 1;
        
        -- Introduction lesson
        INSERT INTO public.lessons (
            curriculum_id, title, slug, content, order_index, 
            duration_minutes, difficulty_level, xp_reward, is_active, is_published
        )
        SELECT 
            curr.id,
            'Introduction to ' || curr.title,
            'intro-' || curr.slug,
            'Welcome to ' || curr.title || '! This comprehensive course will guide you through everything you need to know. We use AI-powered personalization to adapt to your learning style.',
            lesson_order,
            20,
            'easy',
            25,
            true,
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM public.lessons 
            WHERE curriculum_id = curr.id 
            AND slug = 'intro-' || curr.slug
        );
        
        lesson_order := lesson_order + 1;
        
        -- Core concepts lesson
        INSERT INTO public.lessons (
            curriculum_id, title, slug, content, order_index,
            duration_minutes, difficulty_level, xp_reward, is_active, is_published
        )
        SELECT
            curr.id,
            'Core Concepts and Foundations',
            'core-' || curr.slug,
            'Master the fundamental concepts that form the foundation of ' || curr.title || '. Interactive exercises and real-world examples included.',
            lesson_order,
            30,
            'medium',
            50,
            true,
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM public.lessons 
            WHERE curriculum_id = curr.id 
            AND slug = 'core-' || curr.slug
        );
        
        lesson_order := lesson_order + 1;
        
        -- Advanced lesson
        INSERT INTO public.lessons (
            curriculum_id, title, slug, content, order_index,
            duration_minutes, difficulty_level, xp_reward, is_active, is_published, is_premium
        )
        SELECT
            curr.id,
            'Advanced Techniques and Best Practices',
            'advanced-' || curr.slug,
            'Take your skills to the next level with advanced techniques, industry best practices, and expert insights.',
            lesson_order,
            45,
            'hard',
            100,
            true,
            true,
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM public.lessons 
            WHERE curriculum_id = curr.id 
            AND slug = 'advanced-' || curr.slug
        );
    END LOOP;
END $$;

-- Create default achievements
INSERT INTO public.user_achievements (user_id, achievement_type, achievement_id, achievement_name, description, category, rarity, xp_bonus, coin_bonus)
SELECT 
    u.id,
    'system',
    'first_steps',
    'First Steps',
    'Complete your first lesson',
    'progress',
    'common',
    50,
    10
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = u.id 
    AND achievement_id = 'first_steps'
)
LIMIT 0; -- Don't actually insert, just define the structure

-- ============================================
-- FINAL SETUP
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh materialized views if any
-- REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_user_statistics;

-- Analyze tables for query optimization
ANALYZE;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database migration completed successfully! All god-tier features are ready.';
END $$;