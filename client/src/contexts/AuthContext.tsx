
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
                                const { error } = await supabase
                                    .from('profiles')
                                    .update({ youtube_stats: stats })
                                    .eq('id', session.user.id);

                                if (error) console.error('Error updating profile with YouTube stats:', error);
                                else {
                                    console.log('YouTube stats updated successfully');
                                    // Refresh profile to show new stats
                                    fetchProfile(session.user.id);
                                }
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
                    scopes: 'https://www.googleapis.com/auth/youtube.readonly',
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
