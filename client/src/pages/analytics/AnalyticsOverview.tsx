import React, { useState } from 'react';
import { AnalyticsChart } from '../../components/AnalyticsChart';
import { VideoPerformanceList } from '../../components/VideoPerformanceList';
import { Users, Play, TrendingUp } from 'lucide-react';
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
                    color: '#3b82f6', // Blue
                    formatter: (val: number) => new Intl.NumberFormat('en', { notation: "compact" }).format(val)
                };
        }
    };

    const chartConfig = getChartConfig();

    return (
        <div className="space-y-8">
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
