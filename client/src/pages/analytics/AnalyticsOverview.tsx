import React, { useState } from 'react';
import { AnalyticsChart } from '../../components/AnalyticsChart';
import { Users, Play, Video, TrendingUp } from 'lucide-react';
import { useYouTubeData } from '../../hooks/useYouTubeData';

type MetricType = 'views' | 'watchTime' | 'subs';

export const AnalyticsOverview: React.FC = () => {
    const { overview, history, topVideos } = useYouTubeData();
    const [activeMetric, setActiveMetric] = useState<MetricType>('views');

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
                    color: '#22d3ee', // Cyan
                    formatter: (val: number) => new Intl.NumberFormat('en', { notation: "compact" }).format(val)
                };
        }
    };

    const chartConfig = getChartConfig();

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Total Views"
                    value={overview ? parseInt(overview.totalViews).toLocaleString() : '0'}
                    icon={<Play size={18} className="text-cyan-400" />}
                    label="Lifetime"
                />
                <KPICard
                    title="Subscribers"
                    value={overview ? parseInt(overview.subscriberCount).toLocaleString() : '0'}
                    icon={<Users size={18} className="text-purple-400" />}
                    label="Lifetime"
                />
                <KPICard
                    title="Total Videos"
                    value={overview ? parseInt(overview.videoCount).toLocaleString() : '0'}
                    icon={<Video size={18} className="text-green-400" />}
                    label="Lifetime"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph Section */}
                <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="text-cyan-400 w-5 h-5" />
                            Performance Trends
                        </h2>
                        {/* Metric Selection Tabs */}
                        <div className="flex space-x-1 bg-black/40 p-1 rounded-lg border border-white/5">
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
                    </div>

                    <div className="min-w-0 h-[350px]">
                        <AnalyticsChart
                            title={`${chartConfig.title} (Last 30 Days)`}
                            data={chartConfig.data}
                            color={chartConfig.color}
                            valueFormatter={chartConfig.formatter}
                        />
                    </div>
                </div>

                {/* Top Videos Side Panel (Empty State as requested) */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-6">Top Performing Content</h2>
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-500">
                            <Video className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="text-gray-400 font-medium mb-2">No Content Data</h3>
                        <p className="text-sm text-gray-600">Sync your channel to see your top performing videos ranked here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Sub-components
const KPICard = ({ title, value, icon, label }: any) => (
    <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors shadow-inner">{icon}</div>
        </div>
        <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white tracking-tight group-hover:text-cyan-50 transition-colors">{value}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">{label}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${active
            ? 'bg-white/10 text-cyan-400 shadow-sm border border-white/10'
            : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
    >
        {label}
    </button>
);
