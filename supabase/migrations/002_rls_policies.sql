-- ============================================================
-- FitDuel — Migration 002: Row Level Security
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- PERFORMANCES
-- ============================================================
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "performances_select"
  ON performances FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "performances_insert_own"
  ON performances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "performances_update_own"
  ON performances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "performances_delete_own"
  ON performances FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- DUELS
-- ============================================================
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "duels_select"
  ON duels FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "duels_insert_challenger"
  ON duels FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "duels_update_participants"
  ON duels FOR UPDATE
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- ============================================================
-- CHALLENGES
-- ============================================================
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_active"
  ON challenges FOR SELECT
  USING (is_active = true OR auth.uid() = creator_id);

CREATE POLICY "challenges_insert_own"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "challenges_update_own"
  ON challenges FOR UPDATE
  USING (auth.uid() = creator_id);

-- ============================================================
-- CHALLENGE PARTICIPANTS
-- ============================================================
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp_select"
  ON challenge_participants FOR SELECT
  USING (true); -- partecipanti visibili a tutti

CREATE POLICY "cp_insert_own"
  ON challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cp_update_own"
  ON challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- WEEKLY LEADERBOARD
-- ============================================================
ALTER TABLE weekly_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_select"
  ON weekly_leaderboard FOR SELECT
  USING (true); -- classifica pubblica

-- Solo Edge Functions (service role) possono scrivere
CREATE POLICY "leaderboard_service_write"
  ON weekly_leaderboard FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- FOLLOWS
-- ============================================================
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "follows_insert_own"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================================
-- ACTIVITIES
-- ============================================================
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select"
  ON activities FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "activities_insert_own"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_delete_own"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- LIKES
-- ============================================================
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "likes_insert_own"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "comments_insert_own"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- USER BADGES
-- ============================================================
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select"
  ON user_badges FOR SELECT
  USING (true);

-- Solo service role assegna badge
CREATE POLICY "badges_service_insert"
  ON user_badges FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Solo service role crea notifiche (via Edge Functions)
CREATE POLICY "notifications_service_insert"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
