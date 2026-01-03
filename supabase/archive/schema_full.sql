-- 1. EXTENSIONS & CONFIGURATION
-- Enable UUID generation for primary keys
create extension if not exists "uuid-ossp";

-- 2. ENUMS (Strict Typing)
-- Supported platforms (Extensible for future)
create type social_platform as enum ('youtube', 'instagram', 'linkedin', 'twitter');

-- Content formats to normalize "Video" vs "Reel" vs "Post"
create type content_type as enum ('video', 'short', 'image', 'carousel', 'text');

-- 3. USER PROFILES (Supabase Auth Link)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. CONNECTED ACCOUNTS (Identity & Tokens)
-- Stores credentials for YouTube, Instagram, etc.
create table public.connected_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform social_platform not null,
  
  -- External Platform IDs (e.g., YouTube Channel ID: "UC_x5...")
  external_account_id text not null,
  account_name text,
  account_handle text, -- e.g., @username
  avatar_url text,
  
  -- Security (Store tokens encrypted if possible, or rely on RLS)
  access_token text, 
  refresh_token text,
  token_expires_at timestamptz,
  
  -- Metadata (Crucial for YouTube: Store 'uploads_playlist_id' here to fetch videos easily)
  platform_metadata jsonb default '{}'::jsonb,
  
  -- Sync Status
  last_synced_at timestamptz,
  is_active boolean default true,
  
  unique(user_id, platform, external_account_id),
  created_at timestamptz default now()
);

-- 5. CONTENT INVENTORY (The "Items")
-- Stores static data about videos/posts. Separates "What it is" from "How it performed".
create table public.content_items (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  
  -- External ID (e.g., YouTube Video ID: "dQw4w9WgXcQ")
  external_id text not null,
  
  -- Static Metadata
  title text,
  description text,
  url text, -- Permlink
  thumbnail_url text,
  published_at timestamptz not null, -- Critical for sorting
  
  -- Categorization
  type content_type default 'video',
  
  -- Platform specific static data (e.g., YouTube video duration, Instagram image dimensions)
  static_metadata jsonb default '{}'::jsonb,
  
  unique(account_id, external_id),
  created_at timestamptz default now()
);

-- 6. ACCOUNT SNAPSHOTS (Channel Growth Over Time)
-- records daily stats like "Total Subscribers" or "Total Channel Views"
create table public.account_snapshots (
  id bigint generated always as identity primary key,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  -- Normalized Metrics (Common across platforms)
  follower_count bigint default 0, -- Subscribers/Followers
  total_views bigint default 0,    -- Lifetime channel views
  media_count int default 0,       -- Total videos/posts
  
  -- Raw API Data (Deep Analytics)
  -- Store YouTube "impressions", "ctr", "traffic_sources" here
  raw_data jsonb default '{}'::jsonb
);

-- 7. CONTENT SNAPSHOTS (Video Performance Over Time)
-- records daily stats for specific videos (Views, Likes, Retention)
create table public.content_snapshots (
  id bigint generated always as identity primary key,
  content_id uuid references public.content_items(id) on delete cascade not null,
  recorded_at timestamptz default now(),
  
  -- NORMALIZED CORE METRICS (The "One Table" Comparison columns)
  views bigint default 0,
  likes bigint default 0,
  comments bigint default 0,
  shares bigint default 0,
  
  -- CALCULATED METRICS (For sorting)
  engagement_rate numeric(10, 4), -- stored to avoid expensive calculation on read
  
  -- DEEP ANALYTICS (Platform Specific)
  -- YouTube: "averageViewDuration", "retention_graph", "estimatedRevenue"
  -- Instagram: "reach", "impressions", "saves"
  raw_data jsonb default '{}'::jsonb
);

-- 8. INDEXES (Performance Optimization)
-- Ensure the dashboard loads fast even with 1M+ rows
create index idx_content_account on public.content_items(account_id);
create index idx_content_published on public.content_items(published_at desc);
create index idx_snapshots_content_time on public.content_snapshots(content_id, recorded_at desc);
create index idx_snapshots_account_time on public.account_snapshots(account_id, recorded_at desc);

-- 9. ROW LEVEL SECURITY (RLS)
-- Mandatory for Security. Users can only see their own data.
alter table public.connected_accounts enable row level security;
alter table public.content_items enable row level security;
alter table public.account_snapshots enable row level security;
alter table public.content_snapshots enable row level security;

-- Policy: Users can only access accounts they own
create policy "Users manage own accounts" 
on public.connected_accounts for all 
using (auth.uid() = user_id);

-- Policy: Content access cascades from accounts
create policy "Users view own content" 
on public.content_items for select 
using (
  exists (
    select 1 from public.connected_accounts 
    where id = public.content_items.account_id 
    and user_id = auth.uid()
  )
);
-- (Repeat similar logic for snapshots)
