-- Create table for storing daily channel metrics
create table if not exists channel_daily_metrics (
    id uuid default gen_random_uuid() primary key,
    account_id uuid references connected_accounts(id) on delete cascade not null,
    date date not null,
    views bigint not null default 0,
    watch_time_hours numeric(10, 2) not null default 0,
    subscribers_gained int not null default 0,
    created_at timestamptz default now(),
    
    -- Ensure we don't duplicate data for the same day
    unique(account_id, date)
);

-- Create table for storing video details
create table if not exists videos (
    id uuid default gen_random_uuid() primary key,
    account_id uuid references connected_accounts(id) on delete cascade not null,
    external_id text not null, -- YouTube Video ID
    title text not null,
    thumbnail_url text,
    published_at timestamptz,
    created_at timestamptz default now(),
    
    unique(account_id, external_id)
);

-- Create table for storing latest stats for videos
create table if not exists video_snapshots (
    id uuid default gen_random_uuid() primary key,
    video_id uuid references videos(id) on delete cascade not null,
    views bigint not null default 0,
    likes bigint not null default 0,
    comments bigint not null default 0,
    recorded_at timestamptz default now()
);

-- Helper index for sorting videos
create index if not exists videos_published_at_idx on videos(published_at desc);
create index if not exists channel_daily_metrics_date_idx on channel_daily_metrics(date);
