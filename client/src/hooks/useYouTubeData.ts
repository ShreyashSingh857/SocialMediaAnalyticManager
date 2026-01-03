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

interface YouTubeDataState {
    loading: boolean;
    error: string | null;
    overview: ChannelOverview | null;
    history: DailyMetric[];
    topVideos: VideoStats[];
}

export const useYouTubeData = () => {
    const [data, setData] = useState<YouTubeDataState>({
        loading: true,
        error: null,
        overview: null,
        history: [],
        topVideos: []
    });

    const fetchData = useCallback(async () => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
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

            // 2. Fetch Recent Videos (Uploads)
            const playlistResp = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5`, { headers });
            const playlistJson = await playlistResp.json();

            let topVideos: VideoStats[] = [];

            if (playlistJson.items?.length) {
                const videoIds = playlistJson.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
                const videosResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`, { headers });
                const videosJson = await videosResp.json();

                topVideos = videosJson.items.map((v: any) => ({
                    id: v.id,
                    title: v.snippet.title,
                    thumbnailUrl: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
                    publishedAt: v.snippet.publishedAt,
                    views: parseInt(v.statistics.viewCount || '0'),
                    likes: parseInt(v.statistics.likeCount || '0'),
                    comments: parseInt(v.statistics.commentCount || '0')
                }));
            }

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
            // Assuming Server-AI is running on port 8000
            // In production, this URL should be in environment variables
            await fetch('http://localhost:8000/api/v1/analytics/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account_id: accountId,
                    history: history,
                    videos: videos
                })
            });
            console.log("Server-AI processing triggered");
        } catch (err) {
            console.warn("Failed to trigger Server-AI:", err);
        }
    };

    // Helper: Load data from Supabase
    const loadFromDB = async (userId: string | undefined, originalError: string = '') => {
        if (!userId) {
            setData(prev => ({ ...prev, loading: false, error: 'No user. ' + originalError }));
            return;
        }

        console.log("Attempting to load data from DB...");
        try {
            const { data: account } = await supabase
                .from('connected_accounts')
                .select('id')
                .eq('user_id', userId)
                .eq('platform', 'youtube')
                .maybeSingle();

            if (!account) {
                setData(prev => ({ ...prev, loading: false, error: 'No connected account found in DB. ' + originalError }));
                return;
            }

            // Load Latest Account Snapshot for Overview
            const { data: dbSnapshot } = await supabase
                .from('account_snapshots')
                .select('*')
                .eq('account_id', account.id)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            // Load History
            const { data: dbHistory } = await supabase
                .from('channel_daily_metrics')
                .select('*')
                .eq('account_id', account.id)
                .order('date', { ascending: true })
                .limit(30);

            // Load Videos (Get latest 5)
            // Complex join to get latest snapshot... for now just get video metadata
            const { data: dbVideos } = await supabase
                .from('content_items')
                .select('*, content_snapshots(views, likes, comments, recorded_at)') // nested select?
                .eq('account_id', account.id)
                .eq('type', 'video') // Filter by type
                .order('published_at', { ascending: false })
                .limit(5);

            // Transform DB data to UI state
            const history: DailyMetric[] = (dbHistory || []).map(h => ({
                date: h.date,
                views: h.views,
                watchTimeHours: h.watch_time_hours,
                subscribersGained: h.subscribers_gained
            }));

            const topVideos: VideoStats[] = (dbVideos || []).map(v => {
                // Get most recent snapshot
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

            // Note: Overview stats (Total Views/Subs) are not currently in a separate table in schema.sql
            // We could fetch them from the latest `account_snapshots` if valid, or just estimate from history.
            // For now, let's leave overview null or use placeholder if completely offline.
            // Or better: update the schema.sql to store 'channel_stats' on connected_accounts. 
            // Assuming for now overview might be missing in offline mode unless we persisted it.

            setData({
                loading: false,
                error: originalError ? `Loaded from Cache (Offline Mode). API Error: ${originalError}` : null,
                overview: null, // Partial data limitation for now
                history,
                topVideos
            });

        } catch (dbErr) {
            console.error("Load from DB failed:", dbErr);
            setData(prev => ({ ...prev, loading: false, error: 'Failed to load from API and DB. ' + originalError }));
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...data, refetch: fetchData };
};
