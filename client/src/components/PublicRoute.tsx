import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-white">Loading...</div>;
    }

    return !user ? <Outlet /> : <Navigate to="/profile-setup" replace />;
};

export default PublicRoute;
