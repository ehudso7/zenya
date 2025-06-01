-- Create demo user for testing
-- Run this in Supabase SQL Editor after running setup-database.sql

-- First, create the auth user (this needs to be done via Supabase dashboard or API)
-- Email: demo@zenyaai.com
-- Password: demo-password-2025

-- Once the auth user exists, create their profile
-- Replace 'YOUR-DEMO-USER-UUID' with the actual UUID from auth.users table
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get the demo user ID
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@zenyaai.com';
    
    IF demo_user_id IS NOT NULL THEN
        -- Create or update the user profile
        INSERT INTO public.users (
            id,
            email,
            name,
            bio,
            onboarding_completed,
            total_xp,
            streak_count
        ) VALUES (
            demo_user_id,
            'demo@zenyaai.com',
            'Demo User',
            'Just exploring Zenya!',
            true,
            250,
            3
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            onboarding_completed = EXCLUDED.onboarding_completed,
            total_xp = EXCLUDED.total_xp,
            streak_count = EXCLUDED.streak_count;
        
        -- Add some progress for the demo user
        -- Get a curriculum and lesson
        DECLARE
            curr_id UUID;
            lesson_id UUID;
        BEGIN
            SELECT id INTO curr_id FROM public.curriculums WHERE slug = 'web-dev-101' LIMIT 1;
            SELECT id INTO lesson_id FROM public.lessons WHERE curriculum_id = curr_id ORDER BY order_index LIMIT 1;
            
            IF lesson_id IS NOT NULL THEN
                INSERT INTO public.user_progress (
                    user_id,
                    lesson_id,
                    curriculum_id,
                    status,
                    completed_at,
                    xp_earned
                ) VALUES (
                    demo_user_id,
                    lesson_id,
                    curr_id,
                    'completed',
                    NOW(),
                    10
                )
                ON CONFLICT (user_id, lesson_id) DO NOTHING;
            END IF;
        END;
        
        RAISE NOTICE 'Demo user profile created/updated successfully';
    ELSE
        RAISE NOTICE 'Demo user not found in auth.users. Please create the user first via Supabase dashboard.';
    END IF;
END $$;