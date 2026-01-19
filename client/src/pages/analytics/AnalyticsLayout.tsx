import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useYouTubeData } from '../../hooks/useYouTubeData';
import { AnalyticsSkeleton } from '../../components/LoadingSkeleton';
import { AlertTriangle } from 'lucide-react';

export const AnalyticsLayout: React.FC = () => {
    const { user } = useAuth();
    const { loading, error, overview } = useYouTubeData();
    const location = useLocation();

    if (!user) return <div className="p-8 text-white">Please log in to view analytics.</div>;

    if (loading) return <AnalyticsSkeleton />;

    if (error) {
        return (
            <div className="p-8 text-white min-h-screen bg-[#0f1014] flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-md text-center">
                    <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
                    <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <p className="text-xs text-gray-500">Ensure you have granted "YouTube Analytics" permissions.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            <header>
                <div className="flex items-center space-x-3 mb-6">
                    {overview?.thumbnailUrl && (
                        <img src={overview.thumbnailUrl} alt="Channel" className="w-10 h-10 rounded-full border border-gray-700" />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {overview?.channelName || 'Channel Analytics'}
                        </h1>
                        <p className="text-gray-500 text-sm">Overview of your content performance</p>
                    </div>
                </div>

                {/* Sub-navigation Tabs */}
                <div className="flex space-x-2 border-b border-white/10 pb-1">
                    <TabLink to="/analytics/overview" label="Overview" isActive={location.pathname === '/analytics' || location.pathname === '/analytics/overview'} />
                    <TabLink to="/analytics/audience" label="Audience" isActive={location.pathname === '/analytics/audience'} />
                    <TabLink to="/analytics/content" label="Content" isActive={location.pathname === '/analytics/content'} />
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
};

const TabLink = ({ to, label, isActive }: { to: string; label: string; isActive: boolean }) => (
    <NavLink
        to={to}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${isActive
            ? 'border-blue-500 text-blue-400'
            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
            }`}
    >
        {label}
    </NavLink>
);
