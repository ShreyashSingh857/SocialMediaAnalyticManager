
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { resolveGoogleTokens } from '../lib/tokenManager';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    unlinkIdentity: (provider: 'google') => Promise<void>;
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
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔐 Auth Event:', event);
            console.log('📋 Session:', session);
            console.log('🎫 Provider Token:', session?.provider_token);
            console.log('🔄 Provider Refresh Token:', session?.provider_refresh_token);
      console.log('👥 User Identities:', session?.user?.identities);
      console.log('🔍 Identity Count:', session?.user?.identities?.length);
            
            // Display OAuth callback debug if available
            const oauthDebug = localStorage.getItem('last_oauth_debug');
            if (oauthDebug) {
                console.log('📱 LAST OAUTH CALLBACK:\n' + oauthDebug);
                localStorage.removeItem('last_oauth_debug'); // Clear after displaying
            }
            
            if (session?.provider_token) {
                const token = session.provider_token;
                const provider = session.user?.app_metadata?.provider;
                console.log('✅ Got provider token:', token.substring(0, 20) + '...', 'from provider:', provider);
            } else {
                console.warn('⚠️ No provider_token in session for event:', event);
            }

            // Fetch profile and set loading to false immediately
            if (session?.user) {
                // Return the promise so we can chain if needed, but primarily to ensure state updates
                fetchProfile(session.user.id).then(() => setLoading(false));
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => authListener.subscription.unsubscribe();
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

    const unlinkIdentity = async (provider: 'google') => {
        console.log(`🔓 Unlinking ${provider} identity...`);
        
        try {
            // Find the identity to unlink
            const identity = user?.identities?.find((id: any) => id.provider === provider);
            
            if (!identity) {
                console.warn(`No ${provider} identity found to unlink`);
                return;
            }
            
            const { error } = await supabase.auth.unlinkIdentity(identity);
            if (error) {
                console.error(`Failed to unlink ${provider}:`, error);
                throw error;
            }

            console.log(`✅ Successfully unlinked ${provider}`);

            // Refresh auth state so UI updates immediately
            const { data: refreshed } = await supabase.auth.getUser();
            setUser(refreshed.user);
            setSession(prev => ({ ...prev, user: refreshed.user } as any));
        } catch (error: any) {
            console.error(`Error unlinking ${provider}:`, error);
            throw error;
        }
    };
    const signOut = async () => {
        try {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (currentSession?.user?.id) {
                    const { accessToken } = await resolveGoogleTokens(
                        currentSession.user.id,
                        currentSession.provider_token,
                        currentSession.provider_refresh_token
                    );
                    if (accessToken) {
                        fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).catch(() => undefined);
                    }
                }
            } catch { /* ignore */ }

            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signInWithGoogle, unlinkIdentity, signOut }}>
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
