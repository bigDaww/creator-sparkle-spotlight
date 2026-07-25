
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.waitlist TO anon, authenticated;
GRANT ALL ON public.waitlist TO service_role;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join the waitlist" ON public.waitlist FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.channel_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_input text NOT NULL,
  niche text,
  status text NOT NULL DEFAULT 'completed',
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  score int,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_scans TO authenticated;
GRANT ALL ON public.channel_scans TO service_role;
ALTER TABLE public.channel_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own scans" ON public.channel_scans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
