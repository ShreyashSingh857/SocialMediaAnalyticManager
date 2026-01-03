-- MIGRATION SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
-- We use 'social_content_type' to avoid conflict if you have a column named 'content_type' elsewhere
create type social_platform as enum ('youtube', 'instagram', 'linkedin', 'twitter');
create type social_content_type as enum ('video', 'short', 'image', 'carousel', 'text');

-- 3. MIGRATING PROFILES TABLE
-- We alter your EXISTING table instead of dropping it to preserve data.

-- Add 'email' if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email') then
        alter table public.profiles add column email text;
    end if;
end $$;

-- Add 'avatar_url' if it doesn't exist (We'll sync it with profile_photo_url later if needed)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'avatar_url') then
        alter table public.profiles add column avatar_url text;
    end if;
end $$;

-- Add 'created_at' if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'created_at') then
        alter table public.profiles add column created_at timestamptz default now();
    end if;
end $$;

-- 4. NEW TABLES (Architecture)

-- CONNECTED ACCOUNTS
create table if not exists public.connected_accounts (
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

-- CONTENT ITEMS
create table if not exists public.content_items (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  external_id text not null,
  title text,
  description text,
  url text,
  thumbnail_url text,
  published_at timestamptz not null,
  type social_content_type default 'video',
  static_metadata jsonb default '{}'::jsonb,
  unique(account_id, external_id),
  created_at timestamptz default now()
);

-- ACCOUNT SNAPSHOTS
create table if not exists public.account_snapshots (
  id bigint generated always as identity primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  follower_count bigint default 0,
  total_views bigint default 0,
  media_count int default 0,
  raw_data jsonb default '{}'::jsonb
);

-- CONTENT SNAPSHOTS
create table if not exists public.content_snapshots (
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

-- 5. INDEXES
create index if not exists idx_content_account on public.content_items(account_id);
create index if not exists idx_content_published on public.content_items(published_at desc);
create index if not exists idx_snapshots_content_time on public.content_snapshots(content_id, recorded_at desc);
create index if not exists idx_snapshots_account_time on public.account_snapshots(account_id, recorded_at desc);

-- 6. RLS POLICIES
alter table public.connected_accounts enable row level security;
alter table public.content_items enable row level security;
alter table public.account_snapshots enable row level security;
alter table public.content_snapshots enable row level security;

-- Drop existing policies to avoid conflicts if you re-run this
drop policy if exists "Users manage own accounts" on public.connected_accounts;
drop policy if exists "Users view own content" on public.content_items;
drop policy if exists "Users view own snapshot" on public.content_snapshots;

create policy "Users manage own accounts" 
on public.connected_accounts for all 
using (auth.uid() = user_id);

create policy "Users view own content" 
on public.content_items for select 
using (
  exists (
    select 1 from public.connected_accounts 
    where id = public.content_items.account_id 
    and user_id = auth.uid()
  )
);

create policy "Users view own snapshot" 
on public.content_snapshots for select 
using (
  exists (
    select 1 from public.content_items
    join public.connected_accounts on public.connected_accounts.id = public.content_items.account_id
    where public.content_items.id = public.content_snapshots.content_id
    and public.connected_accounts.user_id = auth.uid()
  )
);
