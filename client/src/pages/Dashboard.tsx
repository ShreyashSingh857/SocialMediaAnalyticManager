import { useAuth } from '../contexts/AuthContext';
import { useYouTubeData } from '../hooks/useYouTubeData';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { motion } from 'framer-motion';
import {
    MoreHorizontal,
    MapPin,
    RefreshCcw,
    TrendingUp,
    Calendar
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
            change: "+0%"
        },
        {
            label: "Views",
            value: overview?.totalViews ? parseInt(overview.totalViews).toLocaleString() : "0",
            change: "+0%"
        },
        {
            label: "Videos",
            value: overview?.videoCount ? parseInt(overview.videoCount).toLocaleString() : "0",
            change: "+0%"
        },
    ];

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-8 font-sans relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-br from-blue-900/10 via-purple-900/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">
                            Hello, <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">{profile?.full_name?.split(' ')[0] || 'Creator'}</span>
                        </h1>
                        <p className="text-gray-400 font-medium">Here's what's happening with your content today.</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-right">
                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                            <Calendar size={14} />
                            <span>{currentDate}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-medium">Last updated: Just now</span>
                            <button
                                onClick={refetch}
                                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all active:scale-95"
                                title="Refresh Data"
                            >
                                <RefreshCcw size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Top Stat Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative p-6 rounded-2xl bg-white/3 border border-white/10 backdrop-blur-sm shadow-xl hover:-translate-y-1 hover:bg-white/5 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight group-hover:text-cyan-50 transition-colors">
                                {stat.value}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Middle Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Performance Overview (Left - 2/3 width) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 p-6 rounded-2xl bg-white/3 border border-white/10 backdrop-blur-sm shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <TrendingUp className="text-cyan-400 w-5 h-5" />
                                Performance Overview
                            </h2>
                            {/* Optional Period Selector could go here */}
                        </div>

                        {/* Dashed Chart Placeholder */}
                        <div className="w-full h-80 rounded-xl border-2 border-dashed border-white/10 bg-white/1 flex flex-col items-center justify-center text-gray-500 gap-3 hover:border-white/20 transition-colors cursor-default group">
                            <div className="p-4 rounded-full bg-white/5 text-white/20 group-hover:text-cyan-400/50 group-hover:bg-cyan-400/10 transition-all">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-medium">Analytics Chart Placeholder</span>
                        </div>
                    </motion.div>

                    {/* My Profile (Right - 1/3 width) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-2xl bg-linear-to-b from-white/6 to-white/2 border border-white/10 backdrop-blur-md flex flex-col items-center text-center shadow-xl h-fit"
                    >
                        <div className="w-full flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">My Profile</span>
                            <button className="text-gray-500 hover:text-white transition-colors" aria-label="Profile options">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        {/* Avatar */}
                        <div className="relative mb-4 mt-2 group">
                            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                            <img
                                src={profile?.profile_photo_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`}
                                alt={profile?.full_name}
                                className="relative w-24 h-24 rounded-full object-cover border-4 border-[#0a0a0a] ring-2 ring-white/10 shadow-2xl"
                            />
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-[#0a0a0a] rounded-full"></div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{profile?.full_name}</h3>
                        <p className="text-sm text-cyan-400 font-medium mb-4">{profile?.content_type ? `${profile.content_type} Creator` : 'Content Creator'}</p>

                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <MapPin size={14} className="text-gray-500" />
                            <span>{profile?.location || 'Location not set'}</span>
                        </div>

                        <div className="w-full bg-[#0a0a0a]/50 p-4 rounded-xl border border-white/5 text-left">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">About</div>
                            <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                                {profile?.description || "No bio added yet. Go to settings to update your profile details."}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Section - Trending */}
                <div className="pt-4">
                    <TrendyContent />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
