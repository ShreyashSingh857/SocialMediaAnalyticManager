-- Table for storing calculated insights from Server-AI
create table if not exists analytics_insights (
    id uuid default gen_random_uuid() primary key,
    account_id uuid references connected_accounts(id) on delete cascade not null,
    insight_type text not null, -- e.g. 'weekly_trend', 'engagement_summary'
    start_date date,
    end_date date,
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz default now()
);

-- RLS
alter table analytics_insights enable row level security;

create policy "Users can view their own insights"
on analytics_insights for select
using (
  auth.uid() in (
    select user_id from connected_accounts where id = analytics_insights.account_id
  )
);

create policy "Users can insert their own insights" -- Or service key bypasses this
on analytics_insights for insert
with check (
  auth.uid() in (
    select user_id from connected_accounts where id = analytics_insights.account_id
  )
);
