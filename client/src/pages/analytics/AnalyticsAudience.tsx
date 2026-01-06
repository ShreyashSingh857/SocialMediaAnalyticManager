import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { useYouTubeData } from '../../hooks/useYouTubeData';
import { useAudienceData } from '../../hooks/useAudienceData';

// Audience Components
import { DemographicsSection } from '../../components/audience/DemographicsSection';
import { GeographySection } from '../../components/audience/GeographySection';
import { DevicePlatformSection } from '../../components/audience/DevicePlatformSection';
import { SubscriptionSection } from '../../components/audience/SubscriptionSection';
import { TrafficSourcesSection } from '../../components/audience/TrafficSourcesSection';
import { RefreshIndicator } from '../../components/RefreshIndicator';

export const AnalyticsAudience: React.FC = () => {
    const { insights, loading: ytLoading } = useYouTubeData();
    const {
        loading: audLoading,
        error: audError,
        demographics,
        geography,
        devices,
        platforms,
        subscriptionSources,
        trafficSources,
        refetch
    } = useAudienceData();

    const loading = ytLoading || audLoading;

    if (audError) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-4">{audError}</p>
                <button onClick={refetch} className="text-red-400 hover:text-red-300 text-sm underline">Try Again</button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header / Refresh Status */}
            <div className="flex justify-end">
                <RefreshIndicator
                    isRefreshing={loading}
                    lastUpdated={new Date()}
                    onRefresh={refetch}
                />
            </div>

            {/* Growth & Habits Section (From Analytics) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Growth Card */}
                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp size={100} className="text-blue-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-4">Growth Momentum</h3>
                    {insights ? (
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
                    ) : (
                        <div className="text-gray-500 text-sm">Loading growth data...</div>
                    )}
                </div>

                {/* Day of Week Chart */}
                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                    <h3 className="text-gray-400 text-sm font-medium mb-4">Best Day to Post</h3>
                    <div className="h-64">
                        {insights?.weeklyTrend?.day_of_week_analysis ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={insights.weeklyTrend.day_of_week_analysis}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="day_name"
                                        stroke="#666"
                                        tick={{ fill: '#666', fontSize: 10 }}
                                        tickFormatter={(val) => val.substring(0, 3)}
                                    />
                                    <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1d24', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                        {insights.weeklyTrend.day_of_week_analysis.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.views === Math.max(...(insights?.weeklyTrend?.day_of_week_analysis?.map(d => d.views) || [])) ? '#a855f7' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading chart...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Deep Audience Insights (From Legacy Audience Page) */}

            <DemographicsSection data={demographics} loading={loading} />

            <GeographySection data={geography} loading={loading} />

            <TrafficSourcesSection data={trafficSources} loading={loading} />

            <DevicePlatformSection
                devices={devices}
                platforms={platforms}
                loading={loading}
            />

            <SubscriptionSection data={subscriptionSources} loading={loading} />
        </div>
    );
};
