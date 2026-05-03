-- Public leaderboard table - no auth required
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  meteors_destroyed INTEGER NOT NULL DEFAULT 0,
  survival_time INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can read scores
CREATE POLICY "Anyone can read leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);

-- Anyone can submit a score
CREATE POLICY "Anyone can insert to leaderboard"
  ON public.leaderboard FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC);
