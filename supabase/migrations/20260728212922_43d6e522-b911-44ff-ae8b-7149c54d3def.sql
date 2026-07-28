-- tracked_channels
CREATE TABLE public.tracked_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_input text NOT NULL,
  niche text NOT NULL,
  is_competitor boolean NOT NULL DEFAULT false,
  last_score integer,
  last_cited_models text[] NOT NULL DEFAULT '{}',
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel_input)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracked_channels TO authenticated;
GRANT ALL ON public.tracked_channels TO service_role;

ALTER TABLE public.tracked_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own tracked channels"
  ON public.tracked_channels FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- alert_events
CREATE TABLE public.alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracked_channel_id uuid NOT NULL REFERENCES public.tracked_channels(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('score_up','score_down','new_citation','lost_citation','competitor_overtook')),
  old_value jsonb,
  new_value jsonb,
  seen boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_events TO authenticated;
GRANT ALL ON public.alert_events TO service_role;

ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own alert events"
  ON public.alert_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update their own alert events"
  ON public.alert_events FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own alert events"
  ON public.alert_events FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX alert_events_user_created_idx ON public.alert_events (user_id, created_at DESC);
CREATE INDEX alert_events_tracked_channel_idx ON public.alert_events (tracked_channel_id);
CREATE INDEX tracked_channels_user_idx ON public.tracked_channels (user_id);