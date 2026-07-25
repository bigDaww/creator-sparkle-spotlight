
DROP POLICY IF EXISTS "Anyone can join the waitlist" ON public.waitlist;
ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254),
  ADD CONSTRAINT waitlist_source_length CHECK (source IS NULL OR length(source) <= 64);
CREATE POLICY "Public can submit valid email to waitlist"
  ON public.waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND email = lower(email)
    AND (source IS NULL OR source IN ('landing_hero','landing_cta','landing_footer'))
  );
