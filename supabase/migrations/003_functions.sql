-- ============================================================
-- FitDuel — Migration 003: Funzioni SQL di supporto
-- ============================================================

-- ============================================================
-- Aggiorna total_reps del profilo dopo INSERT performance
-- ============================================================
CREATE OR REPLACE FUNCTION update_profile_reps()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET total_reps = total_reps + NEW.reps
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_performance_insert
  AFTER INSERT ON performances
  FOR EACH ROW EXECUTE FUNCTION update_profile_reps();

-- ============================================================
-- Aggiorna wins/losses dopo completamento duel
-- ============================================================
CREATE OR REPLACE FUNCTION update_duel_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.winner_id IS NOT NULL THEN
    -- Vincitore
    UPDATE profiles SET wins = wins + 1 WHERE id = NEW.winner_id;
    -- Perdente (l'altro partecipante)
    UPDATE profiles SET losses = losses + 1
    WHERE id = CASE
      WHEN NEW.winner_id = NEW.challenger_id THEN NEW.challenged_id
      ELSE NEW.challenger_id
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_duel_complete
  AFTER UPDATE ON duels
  FOR EACH ROW EXECUTE FUNCTION update_duel_stats();

-- ============================================================
-- Aggiorna participant_count challenge
-- ============================================================
CREATE OR REPLACE FUNCTION update_challenge_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE challenges SET participant_count = participant_count + 1 WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE challenges SET participant_count = GREATEST(participant_count - 1, 0) WHERE id = OLD.challenge_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER challenge_participant_count
  AFTER INSERT OR DELETE ON challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_challenge_count();

-- ============================================================
-- Funzione: aggiorna leaderboard settimanale
-- Chiamata dall'Edge Function weekly-leaderboard-reset
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_weekly_leaderboard(
  p_exercise_type TEXT,
  p_week_start DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO weekly_leaderboard (user_id, exercise_type, week_start, total_reps, best_single)
  SELECT
    p.user_id,
    p.exercise_type,
    p_week_start,
    SUM(p.reps) AS total_reps,
    MAX(p.reps) AS best_single
  FROM performances p
  WHERE
    p.exercise_type = p_exercise_type
    AND DATE_TRUNC('week', p.created_at) = p_week_start
  GROUP BY p.user_id, p.exercise_type
  ON CONFLICT (user_id, exercise_type, week_start)
  DO UPDATE SET
    total_reps  = EXCLUDED.total_reps,
    best_single = EXCLUDED.best_single,
    updated_at  = now();

  -- Aggiorna i rank
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_reps DESC) AS new_rank
    FROM weekly_leaderboard
    WHERE exercise_type = p_exercise_type AND week_start = p_week_start
  )
  UPDATE weekly_leaderboard wl
  SET rank = r.new_rank
  FROM ranked r
  WHERE wl.id = r.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Funzione: ottieni classifica settimanale paginata
-- ============================================================
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(
  p_exercise_type TEXT,
  p_week_start DATE DEFAULT DATE_TRUNC('week', now())::DATE,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank          INTEGER,
  user_id       UUID,
  username      TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  total_reps    INTEGER,
  best_single   INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wl.rank,
    wl.user_id,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    wl.total_reps,
    wl.best_single
  FROM weekly_leaderboard wl
  JOIN profiles pr ON pr.id = wl.user_id
  WHERE
    wl.exercise_type = p_exercise_type
    AND wl.week_start = p_week_start
  ORDER BY wl.rank ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Cron job: aggiorna leaderboard ogni ora (tramite pg_cron)
-- NOTA: attivare pg_cron su Supabase Dashboard → Extensions
-- ============================================================
-- SELECT cron.schedule('fitduel-leaderboard-update', '0 * * * *',
--   $$
--   SELECT upsert_weekly_leaderboard('pushup', DATE_TRUNC('week', now())::DATE);
--   SELECT upsert_weekly_leaderboard('squat', DATE_TRUNC('week', now())::DATE);
--   SELECT upsert_weekly_leaderboard('situp', DATE_TRUNC('week', now())::DATE);
--   SELECT upsert_weekly_leaderboard('jumpingjack', DATE_TRUNC('week', now())::DATE);
--   SELECT upsert_weekly_leaderboard('burpee', DATE_TRUNC('week', now())::DATE);
--   $$
-- );
