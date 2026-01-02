import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = () => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white">Loading...</div>;
    }

    if (user) {
        // If user is logged in...
        if (profile) {
            // ...and has a profile, go to Dashboard
            return <Navigate to="/" replace />;
        } else {
            // ...and has NO profile, go to Profile Setup
            return <Navigate to="/profile-setup" replace />;
        }
    }

    // Not logged in -> Allow access to public route (Login/Signup)
    return <Outlet />;
};

export default PublicRoute;
