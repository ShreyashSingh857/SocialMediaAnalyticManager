-- Migration: Add provider metadata support to connected_accounts
-- Date: 2026-01-16
-- Purpose: Better track provider-specific information (provider_type, tokens, etc.)

-- Add new columns if they don't exist
ALTER TABLE public.connected_accounts 
ADD COLUMN IF NOT EXISTS provider_type text DEFAULT 'oauth',
ADD COLUMN IF NOT EXISTS page_access_token text,
ADD COLUMN IF NOT EXISTS scope text,
ADD COLUMN IF NOT EXISTS token_type text DEFAULT 'bearer';

-- Add unique constraint on user_id, platform for upsert operations
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_connected_accounts_user_platform'
    ) THEN
        ALTER TABLE public.connected_accounts
        ADD CONSTRAINT uq_connected_accounts_user_platform UNIQUE (user_id, platform);
    END IF;
END
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_connected_accounts_provider_type 
ON public.connected_accounts(user_id, platform, provider_type);

-- Enable RLS and add policies only if missing (Postgres versions without IF NOT EXISTS on policies)
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies
		WHERE schemaname = 'public'
		  AND tablename = 'connected_accounts'
		  AND policyname = 'Users can view own connected accounts'
	) THEN
		CREATE POLICY "Users can view own connected accounts"
		ON public.connected_accounts
		FOR SELECT
		USING (user_id = auth.uid());
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_policies
		WHERE schemaname = 'public'
		  AND tablename = 'connected_accounts'
		  AND policyname = 'Users can manage own connected accounts'
	) THEN
		CREATE POLICY "Users can manage own connected accounts"
		ON public.connected_accounts
		FOR ALL
		USING (user_id = auth.uid());
	END IF;
END
$$;
