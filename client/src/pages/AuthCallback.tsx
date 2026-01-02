
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // The AuthContext listener handles the session update.
        // We just need to give the supabase client a moment to process the hash.
        // Then we can redirect to home, where the AuthGuard will take over.

        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Error during auth callback:", error);
                // Optionally handle error UI here
                navigate('/login');
            } else if (session) {
                // Session is active, redirect to home (dashboard/profile setup)
                navigate('/');
            } else {
                // No session found? Maybe hash parsing failed or improper redirect.
                // Just go home and let guards decide.
                navigate('/');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white">
            <div className="text-center">
                <p className="text-xl mb-2">Verifying authentication...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
        </div>
    );
};

export default AuthCallback;
