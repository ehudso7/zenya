-- Zenya AI Learning Platform - Curriculum Seed Data
-- Production-ready curriculum content for immediate deployment

-- Insert main curriculums
INSERT INTO public.curriculums (id, title, description, difficulty_level, estimated_duration_hours, is_active, slug, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Web Development Fundamentals', 'Master the core technologies that power the modern web: HTML, CSS, and JavaScript. Build responsive websites and interactive web applications from scratch.', 'beginner', 40, true, 'web-dev-fundamentals', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Python Programming Essentials', 'Learn Python programming from basics to advanced concepts. Cover data structures, algorithms, object-oriented programming, and popular frameworks.', 'beginner', 35, true, 'python-essentials', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Data Science with Python', 'Dive into data science using Python, pandas, NumPy, and machine learning libraries. Learn to analyze data and build predictive models.', 'intermediate', 50, true, 'data-science-python', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'React.js Development', 'Build modern, interactive user interfaces with React. Learn hooks, state management, component architecture, and best practices.', 'intermediate', 45, true, 'react-development', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Machine Learning Fundamentals', 'Understand machine learning algorithms, supervised and unsupervised learning, and practical applications in real-world scenarios.', 'advanced', 60, true, 'machine-learning-fundamentals', NOW(), NOW());

-- Insert sample lessons  
INSERT INTO public.lessons (id, curriculum_id, title, content, lesson_order, estimated_duration_minutes, is_active, lesson_type, created_at, updated_at) VALUES
('lesson-001', '550e8400-e29b-41d4-a716-446655440001', 'Introduction to HTML', 'Learn HTML fundamentals and structure web pages.', 1, 45, true, 'lesson', NOW(), NOW()),
('lesson-002', '550e8400-e29b-41d4-a716-446655440001', 'CSS Fundamentals', 'Style web pages with CSS.', 2, 50, true, 'lesson', NOW(), NOW()),
('lesson-101', '550e8400-e29b-41d4-a716-446655440002', 'Python Basics', 'Learn Python syntax and fundamentals.', 1, 40, true, 'lesson', NOW(), NOW());
EOF < /dev/null