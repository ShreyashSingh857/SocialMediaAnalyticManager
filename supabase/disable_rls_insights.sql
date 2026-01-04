-- DANGEROUS: Disable RLS completely for this table to debug
alter table public.analytics_insights disable row level security;

-- Grant everything to everyone (for debugging)
grant all on public.analytics_insights to anon;
grant all on public.analytics_insights to authenticated;
grant all on public.analytics_insights to service_role;
