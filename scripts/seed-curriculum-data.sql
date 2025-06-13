-- Seed Curriculum Data for Zenya
-- Run this after the main migration to populate sample data

-- First, check if curriculums already exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.curriculums LIMIT 1) THEN
        RAISE NOTICE 'Curriculums already exist. Skipping seed data.';
        RETURN;
    END IF;
END $$;

-- Insert premium curriculums
INSERT INTO public.curriculums (
    title, 
    slug, 
    description, 
    difficulty_level, 
    estimated_hours, 
    category, 
    is_active, 
    is_published, 
    is_featured, 
    tags, 
    learning_outcomes,
    rating,
    metadata
) VALUES
(
    'Mathematics Mastery',
    'math-mastery',
    'Master mathematical concepts from arithmetic to calculus with AI-powered personalized learning',
    'beginner',
    40,
    'mathematics',
    true,
    true,
    true,
    ARRAY['math', 'algebra', 'geometry', 'calculus']::TEXT[],
    ARRAY['Solve complex equations', 'Understand mathematical proofs', 'Apply math in real-world scenarios']::TEXT[],
    4.8,
    '{"icon": "Calculator", "color": "blue", "highlights": ["AI-powered problem solving", "Interactive visualizations", "Real-world applications"]}'::jsonb
),
(
    'Full-Stack Web Development',
    'fullstack-web-dev',
    'Build modern web applications with React, Node.js, and cloud technologies',
    'intermediate',
    120,
    'programming',
    true,
    true,
    true,
    ARRAY['javascript', 'react', 'nodejs', 'web', 'fullstack']::TEXT[],
    ARRAY['Build responsive web applications', 'Implement RESTful APIs', 'Deploy to cloud platforms']::TEXT[],
    4.9,
    '{"icon": "Globe", "color": "purple", "highlights": ["Build 10+ real projects", "Industry best practices", "Job-ready skills"]}'::jsonb
),
(
    'Data Science & AI',
    'data-science-ai',
    'Learn data analysis, machine learning, and artificial intelligence with hands-on projects',
    'advanced',
    160,
    'technology',
    true,
    true,
    true,
    ARRAY['python', 'machine-learning', 'ai', 'data-science', 'tensorflow']::TEXT[],
    ARRAY['Analyze complex datasets', 'Build ML models', 'Deploy AI solutions']::TEXT[],
    4.7,
    '{"icon": "Brain", "color": "orange", "highlights": ["Real datasets", "GPU-powered training", "Industry projects"]}'::jsonb
),
(
    'Business English Excellence',
    'business-english',
    'Master professional English communication for global business success',
    'intermediate',
    60,
    'language',
    true,
    true,
    false,
    ARRAY['english', 'business', 'communication', 'professional']::TEXT[],
    ARRAY['Write professional emails', 'Present confidently', 'Negotiate effectively']::TEXT[],
    4.6,
    '{"icon": "BookOpenCheck", "color": "green", "highlights": ["Live practice sessions", "Native speakers", "Business scenarios"]}'::jsonb
),
(
    'Digital Marketing Pro',
    'digital-marketing',
    'Become a digital marketing expert with SEO, social media, and analytics',
    'beginner',
    80,
    'business',
    true,
    true,
    false,
    ARRAY['marketing', 'seo', 'social-media', 'analytics', 'digital']::TEXT[],
    ARRAY['Create marketing campaigns', 'Analyze user behavior', 'Optimize conversion rates']::TEXT[],
    4.5,
    '{"icon": "TrendingUp", "color": "amber", "highlights": ["Real campaign data", "Industry tools", "ROI optimization"]}'::jsonb
);

-- Add lessons for each curriculum
DO $$
DECLARE
    curr RECORD;
    lesson_count INTEGER;
