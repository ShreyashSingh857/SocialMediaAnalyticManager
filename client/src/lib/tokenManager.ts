import { supabase } from './supabase';

type TokenSource = 'session' | 'stored' | null;

type StoredTokenRow = {
    access_token: string | null;
    refresh_token?: string | null;
    token_expires_at?: string | null;
};

// Allow up to 60 seconds of clock skew to handle device time mismatches
const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

const fetchLatestTokenForPlatform = async (userId: string, platform: string): Promise<StoredTokenRow | null> => {
    const { data, error } = await supabase
        .from('connected_accounts')
        .select('access_token, refresh_token, token_expires_at, last_synced_at, created_at')
        .eq('user_id', userId)
        .eq('platform', platform)
        .order('last_synced_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error(`Failed to fetch stored token for ${platform}`, error);
        return null;
    }

    return data ?? null;
};

const isGoogleAccessToken = (token?: string | null) => Boolean(token && token.startsWith('ya29'));

// Suppress Supabase clock skew warning if within tolerance
const suppressClockSkewWarning = () => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    return {
        warn: function(...args: any[]) {
            const message = args.join(' ');
            // Suppress the specific clock skew warning from Supabase
            if (message.includes('Session as retrieved from URL was issued in the future')) {
                const timestamps = message.match(/\d+/g);
                if (timestamps && timestamps.length >= 3) {
                    const issuedTime = parseInt(timestamps[0]);
                    const expiresTime = parseInt(timestamps[1]);
                    const currentTime = parseInt(timestamps[2]);
                    
                    const skewMs = (issuedTime - currentTime) * 1000;
                    if (Math.abs(skewMs) <= CLOCK_SKEW_TOLERANCE_MS) {
                        // Clock skew within tolerance, don't warn
                        return;
                    }
                }
            }
            originalConsoleWarn(...args);
        },
        error: originalConsoleError
    };
};

// Apply the wrapper
const consoleWrapper = suppressClockSkewWarning();
if (typeof window !== 'undefined') {
    window.console.warn = consoleWrapper.warn.bind(consoleWrapper);
}

export const resolveGoogleTokens = async (
    userId: string,
    sessionAccessToken?: string | null,
    sessionRefreshToken?: string | null
): Promise<{ accessToken: string | null; refreshToken: string | null; source: TokenSource }> => {
    if (isGoogleAccessToken(sessionAccessToken)) {
        return {
            accessToken: sessionAccessToken as string,
            refreshToken: sessionRefreshToken ?? null,
            source: 'session'
        };
    }

    const stored = await fetchLatestTokenForPlatform(userId, 'youtube');
    if (stored?.access_token) {
        return {
            accessToken: stored.access_token,
            refreshToken: stored.refresh_token ?? null,
            source: 'stored'
        };
    }

    return { accessToken: null, refreshToken: null, source: null };
};
