
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

                // Trigger server-side sync with provider tokens for initial link/refresh storage
                if (session?.provider_token) {
                    const invokeBody = {
                        user_id: session.user.id,
                        access_token: session.provider_token,
                        refresh_token: session.provider_refresh_token // Crucial for future background syncs
                    };

                    // Determine provider from most recent identity login
                    let provider = session.user.app_metadata.provider;
                    if (session.user.identities && session.user.identities.length > 0) {
                        const sortedIdentities = [...session.user.identities].sort((a, b) => {
                            return new Date(b.last_sign_in_at || 0).getTime() - new Date(a.last_sign_in_at || 0).getTime();
                        });
                        if (sortedIdentities[0]) {
                            provider = sortedIdentities[0].provider;
                        }
                    }
                    
                    console.log("Detected Provider for Sync:", provider);

                    if (provider === 'google') {
                        supabase.functions.invoke('youtube-sync', {
                            body: invokeBody
                        }).then(async ({ data, error }) => {
                            if (error) {
                                let errorMsg = error.message;
                                try {
                                    const errorDesc = await (error as any).context?.json();
                                    if (errorDesc?.error) errorMsg = errorDesc.error;
                                } catch (e) { }
                                console.error("Initial Sync Failed:", errorMsg);

                                // FALLBACK: Client-side linking if server function is outdated
                                if (errorMsg.includes("No YouTube account") || errorMsg.includes("400")) {
                                    console.log("Attempting client-side account linking...");
                                    try {
                                        // 1. Fetch Channel Info
                                        const channelResp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`, {
                                            headers: { Authorization: `Bearer ${session.provider_token}` }
                                        });

                                        if (channelResp.ok) {
                                            const channelData = await channelResp.json();
                                            const channel = channelData.items?.[0];

                                            if (channel) {
                                                // 2. Insert into Supabase
                                                const { error: dbError } = await supabase
                                                    .from("connected_accounts")
                                                    .upsert({
                                                        user_id: session.user.id,
                                                        platform: "youtube",
                                                        external_account_id: channel.id,
                                                        account_name: channel.snippet.title,
                                                        account_handle: channel.snippet.customUrl,
                                                        avatar_url: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
                                                        access_token: session.provider_token,
                                                        refresh_token: session.provider_refresh_token,
                                                        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                                                        is_active: true
                                                    }, { onConflict: 'user_id,platform,external_account_id' });

                                                if (dbError) {
                                                    console.error("Client-side linking failed:", dbError);
                                                } else {
                                                    console.log("Client-side linking successful!");
                                                    fetchProfile(session.user.id);
                                                }
                                            }
                                        }
                                    } catch (fallbackErr) {
                                        console.error("Client-side fallback error:", fallbackErr);
                                    }
                                }
                            } else {
                                console.log("Initial Sync Successful:", data);
                                fetchProfile(session.user.id);
                            }
                        });
                    } else if (provider === 'facebook') {
                        supabase.functions.invoke('instagram-sync', {
                            body: invokeBody
                        }).then(({ data, error }) => {
                            if (error) {
                                console.error("Initial Instagram Sync Failed:", error);
                            } else {
                                console.log("Initial Instagram Sync Successful:", data);
                                fetchProfile(session.user.id);
                            }
                        });
                    }
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
            if (user) {
                // Link account if user is already logged in
                const { error } = await supabase.auth.linkIdentity({
                    provider: 'facebook',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        scopes: 'public_profile,email,pages_show_list,instagram_basic,instagram_manage_insights,pages_read_engagement',
                    }
                });
                if (error) throw error;
            } else {
                // Normal sign in (shouldn't happen with current UI restrictions)
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'facebook',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        scopes: 'public_profile,email,pages_show_list,instagram_basic,instagram_manage_insights,pages_read_engagement',
                    }
                });
                if (error) throw error;
            }
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