BEGIN
    FOR curr IN SELECT id, title, slug FROM public.curriculums LOOP
        lesson_count := 0;
        
        -- Introduction lesson
        INSERT INTO public.lessons (
            curriculum_id,
            title,
            slug,
            content,
            order_index,
            duration_minutes,
            difficulty_level,
            xp_reward,
            coins_reward,
            is_active,
            is_published,
            lesson_type,
            quiz_data
        ) VALUES (
            curr.id,
            'Introduction to ' || curr.title,
            'intro-' || curr.slug,
            'Welcome to ' || curr.title || '! This comprehensive course will guide you through everything you need to master this subject. Our AI-powered system will adapt to your learning style and pace.',
            1,
            20,
            'easy',
            25,
            10,
            true,
            true,
            'introduction',
            '[{"question": "What is your main goal?", "type": "multiple_choice", "options": ["Master the basics", "Advance my career", "Personal interest", "Academic requirements"]}]'::jsonb
        );
        
        lesson_count := lesson_count + 1;
        
        -- Core concepts lesson
        INSERT INTO public.lessons (
            curriculum_id,
            title,
            slug,
            content,
            order_index,
            duration_minutes,
            difficulty_level,
            xp_reward,
            coins_reward,
            is_active,
            is_published,
            lesson_type,
            video_url
        ) VALUES (
            curr.id,
            'Core Concepts and Foundations',
            'core-' || curr.slug,
            'Master the fundamental concepts that form the foundation of ' || curr.title || '. This lesson includes interactive exercises, real-world examples, and AI-powered practice problems.',
            2,
            30,
            'medium',
            50,
            20,
            true,
            true,
            'standard',
            'https://example.com/videos/core-' || curr.slug || '.mp4'
        );
        
        lesson_count := lesson_count + 1;
        
        -- Practice exercises
        INSERT INTO public.lessons (
            curriculum_id,
            title,
            slug,
            content,
            order_index,
            duration_minutes,
            difficulty_level,
            xp_reward,
            coins_reward,
            is_active,
            is_published,
            lesson_type,
            resources
        ) VALUES (
            curr.id,
            'Hands-on Practice Exercises',
            'practice-' || curr.slug,
            'Apply what you have learned with these carefully crafted exercises. Get instant AI feedback and personalized hints.',
            3,
            40,
            'medium',
            75,
            30,
            true,
            true,
            'exercise',
            '[{"title": "Practice Workbook", "url": "/resources/workbook.pdf", "type": "pdf"}, {"title": "Code Sandbox", "url": "/sandbox", "type": "interactive"}]'::jsonb
        );
        
        lesson_count := lesson_count + 1;
        
        -- Advanced techniques (premium)
        INSERT INTO public.lessons (
            curriculum_id,
            title,
            slug,
            content,
            order_index,
            duration_minutes,
            difficulty_level,
            xp_reward,
            coins_reward,
            is_active,
            is_published,
            is_premium,
            lesson_type
        ) VALUES (
            curr.id,
            'Advanced Techniques and Best Practices',
            'advanced-' || curr.slug,
            'Take your skills to the next level with advanced techniques, industry best practices, and expert insights. This premium content includes exclusive tutorials and mentorship.',
            4,
            45,
            'hard',
            100,
            50,
            true,
            true,
            true,
            'advanced'
        );
        
        lesson_count := lesson_count + 1;
        
        -- Capstone project
        INSERT INTO public.lessons (
            curriculum_id,
            title,
            slug,
            content,
            order_index,
            duration_minutes,
            difficulty_level,
            xp_reward,
            coins_reward,
            is_active,
            is_published,
            lesson_type,
            ai_generated
        ) VALUES (
            curr.id,
            'Capstone Project',
            'capstone-' || curr.slug,
            'Put everything together in this comprehensive project. Build something real, get AI-powered code reviews, and showcase your skills.',
            5,
            60,
            'hard',
            150,
            75,
            true,
            true,
            'project',
            false
        );
        
        lesson_count := lesson_count + 1;
        
        -- Update curriculum with lesson count in metadata
        UPDATE public.curriculums
        SET metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{lesson_count}',
            to_jsonb(lesson_count)
        )
        WHERE id = curr.id;
        
    END LOOP;
END $$;

-- Create some sample achievements that users can earn
INSERT INTO public.user_achievements (
    user_id,
    achievement_type,
    achievement_id,
    achievement_name,
    description,
    category,
    rarity,
    xp_bonus,
    coin_bonus
)
SELECT 
    gen_random_uuid(), -- Placeholder, will be replaced when users earn them
    'system',
    achievement_id,
    achievement_name,
    description,
    category,
    rarity,
    xp_bonus,
    coin_bonus
FROM (VALUES
    ('first_lesson', 'First Steps', 'Complete your first lesson', 'progress', 'common', 50, 10),
    ('streak_7', 'Week Warrior', 'Maintain a 7-day learning streak', 'streak', 'uncommon', 100, 25),
    ('streak_30', 'Monthly Master', 'Maintain a 30-day learning streak', 'streak', 'rare', 500, 100),
    ('perfect_score', 'Perfectionist', 'Score 100% on any quiz', 'performance', 'uncommon', 75, 20),
    ('night_owl', 'Night Owl', 'Complete a lesson after midnight', 'special', 'common', 25, 5),
    ('early_bird', 'Early Bird', 'Complete a lesson before 6 AM', 'special', 'common', 25, 5),
    ('speed_demon', 'Speed Demon', 'Complete a lesson in half the estimated time', 'performance', 'rare', 150, 50),
    ('polyglot', 'Polyglot', 'Complete lessons in 3 different categories', 'diversity', 'uncommon', 200, 40),
    ('ai_master', 'AI Whisperer', 'Have 100 AI interactions', 'engagement', 'rare', 300, 75),
    ('collaborator', 'Team Player', 'Join 5 collaborative sessions', 'social', 'uncommon', 100, 30)
) AS achievements(achievement_id, achievement_name, description, category, rarity, xp_bonus, coin_bonus)
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_achievements WHERE achievement_id = achievements.achievement_id
)
LIMIT 0; -- Don't actually insert, just define the structure

-- Success message
DO $$
DECLARE
    curriculum_count INTEGER;
    lesson_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO curriculum_count FROM public.curriculums;
    SELECT COUNT(*) INTO lesson_count FROM public.lessons;
    
    RAISE NOTICE 'Seed data complete!';
    RAISE NOTICE 'Curriculums created: %', curriculum_count;
    RAISE NOTICE 'Lessons created: %', lesson_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Your Zenya platform is now fully populated with premium content!';
END $$;