
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<string>("Initializing auth callback...");

    useEffect(() => {
        const handleAuthCallback = async () => {
            // 1. If we already have a user from Context, we show it
            if (user) {
                setStatus("User verified in Context! (Ready)");
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
                    setStatus("Session found in Supabase! Waiting for Context sync...");
                } else {
                    setStatus("No session found in Supabase.");
                }
            } catch (err: any) {
                setStatus(`Exception: ${err.message}`);
            }
        };

        handleAuthCallback();
    }, [navigate, user, authLoading]);

    return (
        <div className="min-h-screen bg-[#0f1014] flex flex-col items-center justify-center text-white p-4">
            <div className="text-center max-w-lg">
                <p className="text-xl mb-4 font-semibold">Authentication Debugger</p>

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
