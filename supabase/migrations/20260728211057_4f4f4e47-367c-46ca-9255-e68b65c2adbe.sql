CREATE TABLE public.prepublish_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  chapters jsonb NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_text text NOT NULL DEFAULT '',
  composite_score integer,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prepublish_checks TO authenticated;
GRANT ALL ON public.prepublish_checks TO service_role;

ALTER TABLE public.prepublish_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own prepublish checks"
  ON public.prepublish_checks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX prepublish_checks_user_created_idx
  ON public.prepublish_checks (user_id, created_at DESC);