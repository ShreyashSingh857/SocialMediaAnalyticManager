-- Enable Row Level Security
alter table channel_daily_metrics enable row level security;
alter table videos enable row level security;
alter table video_snapshots enable row level security;
alter table account_snapshots enable row level security;

-- Policies for channel_daily_metrics
create policy "Users can view their own channel metrics"
on channel_daily_metrics for select
using (
  auth.uid() in (
    select user_id from connected_accounts where id = channel_daily_metrics.account_id
  )
);

create policy "Users can insert/update their own channel metrics"
on channel_daily_metrics for all
using (
  auth.uid() in (
    select user_id from connected_accounts where id = channel_daily_metrics.account_id
  )
)
with check (
  auth.uid() in (
    select user_id from connected_accounts where id = channel_daily_metrics.account_id
  )
);

-- Policies for videos
create policy "Users can view their own videos"
on videos for select
using (
  auth.uid() in (
    select user_id from connected_accounts where id = videos.account_id
  )
);

create policy "Users can insert/update their own videos"
on videos for all
using (
  auth.uid() in (
    select user_id from connected_accounts where id = videos.account_id
  )
);

-- Policies for video_snapshots
create policy "Users can view their own video snapshots"
on video_snapshots for select
using (
  exists (
    select 1 from videos 
    join connected_accounts on videos.account_id = connected_accounts.id
    where videos.id = video_snapshots.video_id
    and connected_accounts.user_id = auth.uid()
  )
);

create policy "Users can insert their own video snapshots"
on video_snapshots for insert
with check (
  exists (
    select 1 from videos 
    join connected_accounts on videos.account_id = connected_accounts.id
    where videos.id = video_snapshots.video_id
    and connected_accounts.user_id = auth.uid()
  )
);

-- Policies for account_snapshots
create policy "Users can view their own account snapshots"
on account_snapshots for select
using (
  auth.uid() in (
    select user_id from connected_accounts where id = account_snapshots.account_id
  )
);

create policy "Users can insert their own account snapshots"
on account_snapshots for insert
with check (
  auth.uid() in (
    select user_id from connected_accounts where id = account_snapshots.account_id
  )
);
