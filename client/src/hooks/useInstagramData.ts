import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface InstagramProfile {
    username: string;
    fullName: string;
    profilePictureUrl: string;
    followers: number;
    mediaCount: number;
}

export interface InstagramPost {
    id: string;
    caption: string;
    media_url: string;
    thumbnail_url?: string;
    permalink: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    like_count: number;
    comments_count: number;
    timestamp: string;
    engagement_rate?: number;
}

interface InstagramDataState {
    loading: boolean;
    error: string | null;
    profile: InstagramProfile | null;
    posts: InstagramPost[];
    debugInfo?: any;
}

export const useInstagramData = () => {
    const [data, setData] = useState<InstagramDataState>({
        loading: true,
        error: null,
        profile: null,
        posts: []
    });

    const loadFromDB = async (userId: string) => {
        try {
            // 1. Get Connected Account
            const { data: account } = await supabase
                .from('connected_accounts')
                .select('*')
                .eq('user_id', userId)
                .eq('platform', 'instagram')
                .maybeSingle();

            if (!account) return null;

            // 2. Get Posts
            const { data: dbPosts } = await supabase
                .from('content_items')
                .select('*, content_snapshots(likes, comments, engagement_rate, recorded_at)')
                .eq('account_id', account.id)
                .eq('platform', 'instagram')
                .order('published_at', { ascending: false })
                .limit(50);

            // Transform Account
            const profile: InstagramProfile = {
                username: account.account_handle || account.account_name,
                fullName: account.account_name,
                profilePictureUrl: account.avatar_url,
                followers: account.follower_count,
                mediaCount: account.media_count
            };

            // Transform Posts
            const posts: InstagramPost[] = (dbPosts || []).map(p => {
                // Get latest snapshot
                const snapshots = p.content_snapshots || [];
                const latestSnap = [...snapshots].sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];

                return {
                    id: p.external_id,
                    caption: p.description,
                    media_url: p.thumbnail_url, // For now mapping to thumbnail/media url
                    permalink: p.url,
                    media_type: p.type === 'reel' ? 'VIDEO' : 'IMAGE',
                    timestamp: p.published_at,
                    like_count: latestSnap?.likes || 0,
                    comments_count: latestSnap?.comments || 0,
                    engagement_rate: latestSnap?.engagement_rate || 0
                };
            });

            return { profile, posts };

        } catch (err) {
            console.error("IG Load DB Error:", err);
            return null;
        }
    };

    const fetchData = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            setData(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            // 1. Initial Load
            const cached = await loadFromDB(userId);
            if (cached) {
                setData(prev => ({ ...prev, ...cached, loading: false }));
            }

            // 2. Server Sync
            // Only sync if we have a provider token and it appears to be from Facebook (based on recent identity)
            let isFacebookToken = false;
            if (session?.provider_token) {
                 if (session.user?.app_metadata?.provider === 'facebook') {
                     isFacebookToken = true;
                 } else if (session.user?.identities) {
                     // Check if most recent sign-in is facebook
                     const sorted = [...session.user.identities].sort((a, b) => 
                        new Date(b.last_sign_in_at || 0).getTime() - new Date(a.last_sign_in_at || 0).getTime()
                     );
                     if (sorted[0]?.provider === 'facebook') {
                         isFacebookToken = true;
                     }
                 }
            }

            if (session?.provider_token && isFacebookToken) {
                console.log("Syncing Instagram Data...");
                const { data: syncResult, error: syncError } = await supabase.functions.invoke('instagram-sync', {
                    body: {
                        user_id: userId,
                        access_token: session.provider_token
                    }
                });

                if (syncError) {
                    console.error("IG Sync Failed:", syncError);
                    // Don't block UI if we have cached data, just log error
                    // setData(prev => ({ ...prev, error: syncError.message }));
                } else {
                    console.log("IG Sync Success:", syncResult);
                    setData(prev => ({ ...prev, debugInfo: syncResult }));

                    // Reload
                    const fresh = await loadFromDB(userId);
                    if (fresh) {
                        setData(prev => ({ ...prev, ...fresh, loading: false }));
                    }
                }
            } else {
                console.log("No Facebook provider token found. Skipping IG sync.");
                setData(prev => ({ ...prev, loading: false }));
            }

        } catch (err: any) {
            console.error("useInstagramData Error:", err);
            setData(prev => ({ ...prev, loading: false, error: err.message }));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...data, refetch: fetchData };
};
