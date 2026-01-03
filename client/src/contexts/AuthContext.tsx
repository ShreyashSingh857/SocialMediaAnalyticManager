
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null; // You might want to define a stricter type here
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
            }
            setProfile(data);
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).then(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Fetch profile and set loading to false immediately
            if (session?.user) {
                // Return the promise so we can chain if needed, but primarily to ensure state updates
                fetchProfile(session.user.id).then(() => setLoading(false));

                // Extract provider_token if available and run in BACKGROUND (don't await here)
                if (session?.provider_token) {
                    (async () => {
                        console.log('Provider Token extracted, fetching YouTube stats...');
                        try {
                            const { fetchYouTubeStats } = await import('../services/youtube');
                            const stats = await fetchYouTubeStats(session.provider_token!);

                            if (stats) {
                                // 1. Upsert Connected Account
                                // We use upsert so if it doesn't exist, it gets created.
                                const { data: account, error: accError } = await supabase
                                    .from('connected_accounts')
                                    .upsert({
                                        user_id: session.user.id,
                                        platform: 'youtube',
                                        external_account_id: stats.id, // We need the channel ID here!
                                        account_name: stats.channelName,
                                        account_handle: stats.customUrl,
                                        avatar_url: stats.thumbnail,
                                        last_synced_at: new Date().toISOString(),
                                        is_active: true
                                    }, { onConflict: 'user_id,platform,external_account_id' })
                                    .select()
                                    .single();

                                if (accError) {
                                    console.error('Error upserting connected_account:', accError);
                                } else if (account) {
                                    // Upsert Snapshot (One per day)
                                    // We rely on the unique index (account_id, date(recorded_at))
                                    // Note: Supabase JS client doesn't support function-based unique constraints in 'onConflict' easily.
                                    // So we might need to rely on the DB constraint to fail the insert, OR we just insert and let the DB handle it if we had a trigger.
                                    // BUT, 'upsert' requires a unique constraint name or columns.
                                    // Since we can't easily target the function index from here, we will try to INSERT.
                                    // If it fails due to duplicate, we ignore it (or we could delete today's first).
                                    
                                    // BETTER APPROACH: Delete any snapshot for today first, then insert new one.
                                    // This ensures we "rewrite" the row with latest data.
                                    const today = new Date().toISOString().split('T')[0];
                                    
                                    // 1. Delete today's snapshot (if any)
                                    // We need to filter by date. Since recorded_at is timestamptz, we use gte/lt
                                    const startOfDay = `${today}T00:00:00.000Z`;
                                    const endOfDay = `${today}T23:59:59.999Z`;
                                    
                                    const { error: delError } = await supabase.from('account_snapshots')
                                        .delete()
                                        .eq('account_id', account.id)
                                        .gte('recorded_at', startOfDay)
                                        .lte('recorded_at', endOfDay);
                                    
                                    if (delError) console.error('Error deleting old snapshot:', delError);

                                    // 2. Insert new snapshot
                                    const { error: snapError } = await supabase.from('account_snapshots').insert({
                                        account_id: account.id,
                                        follower_count: parseInt(stats.subscribers),
                                        total_views: parseInt(stats.views),
                                        media_count: parseInt(stats.videos),
                                        recorded_at: new Date().toISOString()
                                    });
                                    
                                    if (snapError) {
                                        // If duplicate key error still happens (race condition), ignore it.
                                        if (snapError.code === '23505') {
                                            console.log('Snapshot already exists for today (race condition ignored).');
                                        } else {
                                            console.error('Error inserting snapshot:', snapError);
                                        }
                                    } else {
                                        console.log('YouTube stats synced to connected_accounts and snapshots');
                                    }
                                }
                                
                                fetchProfile(session.user.id);
                            }
                        } catch (err) {
                            console.error('Failed to fetch/save YouTube stats:', err);
                        }
                    })();
                }
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    scopes: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signInWithFacebook = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Facebook:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signInWithGoogle, signInWithFacebook, signOut }}>
            {!loading ? children : <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white">Loading...</div>}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
