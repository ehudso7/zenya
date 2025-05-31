-- Seed lessons data
INSERT INTO lessons (title, content, tags, difficulty) VALUES
('Understanding Fractions', 
  '[{"type": "greeting", "content": "👋 Hey! Ready to learn something quick and useful?"}, {"type": "topic", "content": "Today''s nugget: A fraction just means ''part of a whole.'' 🍕"}, {"type": "explanation", "content": "Imagine cutting a pizza into 4 slices. If you eat 1, that''s 1/4."}, {"type": "practice", "content": "Now you try: What''s 3 out of 4 slices? Type it as a fraction!"}, {"type": "success", "content": "✅ Nice! That''s 3/4. Fractions = portions. Easy, right?"}, {"type": "reflection", "content": "📒 Saving your progress. You''re doing great today!"}]'::jsonb,
  ARRAY['math', 'basics'],
  'easy'),

('Estimating Sums',
  '[{"type": "greeting", "content": "👋 Hey! Ready for today''s quick brain boost?"}, {"type": "topic", "content": "🔍 Topic: Estimating Sums - guessing totals without exact math!"}, {"type": "explanation", "content": "Round numbers to the nearest 10: 23→20, 47→50. Then add: 20+50=70!"}, {"type": "practice", "content": "Your turn! Estimate 38 + 54. Round then add. What do you get?"}, {"type": "success", "content": "✅ Great job! Estimating saves time and mental energy."}, {"type": "reflection", "content": "📒 Progress saved. Small wins add up to big victories!"}]'::jsonb,
  ARRAY['math', 'mental-math'],
  'easy'),

('Reading Graphs',
  '[{"type": "greeting", "content": "👋 Let''s decode some visual data today!"}, {"type": "topic", "content": "📊 Graphs tell stories with pictures instead of words."}, {"type": "explanation", "content": "Start with the title, then check axes labels. Height = value!"}, {"type": "practice", "content": "If a bar reaches 30 on the y-axis, what''s its value?"}, {"type": "success", "content": "✅ Exactly! You''re becoming a data detective!"}, {"type": "reflection", "content": "📒 Another skill unlocked. Keep building!"}]'::jsonb,
  ARRAY['math', 'data'],
  'medium'),

('Percentages Made Simple',
  '[{"type": "greeting", "content": "👋 Ready to master percentages the easy way?"}, {"type": "topic", "content": "💯 Percent = \"per 100\" or \"out of 100\""}, {"type": "explanation", "content": "50% = half, 25% = quarter, 10% = move decimal left once"}, {"type": "practice", "content": "Quick! What''s 10% of 80? (Hint: move the decimal)"}, {"type": "success", "content": "✅ Yes! 8! You''ve got this pattern down!"}, {"type": "reflection", "content": "📒 Math confidence +10 XP!"}]'::jsonb,
  ARRAY['math', 'percentages'],
  'medium'),

('Pomodoro Technique Basics',
  '[{"type": "greeting", "content": "👋 Let''s boost your focus with a simple trick!"}, {"type": "topic", "content": "🍅 The Pomodoro: 25 min work, 5 min break"}, {"type": "explanation", "content": "Set timer for 25 min. Focus on ONE task. Break when timer rings!"}, {"type": "practice", "content": "What would you work on for your first 25-minute sprint?"}, {"type": "success", "content": "✅ Perfect choice! Small time boxes = big productivity!"}, {"type": "reflection", "content": "📒 Focus skill upgraded! Try it today!"}]'::jsonb,
  ARRAY['focus', 'productivity'],
  'easy'),

('Avoiding Multitasking',
  '[{"type": "greeting", "content": "👋 Time for a game-changing focus tip!"}, {"type": "topic", "content": "🎯 Single-tasking beats multitasking every time"}, {"type": "explanation", "content": "Your brain switches tasks, not does them together. Each switch = lost time!"}, {"type": "practice", "content": "Name one task you''ll give 100% attention to today:"}, {"type": "success", "content": "✅ Smart! One thing done well > many things done poorly"}, {"type": "reflection", "content": "📒 Focus is your superpower. Use it wisely!"}]'::jsonb,
  ARRAY['focus', 'adhd-tips'],
  'easy'),

('Memory Palace Introduction',
  '[{"type": "greeting", "content": "👋 Ready to remember like a champion?"}, {"type": "topic", "content": "🏰 Memory Palace: Store info in imaginary places"}, {"type": "explanation", "content": "Picture your home. Place items to remember in each room. Walk through to recall!"}, {"type": "practice", "content": "Where in your home would you \"place\" your grocery list?"}, {"type": "success", "content": "✅ Creative! Your brain loves spatial memory!"}, {"type": "reflection", "content": "📒 Memory skill: UNLOCKED! Practice makes permanent!"}]'::jsonb,
  ARRAY['memory', 'techniques'],
  'medium'),

('Name Recall Trick',
  '[{"type": "greeting", "content": "👋 Never forget a name again!"}, {"type": "topic", "content": "💭 The secret: Associate names with images"}, {"type": "explanation", "content": "Meet Rose? Picture a rose. Meet Mike? Picture a microphone!"}, {"type": "practice", "content": "How would you remember someone named \"River\"?"}, {"type": "success", "content": "✅ Perfect visualization! Names stick with pictures!"}, {"type": "reflection", "content": "📒 Social confidence +1! Keep practicing!"}]'::jsonb,
  ARRAY['memory', 'social'],
  'easy'),

('Skimming vs Scanning',
  '[{"type": "greeting", "content": "👋 Speed up your reading today!"}, {"type": "topic", "content": "👀 Skim for main ideas, scan for specific info"}, {"type": "explanation", "content": "Skimming: Read titles, first sentences. Scanning: Hunt for keywords!"}, {"type": "practice", "content": "Which would you use to find a phone number in an article?"}, {"type": "success", "content": "✅ Right! Scanning for the win!"}, {"type": "reflection", "content": "📒 Reading efficiency: UPGRADED!"}]'::jsonb,
  ARRAY['reading', 'speed'],
  'easy'),

('Highlighting Smart',
  '[{"type": "greeting", "content": "👋 Make your highlights actually helpful!"}, {"type": "topic", "content": "🖍️ Less is more with highlighting"}, {"type": "explanation", "content": "Highlight only keywords or main ideas. Too much = nothing stands out!"}, {"type": "practice", "content": "In a paragraph about dogs, what 3 words would you highlight?"}, {"type": "success", "content": "✅ Smart choices! Quality over quantity!"}, {"type": "reflection", "content": "📒 Study smarter, not harder!"}]'::jsonb,
  ARRAY['reading', 'study'],
  'easy');