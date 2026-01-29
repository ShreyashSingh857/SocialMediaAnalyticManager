import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useYouTubeData } from '../../hooks/useYouTubeData';
import { AnalyticsSkeleton } from '../../components/LoadingSkeleton';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { RefreshIndicator } from '../../components/RefreshIndicator';

export const AnalyticsLayout: React.FC = () => {
    const { user, profile } = useAuth();
    const { loading, error, overview, refetch } = useYouTubeData();
    const location = useLocation();

    if (!user) return <div className="p-8 text-white">Please log in to view analytics.</div>;

    if (loading) return <AnalyticsSkeleton />;

    if (error) {
        return (
            <div className="p-8 text-white min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-md text-center">
                    <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
                    <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <p className="text-xs text-gray-500">Ensure you have granted "YouTube Analytics" permissions.</p>
                </div>
            </div>
        );
    }

    const firstInitial = profile?.full_name ? profile.full_name[0] : 'C';

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-8 font-sans relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl font-bold border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            {firstInitial}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                {profile?.full_name || 'Creator'}
                            </h1>
                            <p className="text-gray-400 text-sm font-medium">Overview of your content performance</p>
                        </div>
                    </div>

                    {/* Sub-navigation Tabs */}
                    <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                        <TabLink to="/analytics/overview" label="Overview" isActive={location.pathname === '/analytics' || location.pathname === '/analytics/overview'} />
                        <TabLink to="/analytics/audience" label="Audience" isActive={location.pathname === '/analytics/audience'} />
                        <TabLink to="/analytics/content" label="Content" isActive={location.pathname === '/analytics/content'} />
                    </div>
                </header>

                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const TabLink = ({ to, label, isActive }: { to: string; label: string; isActive: boolean }) => (
    <NavLink
        to={to}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${isActive
            ? 'text-white bg-white/10 shadow-lg shadow-black/20'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
    >
        {label}
        {isActive && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-full"></span>
        )}
    </NavLink>
);
