-- Database Constraint Verification & Fixes
-- This script ensures that the upsert operations used in the sync process
-- have the necessary unique constraints to prevent data duplication.

BEGIN;

-- 1. Ensure connected_accounts has unique user_id + platform + external_account_id
-- (This should already be in schema.sql but let's be sure)
-- ALREADY IN SCHEMA: unique(user_id, platform, external_account_id)

-- 2. Ensure channel_daily_metrics has unique account_id + date
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'channel_daily_metrics_account_id_date_key'
    ) THEN
        ALTER TABLE public.channel_daily_metrics 
        ADD CONSTRAINT channel_daily_metrics_account_id_date_key 
        UNIQUE (account_id, date);
    END IF;
END $$;

-- 3. Ensure content_items has unique account_id + external_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'content_items_account_id_external_id_key'
    ) THEN
        ALTER TABLE public.content_items 
        ADD CONSTRAINT content_items_account_id_external_id_key 
        UNIQUE (account_id, external_id);
    END IF;
END $$;

-- 4. Ensure profiles table existence (as it might have been missed in some setups)
-- (Handled by Supabase Auth generally, but profiles table is ours)

COMMIT;
