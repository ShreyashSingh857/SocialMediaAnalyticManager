/**
 * YouTube Service
 * Handles types and client-side utilities for YouTube data.
 * All API calls are now moved to Supabase Edge Functions for security and reliability.
 */

export interface YouTubeStats {
    id: string;
    channelName: string;
    subscribers: string;
    views: string;
    videos: string;
    thumbnail: string;
    customUrl: string;
}

// All fetching logic has been moved to Supabase Edge Functions:
// - youtube-sync: Handles all data fetching, token refresh, and DB upserts.
// - Use the useYouTubeData hook to interact with this data.
