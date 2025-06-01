-- Insert sample curriculums
INSERT INTO public.curriculums (title, description, slug, difficulty_level, estimated_hours) VALUES
('Math Basics', 'Master fundamental math concepts with bite-sized lessons', 'math-basics', 'beginner', 10),
('Web Development 101', 'Learn the basics of HTML, CSS, and JavaScript', 'web-dev-101', 'beginner', 20),
('English Grammar', 'Improve your writing with essential grammar rules', 'english-grammar', 'beginner', 15),
('Science Explorers', 'Discover the wonders of science through simple experiments', 'science-explorers', 'beginner', 12),
('History Adventures', 'Journey through time with engaging historical stories', 'history-adventures', 'intermediate', 18);

-- Get curriculum IDs for inserting lessons
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

    -- Math Basics lessons
    INSERT INTO public.lessons (curriculum_id, title, content, order_index, difficulty_level, xp_reward) VALUES
    (math_id, 'Understanding Numbers', 'Let''s explore how numbers work in everyday life. We''ll start with counting and basic number recognition.', 1, 'easy', 10),
    (math_id, 'Addition Made Simple', 'Adding numbers is like combining groups. Imagine you have 3 apples and get 2 more!', 2, 'easy', 15),
    (math_id, 'Subtraction Basics', 'Taking away is just as important as adding. Let''s learn how to subtract with fun examples.', 3, 'easy', 15),
    (math_id, 'Introduction to Fractions', 'Fractions are everywhere - in pizza slices, pie pieces, and more! Let''s understand parts of a whole.', 4, 'medium', 20),
    (math_id, 'Multiplying Numbers', 'Multiplication is repeated addition. If you have 3 groups of 4 items, how many do you have total?', 5, 'medium', 25);

    -- Web Development lessons
    INSERT INTO public.lessons (curriculum_id, title, content, order_index, difficulty_level, xp_reward) VALUES
    (webdev_id, 'What is HTML?', 'HTML is the skeleton of websites. It''s like the frame of a house that gives structure to everything you see online.', 1, 'easy', 10),
    (webdev_id, 'Your First HTML Page', 'Let''s create a simple webpage with a title and some text. It''s easier than you think!', 2, 'easy', 15),
    (webdev_id, 'Styling with CSS', 'CSS is like the paint and decorations for your HTML house. It makes things look pretty!', 3, 'medium', 20),
    (webdev_id, 'JavaScript Basics', 'JavaScript brings your website to life - it''s what makes buttons click and things move!', 4, 'medium', 25),
    (webdev_id, 'Building Interactive Elements', 'Let''s combine HTML, CSS, and JavaScript to create something that responds when you interact with it.', 5, 'hard', 30);

    -- English Grammar lessons
    INSERT INTO public.lessons (curriculum_id, title, content, order_index, difficulty_level, xp_reward) VALUES
    (english_id, 'Parts of Speech', 'Words have different jobs in sentences. Let''s meet nouns, verbs, and their friends!', 1, 'easy', 10),
    (english_id, 'Building Sentences', 'A sentence is like a train - it needs an engine (subject) and cars (predicate) to go somewhere!', 2, 'easy', 15),
    (english_id, 'Punctuation Marks', 'Periods, commas, and question marks are like traffic signs for readers. They tell us when to stop, pause, or ask!', 3, 'medium', 20),
    (english_id, 'Common Grammar Mistakes', 'Even experienced writers make mistakes. Let''s learn about the most common ones and how to avoid them.', 4, 'medium', 25),
    (english_id, 'Writing Clear Paragraphs', 'A good paragraph is like a mini-story with a beginning, middle, and end. Let''s practice!', 5, 'hard', 30);

    -- Science Explorers lessons
    INSERT INTO public.lessons (curriculum_id, title, content, order_index, difficulty_level, xp_reward) VALUES
    (science_id, 'What is Science?', 'Science is all about asking questions and finding answers. Let''s become science detectives!', 1, 'easy', 10),
    (science_id, 'States of Matter', 'Everything around us is solid, liquid, or gas. Ice, water, and steam are all H2O in different forms!', 2, 'easy', 15),
    (science_id, 'Plants and Photosynthesis', 'Plants are like tiny factories that turn sunlight into food. How cool is that?', 3, 'medium', 20),
    (science_id, 'Simple Machines', 'Levers, pulleys, and wheels make our lives easier. You use simple machines every day!', 4, 'medium', 25),
    (science_id, 'The Solar System', 'Our Earth is just one planet orbiting the Sun. Let''s explore our cosmic neighborhood!', 5, 'hard', 30);

    -- History Adventures lessons
    INSERT INTO public.lessons (curriculum_id, title, content, order_index, difficulty_level, xp_reward) VALUES
    (history_id, 'What is History?', 'History is the story of people who lived before us. Their choices shaped the world we live in today!', 1, 'easy', 10),
    (history_id, 'Ancient Civilizations', 'Long ago, people built pyramids, invented writing, and created the first cities. Let''s time travel!', 2, 'medium', 20),
    (history_id, 'The Age of Exploration', 'Brave explorers sailed unknown seas to discover new lands. Some found more than they bargained for!', 3, 'medium', 25),
    (history_id, 'Industrial Revolution', 'Machines changed everything! From horse carriages to trains, the world transformed rapidly.', 4, 'hard', 30),
    (history_id, 'Modern History', 'The 20th century brought cars, planes, computers, and the internet. Change happened faster than ever!', 5, 'hard', 35);
END $$;