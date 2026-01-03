-- Add UNIQUE constraint to videos for (account_id, external_id)
-- This allows ON CONFLICT (account_id, external_id) DO UPDATE to work
ALTER TABLE videos 
ADD CONSTRAINT videos_account_id_external_id_key 
UNIQUE (account_id, external_id);
