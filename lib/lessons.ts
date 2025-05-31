import type { Lesson } from '@/types'

export const lessons: Lesson[] = [
  {
    id: '1',
    title: 'Understanding Fractions',
    content: [
      { type: 'greeting', content: '👋 Hey! Ready to learn something quick and useful?' },
      { type: 'topic', content: "Today's nugget: A fraction just means 'part of a whole.' 🍕" },
      { type: 'explanation', content: 'Imagine cutting a pizza into 4 slices. If you eat 1, that\'s 1/4.' },
      { type: 'practice', content: 'Now you try: What\'s 3 out of 4 slices? Type it as a fraction!' },
      { type: 'success', content: '✅ Nice! That\'s 3/4. Fractions = portions. Easy, right?' },
      { type: 'reflection', content: '📒 Saving your progress. You\'re doing great today!' }
    ],
    tags: ['math', 'basics'],
    difficulty: 'easy'
  },
  {
    id: '2',
    title: 'Estimating Sums',
    content: [
      { type: 'greeting', content: '👋 Hey! Ready for today\'s quick brain boost?' },
      { type: 'topic', content: '🔍 Topic: Estimating Sums - guessing totals without exact math!' },
      { type: 'explanation', content: 'Round numbers to the nearest 10: 23→20, 47→50. Then add: 20+50=70!' },
      { type: 'practice', content: 'Your turn! Estimate 38 + 54. Round then add. What do you get?' },
      { type: 'success', content: '✅ Great job! Estimating saves time and mental energy.' },
      { type: 'reflection', content: '📒 Progress saved. Small wins add up to big victories!' }
    ],
    tags: ['math', 'mental-math'],
    difficulty: 'easy'
  },
  {
    id: '3',
    title: 'Reading Graphs',
    content: [
      { type: 'greeting', content: '👋 Let\'s decode some visual data today!' },
      { type: 'topic', content: '📊 Graphs tell stories with pictures instead of words.' },
      { type: 'explanation', content: 'Start with the title, then check axes labels. Height = value!' },
      { type: 'practice', content: 'If a bar reaches 30 on the y-axis, what\'s its value?' },
      { type: 'success', content: '✅ Exactly! You\'re becoming a data detective!' },
      { type: 'reflection', content: '📒 Another skill unlocked. Keep building!' }
    ],
    tags: ['math', 'data'],
    difficulty: 'medium'
  },
  {
    id: '4',
    title: 'Percentages Made Simple',
    content: [
      { type: 'greeting', content: '👋 Ready to master percentages the easy way?' },
      { type: 'topic', content: '💯 Percent = "per 100" or "out of 100"' },
      { type: 'explanation', content: '50% = half, 25% = quarter, 10% = move decimal left once' },
      { type: 'practice', content: 'Quick! What\'s 10% of 80? (Hint: move the decimal)' },
      { type: 'success', content: '✅ Yes! 8! You\'ve got this pattern down!' },
      { type: 'reflection', content: '📒 Math confidence +10 XP!' }
    ],
    tags: ['math', 'percentages'],
    difficulty: 'medium'
  },
  {
    id: '5',
    title: 'Pomodoro Technique Basics',
    content: [
      { type: 'greeting', content: '👋 Let\'s boost your focus with a simple trick!' },
      { type: 'topic', content: '🍅 The Pomodoro: 25 min work, 5 min break' },
      { type: 'explanation', content: 'Set timer for 25 min. Focus on ONE task. Break when timer rings!' },
      { type: 'practice', content: 'What would you work on for your first 25-minute sprint?' },
      { type: 'success', content: '✅ Perfect choice! Small time boxes = big productivity!' },
      { type: 'reflection', content: '📒 Focus skill upgraded! Try it today!' }
    ],
    tags: ['focus', 'productivity'],
    difficulty: 'easy'
  },
  {
    id: '6',
    title: 'Avoiding Multitasking',
    content: [
      { type: 'greeting', content: '👋 Time for a game-changing focus tip!' },
      { type: 'topic', content: '🎯 Single-tasking beats multitasking every time' },
      { type: 'explanation', content: 'Your brain switches tasks, not does them together. Each switch = lost time!' },
      { type: 'practice', content: 'Name one task you\'ll give 100% attention to today:' },
      { type: 'success', content: '✅ Smart! One thing done well > many things done poorly' },
      { type: 'reflection', content: '📒 Focus is your superpower. Use it wisely!' }
    ],
    tags: ['focus', 'adhd-tips'],
    difficulty: 'easy'
  },
  {
    id: '7',
    title: 'Memory Palace Introduction',
    content: [
      { type: 'greeting', content: '👋 Ready to remember like a champion?' },
      { type: 'topic', content: '🏰 Memory Palace: Store info in imaginary places' },
      { type: 'explanation', content: 'Picture your home. Place items to remember in each room. Walk through to recall!' },
      { type: 'practice', content: 'Where in your home would you "place" your grocery list?' },
      { type: 'success', content: '✅ Creative! Your brain loves spatial memory!' },
      { type: 'reflection', content: '📒 Memory skill: UNLOCKED! Practice makes permanent!' }
    ],
    tags: ['memory', 'techniques'],
    difficulty: 'medium'
  },
  {
    id: '8',
    title: 'Name Recall Trick',
    content: [
      { type: 'greeting', content: '👋 Never forget a name again!' },
      { type: 'topic', content: '💭 The secret: Associate names with images' },
      { type: 'explanation', content: 'Meet Rose? Picture a rose. Meet Mike? Picture a microphone!' },
      { type: 'practice', content: 'How would you remember someone named "River"?' },
      { type: 'success', content: '✅ Perfect visualization! Names stick with pictures!' },
      { type: 'reflection', content: '📒 Social confidence +1! Keep practicing!' }
    ],
    tags: ['memory', 'social'],
    difficulty: 'easy'
  },
  {
    id: '9',
    title: 'Skimming vs Scanning',
    content: [
      { type: 'greeting', content: '👋 Speed up your reading today!' },
      { type: 'topic', content: '👀 Skim for main ideas, scan for specific info' },
      { type: 'explanation', content: 'Skimming: Read titles, first sentences. Scanning: Hunt for keywords!' },
      { type: 'practice', content: 'Which would you use to find a phone number in an article?' },
      { type: 'success', content: '✅ Right! Scanning for the win!' },
      { type: 'reflection', content: '📒 Reading efficiency: UPGRADED!' }
    ],
    tags: ['reading', 'speed'],
    difficulty: 'easy'
  },
  {
    id: '10',
    title: 'Highlighting Smart',
    content: [
      { type: 'greeting', content: '👋 Make your highlights actually helpful!' },
      { type: 'topic', content: '🖍️ Less is more with highlighting' },
      { type: 'explanation', content: 'Highlight only keywords or main ideas. Too much = nothing stands out!' },
      { type: 'practice', content: 'In a paragraph about dogs, what 3 words would you highlight?' },
      { type: 'success', content: '✅ Smart choices! Quality over quantity!' },
      { type: 'reflection', content: '📒 Study smarter, not harder!' }
    ],
    tags: ['reading', 'study'],
    difficulty: 'easy'
  },
  {
    id: '11',
    title: 'Speed Reading Warm-Up',
    content: [
      { type: 'greeting', content: '👋 Train your eyes to read faster!' },
      { type: 'topic', content: '⚡ Use your finger as a reading guide' },
      { type: 'explanation', content: 'Move finger under text slightly faster than comfortable. Eyes follow!' },
      { type: 'practice', content: 'Try it now! Read this with your finger guiding. How does it feel?' },
      { type: 'success', content: '✅ You\'re training your reading muscles!' },
      { type: 'reflection', content: '📒 Speed +10%! Practice daily for gains!' }
    ],
    tags: ['reading', 'speed'],
    difficulty: 'medium'
  },
  {
    id: '12',
    title: 'The 2-Minute Rule',
    content: [
      { type: 'greeting', content: '👋 Beat procrastination with this simple rule!' },
      { type: 'topic', content: '⏰ If it takes less than 2 minutes, do it NOW' },
      { type: 'explanation', content: 'Reply to text? File paper? Make bed? Under 2 min = do immediately!' },
      { type: 'practice', content: 'Name one 2-minute task you\'ve been putting off:' },
      { type: 'success', content: '✅ Go do it right after this lesson!' },
      { type: 'reflection', content: '📒 Small actions, big momentum!' }
    ],
    tags: ['productivity', 'adhd-tips'],
    difficulty: 'easy'
  },
  {
    id: '13',
    title: 'Breaking Down Big Tasks',
    content: [
      { type: 'greeting', content: '👋 Make big tasks feel manageable!' },
      { type: 'topic', content: '🧩 Chunk it! Big task → small pieces' },
      { type: 'explanation', content: '"Clean room" → "Pick up clothes" + "Make bed" + "Clear desk"' },
      { type: 'practice', content: 'Break down "study for test" into 3 smaller tasks:' },
      { type: 'success', content: '✅ Perfect chunking! Each piece feels doable!' },
      { type: 'reflection', content: '📒 You\'ve mastered divide and conquer!' }
    ],
    tags: ['productivity', 'planning'],
    difficulty: 'easy'
  },
  {
    id: '14',
    title: 'Active Listening Skills',
    content: [
      { type: 'greeting', content: '👋 Level up your listening game!' },
      { type: 'topic', content: '👂 Active listening: Hear, process, respond' },
      { type: 'explanation', content: 'Make eye contact. Nod. Repeat back key points. Ask questions!' },
      { type: 'practice', content: 'What\'s one thing you do when truly listening?' },
      { type: 'success', content: '✅ That\'s a pro move! Keep it up!' },
      { type: 'reflection', content: '📒 Better listening = better connections!' }
    ],
    tags: ['social', 'communication'],
    difficulty: 'easy'
  },
  {
    id: '15',
    title: 'Managing Hyperfocus',
    content: [
      { type: 'greeting', content: '👋 Let\'s harness your hyperfocus superpower!' },
      { type: 'topic', content: '🔍 Hyperfocus: Set timers to surface for air!' },
      { type: 'explanation', content: 'Before diving deep, set 45-min timer. Stand, stretch, hydrate when it rings!' },
      { type: 'practice', content: 'What activity makes you lose track of time?' },
      { type: 'success', content: '✅ Now you can enjoy it guilt-free with timers!' },
      { type: 'reflection', content: '📒 Superpower managed successfully!' }
    ],
    tags: ['adhd-tips', 'focus'],
    difficulty: 'medium'
  },
  {
    id: '16',
    title: 'Quick Meditation',
    content: [
      { type: 'greeting', content: '👋 Calm your busy mind in 60 seconds!' },
      { type: 'topic', content: '🧘 Box breathing: 4-4-4-4 pattern' },
      { type: 'explanation', content: 'Breathe in 4, hold 4, out 4, hold 4. Repeat 4 times. That\'s it!' },
      { type: 'practice', content: 'Try one round right now. How do you feel?' },
      { type: 'success', content: '✅ You just meditated! No apps needed!' },
      { type: 'reflection', content: '📒 Calm is a skill. You\'re building it!' }
    ],
    tags: ['mindfulness', 'stress'],
    difficulty: 'easy'
  },
  {
    id: '17',
    title: 'Email Organization',
    content: [
      { type: 'greeting', content: '👋 Tame your inbox chaos!' },
      { type: 'topic', content: '📧 The 3-folder system: Action, Waiting, Archive' },
      { type: 'explanation', content: 'Action = needs response. Waiting = awaiting reply. Archive = done!' },
      { type: 'practice', content: 'Where would you put an email you just replied to?' },
      { type: 'success', content: '✅ Archive it! Keep inbox clean!' },
      { type: 'reflection', content: '📒 Email anxiety: DEFEATED!' }
    ],
    tags: ['organization', 'digital'],
    difficulty: 'easy'
  },
  {
    id: '18',
    title: 'Sleep Routine Basics',
    content: [
      { type: 'greeting', content: '👋 Better sleep = better focus tomorrow!' },
      { type: 'topic', content: '😴 Wind-down routine: Same time, every night' },
      { type: 'explanation', content: 'Phone down 30 min before bed. Dim lights. Same bedtime daily!' },
      { type: 'practice', content: 'What time will you start winding down tonight?' },
      { type: 'success', content: '✅ Commit to it! Your brain will thank you!' },
      { type: 'reflection', content: '📒 Good sleep = good days ahead!' }
    ],
    tags: ['health', 'adhd-tips'],
    difficulty: 'easy'
  },
  {
    id: '19',
    title: 'Decision Fatigue Fix',
    content: [
      { type: 'greeting', content: '👋 Too many choices? Let\'s simplify!' },
      { type: 'topic', content: '🤔 Reduce daily decisions to save mental energy' },
      { type: 'explanation', content: 'Plan outfits Sunday. Meal prep. Morning routine on autopilot!' },
      { type: 'practice', content: 'Name one daily decision you could eliminate:' },
      { type: 'success', content: '✅ Smart! More energy for important choices!' },
      { type: 'reflection', content: '📒 Simplified life = focused mind!' }
    ],
    tags: ['productivity', 'adhd-tips'],
    difficulty: 'medium'
  },
  {
    id: '20',
    title: 'Fidget to Focus',
    content: [
      { type: 'greeting', content: '👋 Movement helps thinking!' },
      { type: 'topic', content: '✋ Fidgeting isn\'t bad - it\'s helpful!' },
      { type: 'explanation', content: 'Squeeze stress ball. Doodle. Pace. Movement frees up focus!' },
      { type: 'practice', content: 'What\'s your favorite way to fidget?' },
      { type: 'success', content: '✅ Keep it up! Motion creates focus!' },
      { type: 'reflection', content: '📒 Your body knows what it needs!' }
    ],
    tags: ['adhd-tips', 'focus'],
    difficulty: 'easy'
  }
]