
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<string>("Initializing auth callback...");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        console.log('🔍 Full callback URL:', window.location.href);
        
        // Build URLSearchParams from both search and hash
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash.substring(1); // remove #
        const hashParams = new URLSearchParams(hash);
        
        console.log('🔍 Hash params:', Object.fromEntries(hashParams.entries()));
        console.log('🔍 Query params:', Object.fromEntries(params.entries()));
        
        const error = params.get('error') || hashParams.get('error');
        const errorDescription = params.get('error_description') || hashParams.get('error_description');

        if (error) {
            let userFriendlyError = errorDescription;
            if (errorDescription?.includes('getting user email')) {
                userFriendlyError = "Facebook did not return an email address. This usually happens if your Facebook account has no verified email, or if the Facebook App is in 'Development Mode' and you are not added as a Tester.";
            }
            setStatus("Authentication Failed");
            setErrorMsg(userFriendlyError || "Unknown error occurred during login.");
            return;
        }

        // Capture provider token from URL hash (for linkIdentity flow)
        const providerToken = hashParams.get('provider_token');
        const allHashKeys = Array.from(hashParams.keys()).join(', ');
        const debugInfo = `
🔍 OAUTH CALLBACK DEBUG:
- Full URL: ${window.location.href}
- Hash keys: ${allHashKeys || 'NONE'}
- Provider token: ${providerToken ? providerToken.substring(0, 30) + '...' : 'NULL'}
- Is Facebook token: ${providerToken ? (providerToken.startsWith('EAA') || providerToken.startsWith('IGQAZ') || providerToken.startsWith('IG')) : 'N/A'}
        `;
        
        console.log(debugInfo);
        
        // Store debug info temporarily
        try {
            window.localStorage.setItem('last_oauth_debug', debugInfo);
        } catch (e) {
            // ignore
        }
        
        console.log('🎫 Provider token from URL:', providerToken ? providerToken.substring(0, 30) + '...' : 'NULL');
        
        if (providerToken && (providerToken.startsWith('EAA') || providerToken.startsWith('IGQAZ') || providerToken.startsWith('IG'))) {
            try {
                window.localStorage.setItem('fb_access_token', providerToken);
                window.localStorage.setItem('pending_facebook_link', '1');
                console.log('✅ Captured Facebook token from callback URL:', providerToken.substring(0, 20) + '...');
            } catch (e) {
                console.error('❌ Failed to store Facebook token from callback', e);
            }
        } else {
            console.warn('⚠️ No valid Facebook provider token found in callback URL');
        }

        const handleAuthCallback = async () => {
            // 1. If we already have a user from Context, we redirect
            if (user) {
                setStatus("User verified! Redirecting...");
                setTimeout(() => navigate('/'), 1000);
                return;
            }

            // 2. If Context is still loading...
            if (authLoading) {
                setStatus("Waiting for auth context to load...");
                return;
            }

            // 3. Check Supabase directly
            setStatus("Checking Supabase session...");
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error during auth callback:", error);
                    setStatus(`Supabase Error: ${error.message}`);
                } else if (session) {
                    setStatus("Session found in Supabase! syncing...");
                    // The AuthContext listener should pick this up and set 'user', triggering the redirect in block #1
                } else {
                    // Sometimes Supabase takes a moment to persist the session from the hash fragment
                    // check if we have access_token in hash
                    const accessToken = hashParams.get('access_token');
                    if (accessToken) {
                         setStatus("Processing token...");
                    } else {
                         setStatus("No session found. Please try logging in again.");
                    }
                }
            } catch (err: any) {
                setStatus(`Exception: ${err.message}`);
            }
        };

        handleAuthCallback();
    }, [navigate, user, authLoading]);

    return (
        <div className="min-h-screen bg-[#0f1014] flex flex-col items-center justify-center text-white p-4">
            <div className="text-center max-w-lg w-full">
                <p className="text-xl mb-4 font-semibold">Authentication Status</p>

                {errorMsg && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6 text-left">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><span className="text-xl">⚠️</span> Login Failed</h3>
                        <p>{errorMsg}</p>
                    </div>
                )}
                
                <div className="bg-gray-900 p-4 rounded-lg mb-6 text-left font-mono text-xs overflow-auto max-h-60 border border-gray-700">
                    <div>Status: <span className="text-white">{status}</span></div>
                    <div className="mt-2 text-blue-400">AuthContext User: <span className="text-white">{user ? "Logged In" : "Null"}</span></div>
                    <div className="text-yellow-400">AuthContext Loading: <span className="text-white">{authLoading ? "True" : "False"}</span></div>
                    <div className="mt-2 pt-2 border-t border-gray-700 text-gray-500 break-all">
                        URL: {window.location.href}
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
                    >
                        Back to Login
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
