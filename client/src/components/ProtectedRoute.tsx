import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white">Loading...</div>;
    }

    // 1. Not logged in -> Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Logged in, but no profile -> Profile Setup (prevent infinite loop if already there)
    // We check if we are NOT already at /profile-setup to avoid loop
    if (!profile && location.pathname !== '/profile-setup') {
        return <Navigate to="/profile-setup" replace />;
    }

    // 3. Logged in, has profile (or is at profile setup, which is allowed for logged in users, though Setup page itself might redirect if done)
    return <Outlet />;
};

export default ProtectedRoute;
