-- ============================================================
-- FitDuel — Migration 001: Schema iniziale
-- ============================================================

-- Abilita estensioni
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- PROFILES (estende auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id             UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username       TEXT UNIQUE NOT NULL,
  display_name   TEXT,
  bio            TEXT,
  avatar_url     TEXT,
  is_public      BOOLEAN DEFAULT true,
  level          INTEGER DEFAULT 1 CHECK (level >= 1),
  total_reps     INTEGER DEFAULT 0 CHECK (total_reps >= 0),
  wins           INTEGER DEFAULT 0 CHECK (wins >= 0),
  losses         INTEGER DEFAULT 0 CHECK (losses >= 0),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  best_streak    INTEGER DEFAULT 0 CHECK (best_streak >= 0),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Trigger: aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: crea profilo automaticamente dopo signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    -- Username provvisorio basato su ID (l'utente lo cambierà nel setup)
    'user_' || SUBSTR(NEW.id::TEXT, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PERFORMANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS performances (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_type    TEXT NOT NULL CHECK (exercise_type IN ('pushup','squat','situp','jumpingjack','burpee')),
  reps             INTEGER NOT NULL CHECK (reps > 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  avg_quality      FLOAT CHECK (avg_quality IS NULL OR (avg_quality >= 0 AND avg_quality <= 1)),
  video_url        TEXT,
  is_public        BOOLEAN DEFAULT true,
  challenge_id     UUID, -- FK aggiunta dopo
  duel_id          UUID, -- FK aggiunta dopo
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_performances_user_id ON performances(user_id);
CREATE INDEX idx_performances_created_at ON performances(created_at DESC);
CREATE INDEX idx_performances_exercise ON performances(exercise_type);

-- ============================================================
-- DUELS (sfide 1vs1)
-- ============================================================
CREATE TABLE IF NOT EXISTS duels (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenged_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_type    TEXT NOT NULL CHECK (exercise_type IN ('pushup','squat','situp','jumpingjack','burpee')),
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','active','completed','expired','declined')),
  expires_at       TIMESTAMPTZ NOT NULL,
  challenger_reps  INTEGER CHECK (challenger_reps IS NULL OR challenger_reps >= 0),
  challenged_reps  INTEGER CHECK (challenged_reps IS NULL OR challenged_reps >= 0),
  winner_id        UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  completed_at     TIMESTAMPTZ,
  CONSTRAINT no_self_duel CHECK (challenger_id != challenged_id)
);

CREATE INDEX idx_duels_challenger ON duels(challenger_id);
CREATE INDEX idx_duels_challenged ON duels(challenged_id);
CREATE INDEX idx_duels_status ON duels(status);

-- ============================================================
-- CHALLENGES (sfide pubbliche)
-- ============================================================
CREATE TABLE IF NOT EXISTS challenges (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  exercise_type     TEXT NOT NULL CHECK (exercise_type IN ('pushup','squat','situp','jumpingjack','burpee')),
  ends_at           TIMESTAMPTZ NOT NULL,
  is_active         BOOLEAN DEFAULT true,
  participant_count INTEGER DEFAULT 0 CHECK (participant_count >= 0),
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_challenges_active ON challenges(is_active, ends_at);

-- ============================================================
-- CHALLENGE PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS challenge_participants (
  challenge_id  UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  best_reps     INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  joined_at     TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);

-- ============================================================
-- FK differite (ora che le tabelle esistono)
-- ============================================================
ALTER TABLE performances
  ADD CONSTRAINT fk_perf_challenge FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_perf_duel FOREIGN KEY (duel_id) REFERENCES duels(id) ON DELETE SET NULL;

-- ============================================================
-- WEEKLY LEADERBOARD (materializzata)
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_leaderboard (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('pushup','squat','situp','jumpingjack','burpee')),
  week_start    DATE NOT NULL,
  total_reps    INTEGER DEFAULT 0,
  best_single   INTEGER DEFAULT 0,
  rank          INTEGER,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, exercise_type, week_start)
);

CREATE INDEX idx_leaderboard_week ON weekly_leaderboard(exercise_type, week_start, total_reps DESC);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS follows (
  follower_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- ============================================================
-- ACTIVITIES (feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('performance','duel_won','challenge_joined','badge_earned')),
  reference_id UUID,
  is_public    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_user ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_public ON activities(is_public, created_at DESC);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, activity_id)
);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_activity ON comments(activity_id, created_at);

-- ============================================================
-- USER BADGES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id  TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('duel_invite','duel_result','leaderboard_change','streak_risk','new_follower','like','comment','badge_earned','challenge_ending')),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  reference_id UUID,
  is_read      BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
