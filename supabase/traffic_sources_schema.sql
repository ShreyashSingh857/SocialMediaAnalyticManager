-- Add Traffic Sources table to audience analytics schema

create table if not exists public.traffic_sources (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  source_type text not null, -- youtube_search, suggested_videos, browse_features, external, direct, etc.
  views bigint default 0,
  watch_time_minutes bigint default 0,
  percentage numeric(5, 2),
  
  unique(account_id, source_type, recorded_at::date)
);

-- Index for performance
create index if not exists idx_traffic_sources_account on public.traffic_sources(account_id, recorded_at desc);

-- Row Level Security
alter table public.traffic_sources enable row level security;

create policy "Users view own traffic sources" on public.traffic_sources for select using (
  exists (select 1 from public.connected_accounts where id = traffic_sources.account_id and user_id = auth.uid())
);

-- Grant permissions
grant select on public.traffic_sources to authenticated;
