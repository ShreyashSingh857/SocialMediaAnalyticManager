-- Ensure table exists
create table if not exists public.analytics_insights (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  insight_type text not null,
  start_date date,
  end_date date,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.analytics_insights enable row level security;

-- Policy for Users to View their own insights
drop policy if exists "Users can view own insights" on public.analytics_insights;
create policy "Users can view own insights" on public.analytics_insights
  for select using (
    exists (
      select 1 from public.connected_accounts ca
      where ca.id = analytics_insights.account_id
      and ca.user_id = auth.uid()
    )
  );

-- Grant permissions
grant all on public.analytics_insights to postgres;
grant all on public.analytics_insights to service_role;
grant select on public.analytics_insights to authenticated;
