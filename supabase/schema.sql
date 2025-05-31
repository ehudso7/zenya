-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  current_xp INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  mood TEXT
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  tags TEXT[],
  difficulty TEXT
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  mood TEXT,
  engagement_score INTEGER
);

-- Journals table
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  entry_text TEXT,
  xp_earned INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Waitlist table
CREATE TABLE waitlist (
  email TEXT PRIMARY KEY,
  signup_date TIMESTAMP DEFAULT NOW(),
  source TEXT
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Can read own user data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Can update own user data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for lessons table (public read)
CREATE POLICY "Public read access" ON lessons
  FOR SELECT USING (true);

-- RLS Policies for sessions table
CREATE POLICY "Can read own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for journals table
CREATE POLICY "Can read own journals" ON journals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Can insert own journals" ON journals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for waitlist table
CREATE POLICY "Public insert to waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_timestamp ON sessions(timestamp);
CREATE INDEX idx_journals_user_id ON journals(user_id);
CREATE INDEX idx_lessons_tags ON lessons USING gin(tags);