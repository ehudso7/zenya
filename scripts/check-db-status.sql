-- Database Status Check for Zenya
-- Run this to verify your database setup

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('curriculums', 'lessons', 'user_progress', 'user_learning_profiles', 'ai_interactions')
        THEN '✅ Core table'
        ELSE '📦 Additional table'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN ('curriculums', 'lessons', 'user_progress') THEN 1
        ELSE 2
    END,
    table_name;

-- Check curriculum data
SELECT 
    '📚 Curriculums' as category,
    COUNT(*) as count,
    COUNT(CASE WHEN is_active THEN 1 END) as active,
    COUNT(CASE WHEN is_featured THEN 1 END) as featured
FROM public.curriculums;

-- Check lessons data
SELECT 
    '📖 Lessons' as category,
    COUNT(*) as total,
    COUNT(CASE WHEN is_premium THEN 1 END) as premium,
    COUNT(DISTINCT curriculum_id) as curriculums_with_lessons
FROM public.lessons;

-- Check if any users have progress
SELECT 
    '📊 User Progress' as category,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_progress_records,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM public.user_progress;

-- Show sample curriculums
SELECT 
    title,
    slug,
    difficulty_level,
    estimated_hours,
    is_active,
    is_featured,
    COALESCE((metadata->>'lesson_count')::int, 0) as lesson_count
FROM public.curriculums
ORDER BY is_featured DESC, title
LIMIT 10;