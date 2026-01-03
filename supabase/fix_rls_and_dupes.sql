-- Fix RLS and Duplicate Data Issues

-- 1. Fix RLS on content_items
-- Drop existing policies to be safe
DROP POLICY IF EXISTS "Users manage own content" ON public.content_items;
DROP POLICY IF EXISTS "Users view own content" ON public.content_items;

-- Create a comprehensive policy for CRUD
-- We verify that the account_id linked to the content belongs to the current user
CREATE POLICY "Users manage own content" 
ON public.content_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.connected_accounts 
    WHERE id = content_items.account_id 
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.connected_accounts 
    WHERE id = account_id -- In the new row
    AND user_id = auth.uid()
  )
);

-- 2. Fix RLS on content_snapshots
DROP POLICY IF EXISTS "Users manage own snapshots" ON public.content_snapshots;
CREATE POLICY "Users manage own snapshots"
ON public.content_snapshots
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.content_items
    JOIN public.connected_accounts ON content_items.account_id = connected_accounts.id
    WHERE content_items.id = content_snapshots.content_id
    AND connected_accounts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.content_items
    JOIN public.connected_accounts ON content_items.account_id = connected_accounts.id
    WHERE content_items.id = content_id
    AND connected_accounts.user_id = auth.uid()
  )
);

-- 3. Clean up existing duplicates FIRST
-- We must delete duplicates BEFORE creating the unique index, otherwise the index creation fails.
DELETE FROM public.account_snapshots a
WHERE id < (
    SELECT MAX(id)
    FROM public.account_snapshots b
    WHERE a.account_id = b.account_id
    AND ((a.recorded_at AT TIME ZONE 'UTC')::date) = ((b.recorded_at AT TIME ZONE 'UTC')::date)
);

-- 4. Prevent Duplicate Snapshots (One per day per account)
-- Now that duplicates are gone, we can safely create the index.
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_account_snapshot 
ON public.account_snapshots (account_id, ((recorded_at AT TIME ZONE 'UTC')::date));
