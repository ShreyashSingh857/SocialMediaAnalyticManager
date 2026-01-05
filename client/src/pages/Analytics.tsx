import React, { useState } from 'react';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { VideoPerformanceList } from '../components/VideoPerformanceList';
import { useAuth } from '../contexts/AuthContext';
import { Users, Play, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useYouTubeData, type DailyMetric } from '../hooks/useYouTubeData';

type MetricType = 'views' | 'watchTime' | 'subs';

export const Analytics: React.FC = () => {
    const { user } = useAuth();
    const { loading, error, overview, history, topVideos, insights } = useYouTubeData();
    const [activeMetric, setActiveMetric] = useState<MetricType>('views');

    if (!user) return <div className="p-8 text-white">Please log in to view analytics.</div>;
    if (loading) return <div className="p-8 text-white">Loading channel data...</div>;

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

    // Prepare chart data based on active metric
    const getChartConfig = () => {
        switch (activeMetric) {
            case 'watchTime':
                return {
                    title: 'Watch Time (Hours)',
                    data: history.map(h => ({ date: h.date, value: h.watchTimeHours })),
                    color: '#f97316', // Orange
                    formatter: (val: number) => `${val} hrs`
                };
            case 'subs':
                return {
                    title: 'Subscribers Gained',
                    data: history.map(h => ({ date: h.date, value: h.subscribersGained })),
                    color: '#a855f7', // Purple
                    formatter: (val: number) => `${val} subs`
                };
            case 'views':
            default:
                return {
                    title: 'Views',
                    data: history.map(h => ({ date: h.date, value: h.views })),
                    color: '#3b82f6', // Blue
                    formatter: (val: number) => new Intl.NumberFormat('en', { notation: "compact" }).format(val)
                };
        }
    };

    const chartConfig = getChartConfig();

    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            <header>
                <div className="flex items-center space-x-3">
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
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                    title="Total Views"
                    value={overview ? parseInt(overview.totalViews).toLocaleString() : '0'}
                    icon={<Play size={20} className="text-blue-400" />}
                    label="Lifetime"
                />
                <KPICard
                    title="Subscribers"
                    value={overview ? parseInt(overview.subscriberCount).toLocaleString() : '0'}
                    icon={<Users size={20} className="text-purple-400" />}
                    label="Lifetime"
                />
                <KPICard
                    title="Total Videos"
                    value={overview ? parseInt(overview.videoCount).toLocaleString() : '0'}
                    icon={<TrendingUp size={20} className="text-green-400" />}
                    label="Lifetime"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Graph Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Metric Selection Tabs */}
                    <div className="flex space-x-2 bg-[#12141a] p-1.5 rounded-lg border border-white/5 w-fit">
                        <TabButton
                            active={activeMetric === 'views'}
                            onClick={() => setActiveMetric('views')}
                            label="Views"
                        />
                        <TabButton
                            active={activeMetric === 'watchTime'}
                            onClick={() => setActiveMetric('watchTime')}
                            label="Watch Time"
                        />
                        <TabButton
                            active={activeMetric === 'subs'}
                            onClick={() => setActiveMetric('subs')}
                            label="Subscribers"
                        />
                    </div>

                    <div className="min-w-0">
                        <AnalyticsChart
                            title={`${chartConfig.title} (Last 30 Days)`}
                            data={chartConfig.data}
                            color={chartConfig.color}
                            valueFormatter={chartConfig.formatter}
                        />
                    </div>

                    {/* AI Insights Section */}
                    {insights && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {/* Growth Card */}
                            <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <TrendingUp size={100} className="text-blue-500" />
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium mb-4">Growth Momentum</h3>
                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-3xl font-bold ${(insights.weeklyTrend?.summary.momentum_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {insights.weeklyTrend?.summary.momentum_percent || 0}%
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase">Week-over-Week</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Slope: <span className="text-white">{insights.weeklyTrend?.summary.trend_slope}</span>
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Peak: <span className="text-white">{insights.weeklyTrend?.summary.peak_views.toLocaleString()}</span> views
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quality Card */}
                            <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Clock size={100} className="text-purple-500" />
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium mb-4">Content Quality</h3>
                                <div className="relative z-10 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-2xl font-bold text-white mb-1">
                                            {insights.weeklyTrend?.summary.avd_minutes}m
                                        </div>
                                        <p className="text-xs text-gray-500">Avg View Duration</p>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white mb-1">
                                            {insights.weeklyTrend?.summary.sub_conversion_rate}%
                                        </div>
                                        <p className="text-xs text-gray-500">Sub Conversion</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-white/5">
                                        <div className="text-xl font-bold text-white mb-1">
                                            {insights.engagement?.average_engagement_rate}%
                                        </div>
                                        <p className="text-xs text-gray-500">Avg Engagement Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Videos Side Panel */}
                <div>
                    <VideoPerformanceList videos={topVideos} />
                </div>
            </div>
        </div>
    );
};

// Internal Sub-components
const KPICard = ({ title, value, icon, label }: any) => (
    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        </div>
        <div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-600 mt-1">{label}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${active
            ? 'bg-white/10 text-white shadow-sm'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        {label}
    </button>
);
