import React from 'react';
import { UserPlus, Play, Home, Zap, ExternalLink } from 'lucide-react';
import { DonutChart } from '../charts/DonutChart';
import { motion } from 'framer-motion';

interface SubscriptionSectionProps {
    data: { source: string; subscribers: number; percentage: number }[];
    loading?: boolean;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
    data,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-pink-400" />
                    Subscription Sources
                </h2>
                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 h-96 animate-pulse" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return null;
    }

    // Source icons
    const sourceIcons: Record<string, React.ReactNode> = {
        watch_page: <Play className="w-5 h-5" />,
        channel_page: <Home className="w-5 h-5" />,
        shorts: <Zap className="w-5 h-5" />,
        external: <ExternalLink className="w-5 h-5" />
    };

    // Source colors
    const sourceColors: Record<string, string> = {
        watch_page: '#3b82f6',
        channel_page: '#8b5cf6',
        shorts: '#ec4899',
        external: '#f59e0b'
    };

    const sourceBgClasses: Record<string, string> = {
        watch_page: 'bg-blue-500/20',
        channel_page: 'bg-purple-500/20',
        shorts: 'bg-pink-500/20',
        external: 'bg-amber-500/20'
    };

    const sourceTextClasses: Record<string, string> = {
        watch_page: 'text-blue-400',
        channel_page: 'text-purple-400',
        shorts: 'text-pink-400',
        external: 'text-amber-400'
    };

    // Transform data for donut chart
    const chartData = data.map(item => ({
        label: formatSourceName(item.source),
        value: item.percentage,
        color: sourceColors[item.source] || '#6366f1'
    }));

    const totalSubscribers = data.reduce((sum, item) => sum + item.subscribers, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-pink-400" />
                Subscription Sources
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
                        title="Where Subscribers Come From"
                        centerLabel={totalSubscribers.toLocaleString()}
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
                    {data.map((item, index) => (
                        <motion.div
                            key={item.source}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            className="bg-[#12141a] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className={`p-2 rounded-lg ${sourceBgClasses[item.source] || 'bg-white/10'}`}
                                >
                                    <div className={sourceTextClasses[item.source] || 'text-white'}>
                                        {sourceIcons[item.source] || <UserPlus className="w-5 h-5" />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">
                                        {formatSourceName(item.source)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {item.percentage}% of total
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">
                                    +{item.subscribers.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-400">subscribers</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-linear-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-4"
            >
                <p className="text-sm text-pink-300">
                    <strong>Tip:</strong> Focus on optimizing the sources that bring the most subscribers.
                    {data[0] && ` Your top source is ${formatSourceName(data[0].source)}.`}
                </p>
            </motion.div>
        </div>
    );
};

function formatSourceName(source: string): string {
    const names: Record<string, string> = {
        watch_page: 'Video Watch Page',
        channel_page: 'Channel Page',
        shorts: 'YouTube Shorts',
        external: 'External Sources'
    };
    return names[source] || source;
}
