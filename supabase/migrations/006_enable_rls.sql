-- Enable RLS on all public tables
-- The app uses Prisma with the service role key which bypasses RLS,
-- so this does not affect app functionality.

-- ── PostGIS system table ──────────────────────────────────────────────────────
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- ── Public read tables ────────────────────────────────────────────────────────

ALTER TABLE public.synagogues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "synagogues_public_read" ON public.synagogues
  FOR SELECT USING (true);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "properties_public_read" ON public.properties
  FOR SELECT USING ("isApproved" = true AND status = 'ACTIVE');

ALTER TABLE public.property_synagogue_distances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "distances_public_read" ON public.property_synagogue_distances
  FOR SELECT USING (true);

-- ── User-scoped tables ────────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Only service role can access (no anon/authenticated policy)

ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
-- Only service role can access

ALTER TABLE public.saved_synagogues ENABLE ROW LEVEL SECURITY;
-- Only service role can access

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- Only service role can access (contains PII)

ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
-- Only service role can access
