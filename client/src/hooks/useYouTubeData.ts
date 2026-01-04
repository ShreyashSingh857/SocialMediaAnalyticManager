import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DailyMetric {
    date: string;
    views: number;
    watchTimeHours: number;
    subscribersGained: number;
}

export interface VideoStats {
    id: string;
    title: string;
    thumbnailUrl: string;
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
}

export interface ChannelOverview {
    totalViews: string;
    subscriberCount: string;
    videoCount: string;
    channelName: string;
    customUrl: string;
    thumbnailUrl: string;
}

export interface AIInsights {
    weeklyTrend?: {
        summary: {
            trend_direction: 'up' | 'down' | 'flat';
            trend_slope: number;
            peak_date: string;
            peak_views: number;
        };
        rolling_averages: { date: string; views_7d_avg: number }[];
    };
    engagement?: {
        average_engagement_rate: number;
        top_engaged_videos: { id: string; title: string; engagement_rate: number }[];
    };
}

interface YouTubeDataState {
    loading: boolean;
    error: string | null;
    overview: ChannelOverview | null;
    history: DailyMetric[];
    topVideos: VideoStats[];
    insights: AIInsights | null;
}

export const useYouTubeData = () => {
    const [data, setData] = useState<YouTubeDataState>({
        loading: true,
        error: null,
        overview: null,
        history: [],
        topVideos: [],
        insights: null
    });

    const loadInsightsFromDB = async (accountId: string) => {
        try {
            const { data: insightsData } = await supabase
                .from('analytics_insights')
                .select('*')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false });

            if (insightsData) {
                const weeklyTrend = insightsData.find(i => i.insight_type === 'weekly_trend')?.data;
                const engagement = insightsData.find(i => i.insight_type === 'engagement_summary')?.data;
                
                return { weeklyTrend, engagement };
            }
        } catch (err) {
            console.error("Error loading insights:", err);
        }
        return null;
    };

    const fetchData = useCallback(async () => {
        // 1. Try to load cached data immediately
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        
        if (userId) {
             // We need the account ID first to load cache
             const { data: account } = await supabase
                .from('connected_accounts')
                .select('id')
                .eq('user_id', userId)
                .eq('platform', 'youtube')
                .maybeSingle();
            
            if (account) {
                 // Load cache in background while API fetches
                 loadFromDB(userId, account.id).then(cachedData => {
                     if (cachedData) {
                         setData(prev => ({ ...prev, ...cachedData, loading: false }));
                     }
                 });
            }
        }

        try {
            const providerToken = sessionData.session?.provider_token;


            // --- STRATEGY: TRY API FIRST, FALLBACK TO DB ---

            if (!providerToken) {
                console.warn('No provider token found. Attempting to load from DB...');
                await loadFromDB(sessionData.session?.user?.id);
                return;
            }

            const headers = { Authorization: `Bearer ${providerToken}` };

            // 1. Fetch Channel Details
            const channelResp = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true', { headers });

            if (!channelResp.ok) {
                console.warn("API Error (Channel). Fallback to DB.");
                await loadFromDB(sessionData.session?.user?.id);
                return;
            }

            const channelJson = await channelResp.json();
            if (!channelJson.items?.length) throw new Error('No YouTube channel found.');

            const channelItem = channelJson.items[0];
            const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

            const overview: ChannelOverview = {
                totalViews: channelItem.statistics.viewCount,
                subscriberCount: channelItem.statistics.subscriberCount,
                videoCount: channelItem.statistics.videoCount,
                channelName: channelItem.snippet.title,
                customUrl: channelItem.snippet.customUrl,
                thumbnailUrl: channelItem.snippet.thumbnails?.default?.url
            };

            // 2. Fetch Recent Videos (Uploads) - Fetch ALL (up to limit)
            let allVideos: VideoStats[] = [];
            let nextPageToken: string | undefined = undefined;
            let fetchedCount = 0;
            const MAX_VIDEOS_TO_FETCH = 50; // Fetch up to 50 videos for analysis

            do {
                const playlistUrl: string = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
                const playlistResp = await fetch(playlistUrl, { headers });
                const playlistJson = await playlistResp.json();

                if (playlistJson.items?.length) {
                    const videoIds = playlistJson.items.map((item: any) => item.snippet.resourceId.videoId);
                    
                    // Fetch stats for this batch of 50
                    const videosResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}`, { headers });
                    const videosJson = await videosResp.json();

                    const batchVideos = videosJson.items.map((v: any) => ({
                        id: v.id,
                        title: v.snippet.title,
                        thumbnailUrl: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
                        publishedAt: v.snippet.publishedAt,
                        views: parseInt(v.statistics.viewCount || '0'),
                        likes: parseInt(v.statistics.likeCount || '0'),
                        comments: parseInt(v.statistics.commentCount || '0')
                    }));

                    allVideos = [...allVideos, ...batchVideos];
                }

                nextPageToken = playlistJson.nextPageToken;
                fetchedCount += playlistJson.items?.length || 0;

            } while (nextPageToken && fetchedCount < MAX_VIDEOS_TO_FETCH);

            // Sort by views for "Top Videos" list, or keep chronological? 
            // User wants "Top Performing", so let's sort by views descending.
            allVideos.sort((a, b) => b.views - a.views);
            
            const topVideos = allVideos; // We pass all of them, UI handles display limit

            // 3. Fetch Analytics Report (Last 30 Days)
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,subscribersGained&dimensions=day&sort=day`;

            const analyticsResp = await fetch(analyticsUrl, { headers });
            const analyticsJson = analyticsResp.ok ? await analyticsResp.json() : { rows: [] };

            const history: DailyMetric[] = (analyticsJson.rows || []).map((row: any[]) => ({
                date: row[0],
                views: row[1],
                watchTimeHours: parseFloat((row[2] / 60).toFixed(1)),
                subscribersGained: row[3]
            }));

            // --- SUCCESS: CACHE DATA TO DB ---
            cacheDataToDB(sessionData.session?.user?.id, overview, history, topVideos);

            setData({
                loading: false,
                error: null,
                overview,
                history,
                topVideos
            });

        } catch (err: any) {
            console.error('Error in useYouTubeData:', err);
            // Last ditch effort to load DB
            const { data: sessionData } = await supabase.auth.getSession();
            await loadFromDB(sessionData.session?.user?.id, err.message);
        }
    }, []);

    // Helper: Save data to Supabase
    const cacheDataToDB = async (userId: string | undefined, overview: ChannelOverview, history: DailyMetric[], videos: VideoStats[]) => {
        if (!userId) return;
        try {
            // Get Account ID
            const { data: account } = await supabase
                .from('connected_accounts')
                .select('id')
                .eq('user_id', userId)
                .eq('platform', 'youtube')
                .maybeSingle();

            if (!account) return;

            // 1. Upsert Account Snapshot (Overview)
            if (overview) {
                const today = new Date().toISOString().split('T')[0];
                const startOfDay = `${today}T00:00:00.000Z`;
                const endOfDay = `${today}T23:59:59.999Z`;

                // Delete existing snapshot for today to "rewrite" it
                const { error: delError } = await supabase.from('account_snapshots')
                    .delete()
                    .eq('account_id', account.id)
                    .gte('recorded_at', startOfDay)
                    .lte('recorded_at', endOfDay);
                
                if (delError) console.error('Error deleting old snapshot:', delError);

                const snapshotData = {
                    account_id: account.id,
                    follower_count: parseInt(overview.subscriberCount),
                    total_views: parseInt(overview.totalViews),
                    media_count: parseInt(overview.videoCount),
                    recorded_at: new Date().toISOString()
                };
                
                const { error: snapErr } = await supabase.from('account_snapshots').insert(snapshotData);
                if (snapErr) {
                    if (snapErr.code === '23505') {
                        console.log('Snapshot already exists for today (race condition ignored).');
                    } else {
                        console.error("Cache Account Snapshot Error:", snapErr);
                    }
                }
            }

            // 2. Upsert History
            if (history.length > 0) {
                const upsertHistory = history.map(h => ({
                    account_id: account.id,
                    date: h.date,
                    views: h.views,
                    watch_time_hours: h.watchTimeHours,
                    subscribers_gained: h.subscribersGained
                }));
                // Try catch this specifically as constraint might be missing before user runs fix script
                const { error: histErr } = await supabase.from('channel_daily_metrics').upsert(upsertHistory, { onConflict: 'account_id,date' });
                if (histErr) console.error("Cache History Error (Check if UNIQUE constraint exists):", histErr);
            }

            // 2. Upsert Videos & Snapshots
            if (videos.length > 0) {
                // Upsert Video Metadata
                const upsertVideos = videos.map(v => ({
                    account_id: account.id,
                    external_id: v.id,
                    title: v.title,
                    thumbnail_url: v.thumbnailUrl,
                    published_at: v.publishedAt,
                    type: 'video' // Explicitly set type
                }));
                // Separate upsert for videos due to ID requirements (we need internal UUIDs for snapshots)
                const { data: savedVideos, error: vidErr } = await supabase.from('content_items').upsert(upsertVideos, { onConflict: 'account_id,external_id' }).select();

                if (vidErr) console.error("Cache Videos Error:", vidErr);

                if (savedVideos) {
                    // Map external IDs to internal UUIDs
                    const vidMap = new Map(savedVideos.map(sv => [sv.external_id, sv.id]));

                    const upsertSnapshots = videos.map(v => {
                        const internalId = vidMap.get(v.id);
                        if (!internalId) return null;
                        return {
                            content_id: internalId,
                            views: v.views,
                            likes: v.likes,
                            comments: v.comments,
                            recorded_at: new Date().toISOString()
                        };
                    }).filter(Boolean);

                    const { error: snapErr } = await supabase.from('content_snapshots').insert(upsertSnapshots); // Insert new snapshots every time? Or upsert latest? 
                    // ideally we track history, so insert is fine.
                    if (snapErr) console.error("Cache Snapshots Error:", snapErr);
                }
            }

            console.log("YouTube Data Successfully Cached to DB");

            // --- TRIGGER SERVER-AI PROCESSING ---
            triggerServerProcessing(account.id, history, videos);

        } catch (e) {
            console.error("Cache Data Exception:", e);
        }
    };

    // Helper: Call Server-AI
    const triggerServerProcessing = async (accountId: string, history: DailyMetric[], videos: VideoStats[]) => {
        try {
            console.log("Triggering Server-AI with:", { accountId, historyCount: history.length, videoCount: videos.length });
            // Assuming Server-AI is running on port 8000
            // In production, this URL should be in environment variables
            const response = await fetch('http://localhost:8000/api/v1/analytics/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account_id: accountId,
                    history: history,
                    videos: videos
                })
            });
            
            const result = await response.json();
            console.log("Server-AI Response:", response.status, result);

            if (!response.ok) {
                console.error("Server-AI Error:", result);
            } else {
                // Success! Re-fetch insights from DB to update UI
                console.log("AI Processing Complete. Refreshing Insights...");
                const freshInsights = await loadInsightsFromDB(accountId);
                if (freshInsights) {
                    setData(prev => ({ ...prev, insights: freshInsights }));
                }
            }

        } catch (err) {
            console.warn("Failed to trigger Server-AI:", err);
        }
    };

    // Helper: Load data from Supabase
    const loadFromDB = async (userId: string | undefined, accountId?: string, originalError: string = '') => {
        if (!userId) {
            return null;
        }

        console.log("Attempting to load data from DB...");
        try {
            let targetAccountId = accountId;
            
            if (!targetAccountId) {
                const { data: account } = await supabase
                    .from('connected_accounts')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('platform', 'youtube')
                    .maybeSingle();
                
                if (!account) return null;
                targetAccountId = account.id;
            }

            // Load Latest Account Snapshot for Overview
            const { data: dbSnapshot } = await supabase
                .from('account_snapshots')
                .select('*')
                .eq('account_id', targetAccountId)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            // Load History
            const { data: dbHistory } = await supabase
                .from('channel_daily_metrics')
                .select('*')
                .eq('account_id', targetAccountId)
                .order('date', { ascending: true })
                .limit(30);

            // Load Videos (Get latest 50)
            const { data: dbVideos } = await supabase
                .from('content_items')
                .select('*, content_snapshots(views, likes, comments, recorded_at)')
                .eq('account_id', targetAccountId)
                .eq('type', 'video')
                .order('published_at', { ascending: false })
                .limit(50);

            // Load AI Insights
            const insights = await loadInsightsFromDB(targetAccountId);

            // Transform DB data to UI state
            const history: DailyMetric[] = (dbHistory || []).map(h => ({
                date: h.date,
                views: h.views,
                watchTimeHours: h.watch_time_hours,
                subscribersGained: h.subscribers_gained
            }));

            const topVideos: VideoStats[] = (dbVideos || []).map(v => {
                const latestSnap = v.content_snapshots?.sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
                return {
                    id: v.external_id,
                    title: v.title,
                    thumbnailUrl: v.thumbnail_url,
                    publishedAt: v.published_at,
                    views: latestSnap?.views || 0,
                    likes: latestSnap?.likes || 0,
                    comments: latestSnap?.comments || 0
                };
            });
            
            let overview = null;
            if (dbSnapshot && dbSnapshot.raw_data) {
                 // Try to reconstruct overview from snapshot
                 overview = {
                     totalViews: dbSnapshot.total_views?.toString() || "0",
                     subscriberCount: dbSnapshot.follower_count?.toString() || "0",
                     videoCount: dbSnapshot.media_count?.toString() || "0",
                     channelName: "Cached Channel", // We might need to store this in connected_accounts
                     customUrl: "",
                     thumbnailUrl: ""
                 };
            }

            return {
                loading: false,
                error: originalError ? `Loaded from Cache. API Error: ${originalError}` : null,
                overview,
                history,
                topVideos,
                insights
            };

        } catch (dbErr) {
            console.error("Load from DB failed:", dbErr);
            return null;
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...data, refetch: fetchData };
};
