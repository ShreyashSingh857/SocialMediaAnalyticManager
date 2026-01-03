-- CRITICAL FIX: Enable access to connected_accounts
-- Other policies rely on reading this table to verify ownership.
-- If this is blocked, all other inserts/selects will fail silently.

alter table connected_accounts enable row level security;

create policy "Users can view their own connected accounts"
on connected_accounts for select
using (auth.uid() = user_id);

create policy "Users can insert/update their own connected accounts"
on connected_accounts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Ensure previous policies are correct (re-applying won't hurt if using 'create policy if not exists' mechanisms, 
-- but standard SQL throws error if exists. So we'll just add the missing link here).

-- Grant permissions for Server-AI (Service Role) to bypass RLS if needed, though Service Role usually bypasses automatically.
-- If you are using the Anon Key in server-ai .env, it will fail. Ensure SERVICE_KEY is used.
