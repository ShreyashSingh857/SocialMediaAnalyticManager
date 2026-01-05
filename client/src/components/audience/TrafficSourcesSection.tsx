import React from 'react';
import { TrendingUp, Search, Sparkles, Compass, ExternalLink, ArrowRight } from 'lucide-react';
import { DonutChart } from '../charts/DonutChart';
import { motion } from 'framer-motion';

interface TrafficSourcesSectionProps {
    data: { source: string; views: number; percentage: number }[];
    loading?: boolean;
}

export const TrafficSourcesSection: React.FC<TrafficSourcesSectionProps> = ({
    data,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                    Traffic Sources
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#12141a] p-6 rounded-2xl border border-white/5 h-96 animate-pulse" />
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 h-96 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return null;
    }

    // Source icons mapping
    const sourceIcons: Record<string, React.ReactNode> = {
        youtube_search: <Search className="w-5 h-5" />,
        suggested_videos: <Sparkles className="w-5 h-5" />,
        browse_features: <Compass className="w-5 h-5" />,
        external: <ExternalLink className="w-5 h-5" />,
        direct: <ArrowRight className="w-5 h-5" />,
        playlist: <TrendingUp className="w-5 h-5" />
    };

    // Source colors
    const sourceColors: Record<string, string> = {
        youtube_search: '#3b82f6',
        suggested_videos: '#8b5cf6',
        browse_features: '#ec4899',
        external: '#f59e0b',
        direct: '#10b981',
        playlist: '#06b6d4'
    };

    // Transform data for donut chart
    const chartData = data.map(item => ({
        label: formatSourceName(item.source),
        value: item.percentage,
        color: sourceColors[item.source] || '#6366f1'
    }));

    const totalViews = data.reduce((sum, item) => sum + item.views, 0);
    const topSource = data[0];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-400" />
                Traffic Sources
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2"
                >
                    <DonutChart
                        data={chartData}
                        title="How Viewers Find Your Content"
                        centerLabel={totalViews.toLocaleString()}
                        height={350}
                    />
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-orange-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-xs text-orange-300 uppercase tracking-wider">Top Source</p>
                                <p className="text-lg font-bold text-white">
                                    {formatSourceName(topSource.source)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                                {topSource.percentage}%
                            </span>
                            <span className="text-sm text-orange-300">of total views</span>
                        </div>
                    </div>

                    {data.slice(1, 4).map((item, index) => (
                        <motion.div
                            key={item.source}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            className="bg-[#12141a] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: `${sourceColors[item.source]}20` }}
                                >
                                    <div style={{ color: sourceColors[item.source] }}>
                                        {sourceIcons[item.source] || <TrendingUp className="w-5 h-5" />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">
                                        {formatSourceName(item.source)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {item.views.toLocaleString()} views
                                    </p>
                                </div>
                                <span className="text-lg font-bold text-white">
                                    {item.percentage}%
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.slice(0, 3).map((item, index) => (
                    <motion.div
                        key={item.source}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-[#12141a] p-5 rounded-xl border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="p-2.5 rounded-lg"
                                style={{ backgroundColor: `${sourceColors[item.source]}20` }}
                            >
                                <div style={{ color: sourceColors[item.source] }}>
                                    {sourceIcons[item.source] || <TrendingUp className="w-5 h-5" />}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 uppercase tracking-wider">
                                    {formatSourceName(item.source)}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-2xl font-bold text-white">
                                    {item.views.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-400">views</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: sourceColors[item.source]
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-400">
                                {item.percentage}% of total traffic
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Actionable Insights */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-5"
            >
                <h3 className="text-sm font-semibold text-orange-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Growth Opportunity
                </h3>
                <p className="text-sm text-orange-200">
                    {getTrafficInsight(topSource.source, topSource.percentage)}
                </p>
            </motion.div>
        </div>
    );
};

// Helper function to format source names
function formatSourceName(source: string): string {
    const names: Record<string, string> = {
        youtube_search: 'YouTube Search',
        suggested_videos: 'Suggested Videos',
        browse_features: 'Browse Features',
        external: 'External Sources',
        direct: 'Direct/Unknown',
        playlist: 'Playlists',
        channel_pages: 'Channel Pages',
        notifications: 'Notifications',
        other: 'Other Sources'
    };
    return names[source] || source.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Helper function to provide actionable insights
function getTrafficInsight(topSource: string, percentage: number): string {
    const insights: Record<string, string> = {
        youtube_search: `${percentage}% of your traffic comes from YouTube Search. Focus on SEO-optimized titles, descriptions, and tags to grow this further.`,
        suggested_videos: `${percentage}% of viewers find you through Suggested Videos. Create engaging thumbnails and compelling titles to increase click-through rates.`,
        browse_features: `${percentage}% comes from Browse Features (Home, Trending, Subscriptions). Consistent upload schedule helps maintain visibility here.`,
        external: `${percentage}% comes from External sources (Google, social media, websites). Consider expanding your presence on these platforms.`,
        direct: `${percentage}% is Direct traffic. Your audience is actively seeking your content - great brand recognition!`
    };
    return insights[topSource] || `Your top traffic source is ${formatSourceName(topSource)} at ${percentage}%. Optimize your strategy around this channel.`;
}
