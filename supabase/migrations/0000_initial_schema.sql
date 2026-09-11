-- DSA OS — Migration 0000: Initial PostgreSQL Schema & RLS Policies

-- 1. Profiles & User Settings
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  weekday_problem_target SMALLINT NOT NULL DEFAULT 2,
  difficulty_mode TEXT NOT NULL DEFAULT 'adaptive',
  practice_days SMALLINT[] NOT NULL DEFAULT '{1,2,3,4,5}',
  weekday_revision_target SMALLINT NOT NULL DEFAULT 1,
  saturday_revision_target SMALLINT NOT NULL DEFAULT 3,
  daily_practice_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  revision_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_time TIME NOT NULL DEFAULT '09:00:00',
  theme TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Curriculum Reference Catalogs
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_patterns (
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (problem_id, pattern_id)
);

CREATE TABLE IF NOT EXISTS problem_topics (
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, topic_id)
);

CREATE TABLE IF NOT EXISTS mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week SMALLINT NOT NULL,
  focus_title TEXT NOT NULL,
  focus_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Attempts
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  result TEXT NOT NULL,
  initial_approach TEXT,
  used_hint BOOLEAN NOT NULL DEFAULT FALSE,
  saw_approach BOOLEAN NOT NULL DEFAULT FALSE,
  saw_solution BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attempt_mistakes (
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  mistake_id UUID NOT NULL REFERENCES mistakes(id) ON DELETE CASCADE,
  PRIMARY KEY (attempt_id, mistake_id)
);

-- 4. Pattern Journal
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES attempts(id) ON DELETE SET NULL,
  pattern_id UUID REFERENCES patterns(id) ON DELETE SET NULL,
  failed_idea TEXT,
  key_observation TEXT,
  time_complexity TEXT,
  space_complexity TEXT,
  what_to_remember TEXT NOT NULL,
  pattern_recognition TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT journal_user_problem_unique UNIQUE (user_id, problem_id)
);

-- 5. Revisions
CREATE TABLE IF NOT EXISTS revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  next_review_at TIMESTAMPTZ NOT NULL,
  current_interval_days INTEGER NOT NULL DEFAULT 1,
  review_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT revisions_user_problem_unique UNIQUE (user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS revision_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id UUID NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recall_result TEXT NOT NULL,
  user_pattern_answer TEXT,
  user_approach_answer TEXT,
  previous_interval_days INTEGER,
  new_interval_days INTEGER,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Scheduling & Activity
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  task_type TEXT NOT NULL,
  slot_number SMALLINT NOT NULL,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  revision_id UUID REFERENCES revisions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'scheduler',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_tasks_slot_unique UNIQUE (user_id, task_date, task_type, slot_number)
);

CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  problems_solved SMALLINT NOT NULL DEFAULT 0,
  revisions_completed SMALLINT NOT NULL DEFAULT 0,
  contest_participated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_activity_user_date_unique UNIQUE (user_id, activity_date)
);

CREATE TABLE IF NOT EXISTS contest_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contest_date DATE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'leetcode',
  contest_name TEXT NOT NULL DEFAULT 'LeetCode Weekly Contest',
  url TEXT,
  participated BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on User-Owned Tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_participations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on Reference Catalogs (Public Read Access)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_curriculum ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User-Owned Tables
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own attempts" ON attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own attempt mistakes" ON attempt_mistakes FOR ALL USING (
  EXISTS (SELECT 1 FROM attempts WHERE id = attempt_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own revisions" ON revisions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own revision attempts" ON revision_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily tasks" ON daily_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily activity" ON daily_activity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own contest participations" ON contest_participations FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Reference Catalogs (Public Read)
CREATE POLICY "Public read problems" ON problems FOR SELECT USING (TRUE);
CREATE POLICY "Public read patterns" ON patterns FOR SELECT USING (TRUE);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (TRUE);
CREATE POLICY "Public read problem_patterns" ON problem_patterns FOR SELECT USING (TRUE);
CREATE POLICY "Public read problem_topics" ON problem_topics FOR SELECT USING (TRUE);
CREATE POLICY "Public read mistakes" ON mistakes FOR SELECT USING (TRUE);
CREATE POLICY "Public read weekly_curriculum" ON weekly_curriculum FOR SELECT USING (TRUE);
