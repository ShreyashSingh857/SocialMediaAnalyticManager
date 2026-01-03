-- Run this in your Supabase SQL Editor
alter table profiles 
add column if not exists youtube_stats jsonb;
