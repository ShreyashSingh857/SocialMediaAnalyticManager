-- Audience Analytics Schema
-- Adds tables for demographics, geography, devices, platforms, subscription sources, and retention data

-- 1. Demographics Data
create table if not exists public.audience_demographics (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  -- Age Groups (percentages)
  age_13_17 numeric(5, 2) default 0,
  age_18_24 numeric(5, 2) default 0,
  age_25_34 numeric(5, 2) default 0,
  age_35_44 numeric(5, 2) default 0,
  age_45_54 numeric(5, 2) default 0,
  age_55_64 numeric(5, 2) default 0,
  age_65_plus numeric(5, 2) default 0,
  
  -- Gender Split (percentages)
  gender_male numeric(5, 2) default 0,
  gender_female numeric(5, 2) default 0,
  gender_other numeric(5, 2) default 0,
  
  -- Combined Age + Gender (JSON for flexibility)
  age_gender_breakdown jsonb default '{}'::jsonb,
  
  unique(account_id, recorded_at::date)
);

-- 2. Geography Data
create table if not exists public.audience_geography (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  country_code text not null, -- ISO 3166-1 alpha-2 (e.g., 'US', 'IN')
  country_name text,
  
  views bigint default 0,
  watch_time_minutes bigint default 0,
  subscribers_gained int default 0,
  average_view_duration numeric(10, 2),
  
  unique(account_id, country_code, recorded_at::date)
);

-- 3. Device & Platform Data
create table if not exists public.audience_devices (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  device_type text not null, -- mobile, desktop, tv, tablet, game_console
  views bigint default 0,
  watch_time_minutes bigint default 0,
  percentage numeric(5, 2),
  
  unique(account_id, device_type, recorded_at::date)
);

-- 4. Traffic Platform Data
create table if not exists public.audience_platforms (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  platform_type text not null, -- youtube_app, youtube_web, embedded
  views bigint default 0,
  watch_time_minutes bigint default 0,
  percentage numeric(5, 2),
  
  unique(account_id, platform_type, recorded_at::date)
);

-- 5. Subscription Sources
create table if not exists public.subscription_sources (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  source_type text not null, -- watch_page, channel_page, shorts, external
  subscribers_gained int default 0,
  percentage numeric(5, 2),
  
  unique(account_id, source_type, recorded_at::date)
);

-- 6. Retention Segments
create table if not exists public.audience_retention_segments (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  content_id uuid references public.content_items(id) on delete cascade,
  recorded_at timestamptz default now(),
  
  segment_type text not null, -- new_viewers, returning_viewers, subscribers, non_subscribers
  average_retention numeric(5, 2),
  view_count bigint default 0,
  
  unique(account_id, content_id, segment_type, recorded_at::date)
);

-- Indexes for Performance
create index if not exists idx_demographics_account on public.audience_demographics(account_id, recorded_at desc);
create index if not exists idx_geography_account on public.audience_geography(account_id, recorded_at desc);
create index if not exists idx_geography_country on public.audience_geography(country_code);
create index if not exists idx_devices_account on public.audience_devices(account_id, recorded_at desc);
create index if not exists idx_platforms_account on public.audience_platforms(account_id, recorded_at desc);
create index if not exists idx_subscription_account on public.subscription_sources(account_id, recorded_at desc);
create index if not exists idx_retention_account on public.audience_retention_segments(account_id, recorded_at desc);

-- Row Level Security
alter table public.audience_demographics enable row level security;
alter table public.audience_geography enable row level security;
alter table public.audience_devices enable row level security;
alter table public.audience_platforms enable row level security;
alter table public.subscription_sources enable row level security;
alter table public.audience_retention_segments enable row level security;

-- RLS Policies
create policy "Users view own demographics" on public.audience_demographics for select using (
  exists (select 1 from public.connected_accounts where id = audience_demographics.account_id and user_id = auth.uid())
);

create policy "Users view own geography" on public.audience_geography for select using (
  exists (select 1 from public.connected_accounts where id = audience_geography.account_id and user_id = auth.uid())
);

create policy "Users view own devices" on public.audience_devices for select using (
  exists (select 1 from public.connected_accounts where id = audience_devices.account_id and user_id = auth.uid())
);

create policy "Users view own platforms" on public.audience_platforms for select using (
  exists (select 1 from public.connected_accounts where id = audience_platforms.account_id and user_id = auth.uid())
);

create policy "Users view own subscriptions" on public.subscription_sources for select using (
  exists (select 1 from public.connected_accounts where id = subscription_sources.account_id and user_id = auth.uid())
);

create policy "Users view own retention" on public.audience_retention_segments for select using (
  exists (select 1 from public.connected_accounts where id = audience_retention_segments.account_id and user_id = auth.uid())
);

-- Grant permissions
grant select on public.audience_demographics to authenticated;
grant select on public.audience_geography to authenticated;
grant select on public.audience_devices to authenticated;
grant select on public.audience_platforms to authenticated;
grant select on public.subscription_sources to authenticated;
grant select on public.audience_retention_segments to authenticated;
