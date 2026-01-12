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
            avd_minutes?: number;
            sub_conversion_rate?: number;
        };
        rolling_averages: { date: string; views_7d_avg: number }[];
    };
    engagement?: {
        average_engagement_rate: number;
        top_engaged_videos: { id: string; title: string; engagement_rate: number }[];
        engagement_quality?: { likability: number; discussability: number; video_id: string }[];
    };
}

export interface VideoComment {
    id: string;
    video_id: string;
    author_name: string;
    author_avatar: string;
    text_display: string;
    published_at: string;
    like_count: number;
}

interface YouTubeDataState {
    loading: boolean;
    error: string | null;
    overview: ChannelOverview | null;
    history: DailyMetric[];
    topVideos: VideoStats[];
    insights: AIInsights | null;
    comments: Record<string, VideoComment[]>;
    debugInfo?: any;
}

export const useYouTubeData = () => {
    const [data, setData] = useState<YouTubeDataState>({
        loading: true,
        error: null,
        overview: null,
        history: [],
        topVideos: [],
        insights: null,
        comments: {}
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

    const loadFromDB = async (userId: string) => {
        console.log("Attempting to load data from DB...");
        try {
            const { data: account } = await supabase
                .from('connected_accounts')
                .select('id, account_name, account_handle, avatar_url')
                .eq('user_id', userId)
                .eq('platform', 'youtube')
                .maybeSingle();

            if (!account) return null;

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

            // Load Videos
            const { data: dbVideos } = await supabase
                .from('content_items')
                .select('*, content_snapshots(views, likes, comments, recorded_at)')
                .eq('account_id', account.id)
                .eq('type', 'video')
                .order('published_at', { ascending: false })
                .limit(50);

            // Load Comments (NEW)
            const videoIds = dbVideos?.map(v => v.id) || [];
            let commentsMap: Record<string, VideoComment[]> = {};

            if (videoIds.length > 0) {
                const { data: dbComments } = await supabase
                    .from('video_comments')
                    .select('*')
                    .in('video_id', videoIds)
                    .order('published_at', { ascending: false });

                if (dbComments) {
                    dbComments.forEach((c: any) => {
                        // Map internal UUID back to external ID if needed, 
                        // but CommentsList expects map keyed by EXTERNAL video ID usually? 
                        // Wait, VideoStats uses external_id as 'id'. 
                        // The 'video_comments' table stores 'video_id' which is the UUID from 'content_items'.
                        // So we need to map content_item.id (UUID) -> content_item.external_id (YouTube ID).

                        const video = dbVideos?.find(v => v.id === c.video_id);
                        if (video && video.external_id) {
                            if (!commentsMap[video.external_id]) {
                                commentsMap[video.external_id] = [];
                            }
                            commentsMap[video.external_id].push({
                                id: c.id,
                                video_id: c.video_id,
                                author_name: c.author_name,
                                author_avatar: c.author_avatar,
                                text_display: c.text_display,
                                published_at: c.published_at,
                                like_count: c.like_count
                            });
                        }
                    });
                }
            }

            // Load AI Insights
            const insights = await loadInsightsFromDB(account.id);

            // Transform DB data to UI state
            const history: DailyMetric[] = (dbHistory || []).map(h => ({
                date: h.date,
                views: h.views,
                watchTimeHours: h.watch_time_hours,
                subscribersGained: h.subscribers_gained
            }));

            const topVideos: VideoStats[] = (dbVideos || []).map(v => {
                const snapshots = v.content_snapshots || [];
                const latestSnap = [...snapshots].sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
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
            if (dbSnapshot) {
                overview = {
                    totalViews: dbSnapshot.total_views?.toString() || "0",
                    subscriberCount: dbSnapshot.follower_count?.toString() || "0",
                    videoCount: dbSnapshot.media_count?.toString() || "0",
                    channelName: account.account_name || "Connected Channel",
                    customUrl: account.account_handle || "",
                    thumbnailUrl: account.avatar_url || ""
                };
            }

            return {
                overview,
                history,
                topVideos,
                insights,
                comments: commentsMap
            };

        } catch (dbErr) {
            console.error("Load from DB failed:", dbErr);
            return null;
        }
    };

    const fetchData = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            setData(prev => ({ ...prev, loading: false, error: 'User not authenticated' }));
            return;
        }

        try {
            // 1. Initial Load from DB
            const cachedData = await loadFromDB(userId);
            if (cachedData) {
                setData(prev => ({ ...prev, ...cachedData, loading: false }));
            }

            // 2. Trigger Server-side Sync
            console.log("Triggering server-side YouTube sync...");
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            if (!currentSession) {
                console.warn("No active session, skipping sync.");
                return;
            }

            const { data: syncResult, error: syncError } = await supabase.functions.invoke('youtube-sync', {
                body: {
                    user_id: userId,
                    access_token: currentSession.provider_token,
                    refresh_token: currentSession.provider_refresh_token
                }
            });

            if (syncError) {
                // Try to extract body from FunctionsHttpError
                let errorMsg = syncError.message;
                if (syncError instanceof Error && 'context' in syncError) {
                    try {
                        const errorDesc = await (syncError as any).context?.json();
                        if (errorDesc?.error) errorMsg = errorDesc.error;
                    } catch (e) { }
                }

                console.error("YouTube Sync Failed:", errorMsg);
                throw new Error(errorMsg);
            }

            console.log("Sync Complete:", syncResult);
            // UPDATE STATE WITH DEBUG INFO
            setData(prev => ({ ...prev, debugInfo: syncResult }));

            // 3. Re-fetch from DB after sync
            const freshData = await loadFromDB(userId);
            if (freshData) {
                setData(prev => ({ ...prev, ...freshData, loading: false }));
            }
        } catch (err: any) {
            console.error('Error in useYouTubeData:', err);
            setData(prev => ({ ...prev, loading: false, error: err.message }));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...data, refetch: fetchData };
};
