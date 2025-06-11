-- Production-grade database optimizations for Zenya AI Learning Platform
-- This migration adds comprehensive indexing, constraints, and performance optimizations

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Critical composite indexes for user progress queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_status 
ON public.user_progress(user_id, status) 
WHERE status IN ('in_progress', 'completed');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_curriculum_user 
ON public.user_progress(curriculum_id, user_id, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_lesson_user 
ON public.user_progress(lesson_id, user_id) 
WHERE status = 'completed';

-- Lesson performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_curriculum_order_active 
ON public.lessons(curriculum_id, order_index, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_difficulty_xp 
ON public.lessons(difficulty_level, xp_reward) 
WHERE is_active = true;

-- User session and activity indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_started 
ON public.user_sessions(user_id, started_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_lesson_date 
ON public.user_sessions(lesson_id, started_at::date);

-- Achievement tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user_earned 
ON public.user_achievements(user_id, earned_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_type 
ON public.user_achievements(achievement_type, earned_at DESC);

-- Contact submissions indexes for admin dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_submissions_status_date 
ON public.contact_submissions(status, submitted_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_submissions_email 
ON public.contact_submissions(email, submitted_at DESC);

-- User preferences and settings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user 
ON public.user_preferences(user_id);

-- ============================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================

-- User progress constraints
ALTER TABLE public.user_progress 
ADD CONSTRAINT chk_user_progress_xp_earned 
CHECK (xp_earned >= 0 AND xp_earned <= 1000);

ALTER TABLE public.user_progress 
ADD CONSTRAINT chk_user_progress_time_spent 
CHECK (time_spent_seconds >= 0 AND time_spent_seconds <= 86400); -- Max 24 hours per lesson

-- Lesson constraints
ALTER TABLE public.lessons 
ADD CONSTRAINT chk_lessons_duration 
CHECK (duration_minutes > 0 AND duration_minutes <= 480); -- Max 8 hours

ALTER TABLE public.lessons 
ADD CONSTRAINT chk_lessons_xp_reward 
CHECK (xp_reward >= 0 AND xp_reward <= 1000);

ALTER TABLE public.lessons 
ADD CONSTRAINT chk_lessons_order_index 
CHECK (order_index >= 0);

-- User constraints
ALTER TABLE public.users 
ADD CONSTRAINT chk_users_current_xp 
CHECK (current_xp >= 0);

ALTER TABLE public.users 
ADD CONSTRAINT chk_users_streak_count 
CHECK (streak_count >= 0);

-- Curriculum constraints
ALTER TABLE public.curriculums 
ADD CONSTRAINT chk_curriculums_estimated_hours 
CHECK (estimated_hours >= 0 AND estimated_hours <= 1000);

-- User session constraints
ALTER TABLE public.user_sessions 
ADD CONSTRAINT chk_user_sessions_focus_level 
CHECK (focus_level IS NULL OR (focus_level >= 1 AND focus_level <= 5));

ALTER TABLE public.user_sessions 
ADD CONSTRAINT chk_user_sessions_time_range 
CHECK (ended_at IS NULL OR ended_at >= started_at);

-- ============================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Partial indexes for frequently filtered data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_last_login 
ON public.users(last_login DESC) 
WHERE last_login > CURRENT_DATE - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_recent_active 
ON public.lessons(created_at DESC) 
WHERE is_active = true AND created_at > CURRENT_DATE - INTERVAL '90 days';

-- Covering indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_covering 
ON public.user_progress(user_id, lesson_id) 
INCLUDE (status, completed_at, xp_earned, time_spent_seconds);

-- ============================================
-- FULL-TEXT SEARCH OPTIMIZATION
-- ============================================

-- Add GIN indexes for full-text search on lesson content
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update search vector for existing lessons
UPDATE public.lessons 
SET search_vector = to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, ''))
WHERE search_vector IS NULL;

-- Create GIN index for fast text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_search_vector 
ON public.lessons USING gin(search_vector);

-- Trigger to automatically update search vector
CREATE OR REPLACE FUNCTION update_lesson_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lesson_search_vector ON public.lessons;
CREATE TRIGGER trigger_update_lesson_search_vector
    BEFORE INSERT OR UPDATE OF title, content
    ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_lesson_search_vector();

-- ============================================
-- PARTITIONING FOR LARGE TABLES
-- ============================================

-- Partition user_sessions by month for better performance
-- Note: This would be implemented in a separate migration for existing data

-- Create partitioned table for audit logs (future-proofing)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for current and next few months
DO $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..11 LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        end_date := start_date + '1 month'::INTERVAL;
        partition_name := 'audit_logs_' || TO_CHAR(start_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.audit_logs 
                       FOR VALUES FROM (%L) TO (%L)', 
                       partition_name, start_date, end_date);
    END LOOP;
END $$;

-- ============================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- User learning statistics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_learning_stats AS
SELECT 
    u.id AS user_id,
    u.email,
    u.created_at AS user_created_at,
    COUNT(DISTINCT up.lesson_id) FILTER (WHERE up.status = 'completed') AS lessons_completed,
    COUNT(DISTINCT up.curriculum_id) AS curricula_enrolled,
    COALESCE(SUM(up.xp_earned), 0) AS total_xp_earned,
    COALESCE(SUM(up.time_spent_seconds), 0) AS total_time_spent_seconds,
    MAX(up.completed_at) AS last_lesson_completed,
    COUNT(DISTINCT DATE(us.started_at)) AS active_days,
    AVG(us.focus_level) FILTER (WHERE us.focus_level IS NOT NULL) AS avg_focus_level
FROM public.users u
LEFT JOIN public.user_progress up ON u.id = up.user_id
LEFT JOIN public.user_sessions us ON u.id = us.user_id
GROUP BY u.id, u.email, u.created_at;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_learning_stats_user_id 
ON public.user_learning_stats(user_id);

-- Lesson popularity and difficulty analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.lesson_analytics AS
SELECT 
    l.id AS lesson_id,
    l.title,
    l.curriculum_id,
    l.difficulty_level,
    l.xp_reward,
    l.duration_minutes,
    COUNT(up.id) AS total_attempts,
    COUNT(up.id) FILTER (WHERE up.status = 'completed') AS completions,
    ROUND(
        COUNT(up.id) FILTER (WHERE up.status = 'completed')::NUMERIC / 
        NULLIF(COUNT(up.id), 0) * 100, 2
    ) AS completion_rate,
    AVG(up.time_spent_seconds) FILTER (WHERE up.status = 'completed') AS avg_completion_time,
    AVG(us.focus_level) FILTER (WHERE us.focus_level IS NOT NULL) AS avg_focus_level,
    COUNT(DISTINCT up.user_id) AS unique_users
FROM public.lessons l
LEFT JOIN public.user_progress up ON l.id = up.lesson_id
LEFT JOIN public.user_sessions us ON l.id = us.lesson_id
WHERE l.is_active = true
GROUP BY l.id, l.title, l.curriculum_id, l.difficulty_level, l.xp_reward, l.duration_minutes;

-- Create unique index on lesson analytics
CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_analytics_lesson_id 
ON public.lesson_analytics(lesson_id);

-- ============================================
-- AUTOMATIC MAINTENANCE PROCEDURES
-- ============================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_learning_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.lesson_analytics;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old audit logs (keep 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.audit_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Function to update user streaks
CREATE OR REPLACE FUNCTION update_user_streaks()
RETURNS void AS $$
BEGIN
    WITH user_activity AS (
        SELECT 
            up.user_id,
            DATE(up.completed_at) AS activity_date,
            ROW_NUMBER() OVER (PARTITION BY up.user_id ORDER BY DATE(up.completed_at) DESC) AS day_rank
        FROM public.user_progress up
        WHERE up.status = 'completed' 
        AND up.completed_at >= CURRENT_DATE - INTERVAL '365 days'
        GROUP BY up.user_id, DATE(up.completed_at)
    ),
    streak_calculation AS (
        SELECT 
            user_id,
            COUNT(*) AS current_streak
        FROM user_activity
        WHERE activity_date >= CURRENT_DATE - (day_rank - 1)
        AND activity_date = CURRENT_DATE - (day_rank - 1)
        GROUP BY user_id
    )
    UPDATE public.users 
    SET streak_count = COALESCE(sc.current_streak, 0)
    FROM streak_calculation sc
    WHERE users.id = sc.user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERFORMANCE MONITORING
-- ============================================

-- View for monitoring slow queries
CREATE OR REPLACE VIEW public.slow_query_monitor AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 100 -- Queries taking more than 100ms on average
ORDER BY total_time DESC;

-- ============================================
-- ROW LEVEL SECURITY UPDATES
-- ============================================

-- More granular RLS policies for user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'admin'
    );

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        -- Prevent XP manipulation
        xp_earned <= (SELECT xp_reward FROM public.lessons WHERE id = lesson_id)
    );

-- Admin access policies for contact submissions
DROP POLICY IF EXISTS "Admin only access to contact submissions" ON public.contact_submissions;
CREATE POLICY "Admin read access to contact submissions" ON public.contact_submissions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin update access to contact submissions" ON public.contact_submissions
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- COMMENTS AND DOCUMENTATION
-- ============================================

COMMENT ON INDEX idx_user_progress_user_status IS 'Optimizes user progress queries filtered by status';
COMMENT ON INDEX idx_lessons_curriculum_order_active IS 'Optimizes lesson ordering within curricula';
COMMENT ON MATERIALIZED VIEW user_learning_stats IS 'Provides aggregated user learning metrics for analytics';
COMMENT ON MATERIALIZED VIEW lesson_analytics IS 'Provides lesson performance and engagement metrics';
COMMENT ON FUNCTION refresh_analytics_views() IS 'Refreshes all materialized views for updated analytics';
COMMENT ON FUNCTION update_user_streaks() IS 'Calculates and updates user learning streaks based on daily activity';

-- ============================================
-- PERFORMANCE STATISTICS
-- ============================================

-- Enable query statistics collection if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Ensure proper statistics targets for better query planning
ALTER TABLE public.users ALTER COLUMN id SET STATISTICS 1000;
ALTER TABLE public.lessons ALTER COLUMN curriculum_id SET STATISTICS 1000;
ALTER TABLE public.user_progress ALTER COLUMN user_id SET STATISTICS 1000;
ALTER TABLE public.user_progress ALTER COLUMN lesson_id SET STATISTICS 1000;