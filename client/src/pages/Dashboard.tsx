
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Settings,
    TrendingUp,
    Users,
    MapPin,
    LogOut,
    Instagram,
    MoreHorizontal
} from 'lucide-react';

const Dashboard = () => {
    const { profile, signOut } = useAuth();

    const stats = [
        {
            label: "Subscribers",
            value: profile?.youtube_stats?.subscribers ? parseInt(profile.youtube_stats.subscribers).toLocaleString() : "0",
            change: "+0%",
            neutral: true
        },
        {
            label: "Views",
            value: profile?.youtube_stats?.views ? parseInt(profile.youtube_stats.views).toLocaleString() : "0",
            change: "+0%",
            neutral: true
        },
        {
            label: "Videos",
            value: profile?.youtube_stats?.videos ? parseInt(profile.youtube_stats.videos).toLocaleString() : "0",
            change: "+0%",
            neutral: true
        },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 border-r border-white/5 bg-slate-900/20 backdrop-blur-xl fixed h-full z-10 flex flex-col hidden md:flex">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">SM</div>
                    <span className="font-bold text-lg hidden lg:block tracking-tight">SocialMgr</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-8">
                    <NavItem icon={LayoutDashboard} label="Dashboard" active />
                    <NavItem icon={TrendingUp} label="Analytics" />
                    <NavItem icon={Users} label="Audience" />
                    <NavItem icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors p-2 w-full rounded-lg hover:bg-white/5"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:block">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Visible only on small screens) */}
            <div className="md:hidden fixed top-0 w-full bg-slate-900/50 backdrop-blur-xl border-b border-white/5 z-10 p-4 flex justify-between items-center">
                <div className="font-bold text-lg">SocialMgr</div>
                <button onClick={signOut}><LogOut className="w-5 h-5" /></button>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-20 lg:ml-64 p-8 pt-20 md:pt-8 max-w-7xl mx-auto">

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
                    <div className="hidden sm:block">
                        <div className="text-right">
                            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Profile & Details) */}
                    <div className="lg:col-span-2 space-y-8">
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

                    {/* Right Column (Profile Card) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md h-fit"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold">My Profile</h3>
                            <button className="text-gray-400 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
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
                                <Instagram className="w-5 h-5 text-purple-400" />
                                <span className="text-sm flex-1">{profile?.instagram || '@username'}</span>
                                <span className="text-xs text-blue-400 cursor-pointer">Link</span>
                            </div>
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
            </main>
        </div>
    );
};

const NavItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <Icon className="w-5 h-5" />
        <span className="hidden lg:block font-medium">{label}</span>
    </button>
);

export default Dashboard;
