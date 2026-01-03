-- SocialManager Unified Schema
-- This schema consolidates all previous versions and removes redundant tables.
-- Target State: Generic tables for all content types (YouTube, Instagram, etc.)

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
create type social_platform as enum ('youtube', 'instagram', 'linkedin', 'twitter');
create type content_type as enum ('video', 'short', 'image', 'carousel', 'text');

-- 3. PROFILES
-- Extends Supabase Auth
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  -- Legacy fields (consider moving to specific tables if needed)
  age integer,
  instagram text,
  country text,
  location text,
  description text,
  content_type text,
  profile_photo_url text,
  youtube_stats jsonb, -- Consider moving to account_snapshots
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. CONNECTED ACCOUNTS
-- Stores credentials and metadata for social platforms
create table public.connected_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform social_platform not null,
  
  external_account_id text not null,
  account_name text,
  account_handle text,
  avatar_url text,
  
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  
  platform_metadata jsonb default '{}'::jsonb,
  last_synced_at timestamptz,
  is_active boolean default true,
  
  unique(user_id, platform, external_account_id),
  created_at timestamptz default now()
);

-- 5. CONTENT ITEMS (Replaces 'videos' table)
-- Stores static metadata for videos, posts, etc.
create table public.content_items (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  
  external_id text not null,
  title text,
  description text,
  url text,
  thumbnail_url text,
  published_at timestamptz not null,
  
  type content_type default 'video',
  static_metadata jsonb default '{}'::jsonb,
  
  unique(account_id, external_id),
  created_at timestamptz default now()
);

-- 6. CONTENT SNAPSHOTS (Replaces 'video_snapshots' table)
-- Tracks performance of content over time
create table public.content_snapshots (
  id bigint generated always as identity primary key,
  content_id uuid references public.content_items(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  views bigint default 0,
  likes bigint default 0,
  comments bigint default 0,
  shares bigint default 0,
  engagement_rate numeric(10, 4),
  
  raw_data jsonb default '{}'::jsonb
);

-- 7. ACCOUNT SNAPSHOTS
-- Tracks channel-level growth over time (Total Subs, Total Views)
create table public.account_snapshots (
  id bigint generated always as identity primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  follower_count bigint default 0,
  total_views bigint default 0,
  media_count int default 0,
  
  raw_data jsonb default '{}'::jsonb
);

-- 8. CHANNEL DAILY METRICS
-- Specific daily delta metrics (Views gained today, etc.)
-- Useful for graphs
create table public.channel_daily_metrics (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  date date not null,
  
  views bigint default 0,
  watch_time_hours numeric default 0,
  subscribers_gained int default 0,
  
  created_at timestamptz default now(),
  unique(account_id, date)
);

-- 9. ANALYTICS INSIGHTS
-- Stores AI-generated insights
create table public.analytics_insights (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  insight_type text not null, -- e.g., 'weekly_trend', 'engagement_summary'
  
  start_date date,
  end_date date,
  
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 10. INDEXES & RLS
create index idx_content_account on public.content_items(account_id);
create index idx_content_published on public.content_items(published_at desc);
create index idx_snapshots_content_time on public.content_snapshots(content_id, recorded_at desc);

alter table public.profiles enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.content_items enable row level security;
alter table public.content_snapshots enable row level security;
alter table public.account_snapshots enable row level security;
alter table public.channel_daily_metrics enable row level security;
alter table public.analytics_insights enable row level security;

-- Basic Policies (Adjust as needed)
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users manage own accounts" on public.connected_accounts for all using (auth.uid() = user_id);

create policy "Users view own content" on public.content_items for select using (
  exists (select 1 from public.connected_accounts where id = public.content_items.account_id and user_id = auth.uid())
);

create policy "Users manage own content" on public.content_items for all using (
  exists (select 1 from public.connected_accounts where id = public.content_items.account_id and user_id = auth.uid())
);
