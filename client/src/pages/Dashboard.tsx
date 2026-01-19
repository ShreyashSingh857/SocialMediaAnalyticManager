import { useAuth } from '../contexts/AuthContext';
import { useYouTubeData } from '../hooks/useYouTubeData';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { RefreshIndicator } from '../components/RefreshIndicator';
import { motion } from 'framer-motion';
import {
    MoreHorizontal,
    MapPin
} from 'lucide-react';
import { TrendyContent } from '../components/dashboard/TrendyContent';

const Dashboard = () => {
    const { profile } = useAuth();
    const { overview, loading, refetch } = useYouTubeData();

    // Show skeleton during loading
    if (loading) {
        return <DashboardSkeleton />;
    }

    const stats = [
        {
            label: "Subscribers",
            value: overview?.subscriberCount ? parseInt(overview.subscriberCount).toLocaleString() : "0",
            change: "+0%",
            neutral: true
        },
        {
            label: "Views",
            value: overview?.totalViews ? parseInt(overview.totalViews).toLocaleString() : "0",
            change: "+0%",
            neutral: true
        },
        {
            label: "Videos",
            value: overview?.videoCount ? parseInt(overview.videoCount).toLocaleString() : "0",
            change: "+0%",
            neutral: true
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Greeting Header */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex justify-between items-end"
            >
                <div>
                    <h1 className="text-4xl font-bold mb-2">
                        Hello, <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{profile?.full_name?.split(' ')[0] || 'Creator'}</span>
                    </h1>
                    <p className="text-gray-400">Here's what's happening with your content today.</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2">
                    <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <RefreshIndicator
                        isRefreshing={loading}
                        lastUpdated={new Date()}
                        onRefresh={refetch}
                    />
                </div>
            </motion.header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-400 text-sm">{stat.label}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${stat.neutral ? 'bg-gray-500/10 text-gray-400' : 'bg-green-500/10 text-green-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-3xl font-bold">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Column (Analytics) */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Analytics Chart Placeholder */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/5 min-h-[300px]"
                    >
                        <h2 className="text-xl font-semibold mb-6">Performance Overview</h2>
                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-xl text-gray-500">
                            Chart Component Placeholder
                        </div>
                    </motion.div>
                </div>

                {/* Right Column (Sidebar Widgets) */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md h-fit"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold">My Profile</h3>
                            <button className="text-gray-400 hover:text-white" title="More options"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-900 overflow-hidden mb-4 shadow-xl">
                                <img
                                    src={profile?.profile_photo_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`}
                                    alt={profile?.full_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h4 className="text-xl font-bold">{profile?.full_name}</h4>
                            <p className="text-sm text-gray-400">{profile?.content_type} Creator</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20">
                                <MapPin className="w-5 h-5 text-blue-400" />
                                <span className="text-sm">{profile?.location || 'Location not set'}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h5 className="text-sm font-medium mb-2 text-gray-400">Bio</h5>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {profile?.description || "No description provided."}
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Trendy Content Widget (Full Width) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
            >
                <TrendyContent />
            </motion.div>
        </div>
    );
};

export default Dashboard;
