import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { resolveGoogleTokens } from '../lib/tokenManager';
import { API_ENDPOINTS } from '../lib/config';

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

export interface VideoComment {
    id: string;
    author_name: string;
    author_avatar: string;
    text_display: string;
    published_at: string;
    like_count: number;
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
    comments: Record<string, VideoComment[]>;
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

    const loadCommentsFromDB = async () => {
        try {
            const { data: commentsData, error } = await supabase
                .from('video_comments')
                .select('*')
                .order('published_at', { ascending: false });

            if (error) {
                console.error("Error fetching comments from DB:", error);
                return {};
            }

            const commentsMap: Record<string, VideoComment[]> = {};
            
            if (commentsData && commentsData.length > 0) {
                console.log(`📥 Loaded ${commentsData.length} comments from database`);
                commentsData.forEach(comment => {
                    // Use video_id (UUID) from database
                    const videoKey = comment.video_id;
                    if (!commentsMap[videoKey]) {
                        commentsMap[videoKey] = [];
                    }
                    commentsMap[videoKey].push({
                        id: comment.id,
                        author_name: comment.author_name,
                        author_avatar: comment.author_avatar,
                        text_display: comment.text_display,
                        published_at: comment.published_at,
                        like_count: comment.like_count || 0
                    });
                });
                console.log("📍 Comments grouped by video_id:", Object.keys(commentsMap));
            } else {
                console.warn("⚠️ No comments found in database");
            }
            
            return commentsMap;
        } catch (err) {
            console.error("Error loading comments:", err);
            return {};
        }
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

            // Load Videos with latest engagement metrics
            const { data: dbVideos, error: videosError } = await supabase
                .from('content_items')
                .select(`
                    *,
                    content_snapshots (
                        views,
                        likes,
                        comments
                    )
                `)
                .eq('account_id', account.id)
                .eq('type', 'video')
                .order('published_at', { ascending: false })
                .limit(50);
            if (videosError) {
                console.error('Error fetching YouTube videos:', videosError);
            }


            // Load Comments
            const commentsData = await loadCommentsFromDB();

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
                // Get the latest snapshot for this video (most recent engagement metrics)
                const latestSnapshot = v.content_snapshots && v.content_snapshots.length > 0
                    ? v.content_snapshots[v.content_snapshots.length - 1]
                    : null;

                return {
                    id: v.external_id,
                    title: v.title,
                    thumbnailUrl: v.thumbnail_url,
                    publishedAt: v.published_at,
                    views: latestSnapshot?.views || 0,
                    likes: latestSnapshot?.likes || 0,
                    comments: latestSnapshot?.comments || 0
                };
            });

            // Map comments by external_id (YouTube video ID) instead of database UUID
            const commentsMapByExternalId: Record<string, VideoComment[]> = {};
            if (dbVideos && dbVideos.length > 0) {
                dbVideos.forEach(video => {
                    const dbVideoId = video.id; // UUID from database
                    const externalId = video.external_id; // YouTube video ID
                    
                    if (commentsData[dbVideoId] && commentsData[dbVideoId].length > 0) {
                        commentsMapByExternalId[externalId] = commentsData[dbVideoId];
                        console.log(`✅ Mapped ${commentsData[dbVideoId].length} comments for video ${externalId}`);
                    }
                });
            }

            console.log("📝 Raw Comments Data - Video IDs with comments:", Object.keys(commentsData));
            console.log("🎥 Total videos fetched:", dbVideos?.length || 0);
            console.log("🎬 Videos with mapped comments:", Object.keys(commentsMapByExternalId));
            console.log("💬 Final Comments Map:", Object.keys(commentsMapByExternalId).length > 0 ? commentsMapByExternalId : "NO COMMENTS");

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
                comments: commentsMapByExternalId
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

            const { accessToken, refreshToken, source } = await resolveGoogleTokens(
                userId,
                currentSession.provider_token,
                currentSession.provider_refresh_token
            );

            if (!accessToken) {
                console.warn("No Google access token available (session or stored). Skipping YouTube sync.");
                return;
            }

            if (source === 'stored') {
                console.log("Using stored Google token for YouTube sync.");
            }

            // Use backend API instead of Supabase Edge Function (better CORS handling)
            const response = await fetch(API_ENDPOINTS.YOUTUBE.SYNC, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    access_token: accessToken,
                    refresh_token: refreshToken
                })
            });

            if (!response.ok) {
                throw new Error(`YouTube sync failed: ${response.status} ${response.statusText}`);
            }

            const syncResult = await response.json();
            const syncError = null;

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
            
            // 3. Trigger Analytics Insights Calculation
            console.log("Triggering analytics insights calculation...");
            try {
                // Load the account to get account_id for analytics
                const { data: account } = await supabase
                    .from('connected_accounts')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('platform', 'youtube')
                    .maybeSingle();

                if (account) {
                    const analyticsResponse = await fetch(API_ENDPOINTS.ANALYTICS.PROCESS, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            account_id: account.id
                        })
                    });
                    
                    if (analyticsResponse.ok) {
                        const analyticsResult = await analyticsResponse.json();
                        console.log("Analytics Processing Complete:", analyticsResult);
                    } else {
                        const errorText = await analyticsResponse.text();
                        console.warn("Analytics processing returned error:", analyticsResponse.status, errorText);
                    }
                } else {
                    console.warn("No YouTube account found for analytics processing");
                }
            } catch (analyticsErr) {
                console.warn("Failed to calculate analytics insights:", analyticsErr);
                // Don't fail the whole sync if analytics fails
            }
            
            // 4. Re-fetch from DB after sync and analytics
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
