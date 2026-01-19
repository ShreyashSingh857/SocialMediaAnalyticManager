-- Migration: Remove Instagram and Facebook related columns
-- Purpose: Removes all Instagram-specific and Facebook OAuth related metadata from connected_accounts table

-- 1. Remove Instagram-specific provider type column and Facebook page token
ALTER TABLE IF EXISTS public.connected_accounts
DROP COLUMN IF EXISTS provider_type,
DROP COLUMN IF EXISTS page_access_token;

-- 2. Remove Facebook-specific index
DROP INDEX IF EXISTS idx_connected_accounts_provider_type;

-- 3. Remove instagram from social_platform enum (using safe method)
-- Note: Postgres doesn't allow simple removal of enum values, so we'll leave the enum as-is
-- but the platform should not be used going forward

-- 4. Remove instagram column from profiles table
ALTER TABLE IF EXISTS public.profiles
DROP COLUMN IF EXISTS instagram;

-- 5. Update connected_accounts constraint to reflect YouTube-only support
-- Any Instagram accounts will remain in DB but should be ignored by application

COMMIT;
