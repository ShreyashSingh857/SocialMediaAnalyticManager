import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Users, Calendar, MapPin, Monitor } from 'lucide-react';
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
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center backdrop-blur-sm">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-4">{audError}</p>
                <button onClick={refetch} className="text-red-400 hover:text-red-300 text-sm underline">Try Again</button>
            </div>
        );
    }

    const dayOfWeekAnalysis: { day_name: string; views: number }[] = insights?.weeklyTrend?.day_of_week_analysis ?? [];
    const maxDayViews = Math.max(...dayOfWeekAnalysis.map((d: { day_name: string; views: number }) => d.views), 0);

    return (
        <div className="space-y-8">
            {/* Header / Refresh Status */}
            <div className="flex justify-end items-center mb-6">
                <RefreshIndicator
                    isRefreshing={loading}
                    lastUpdated={new Date()}
                    onRefresh={refetch}
                />
            </div>

            {/* Growth & Habits Section (From Analytics) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Growth Card */}
                <div className="bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp size={100} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><TrendingUp size={18} /></div>
                        <h3 className="text-white font-semibold text-lg">Growth Momentum</h3>
                    </div>

                    {insights ? (
                        <div className="relative z-10 space-y-6 mt-4">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-bold tracking-tight ${(insights.weeklyTrend?.summary.momentum_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {insights.weeklyTrend?.summary.momentum_percent || 0}%
                                    </span>
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded">Week-over-Week</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Slope</p>
                                    <span className="text-white text-lg font-medium">{insights.weeklyTrend?.summary.trend_slope}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Peak Views</p>
                                    <span className="text-white text-lg font-medium">{insights.weeklyTrend?.summary.peak_views.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm italic">Loading growth data...</div>
                    )}
                </div>

                {/* Day of Week Chart */}
                <div className="bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg hover:border-white/20 transition-all">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Calendar size={18} /></div>
                        <h3 className="text-white font-semibold text-lg">Best Day to Post</h3>
                    </div>

                    <div className="h-64">
                        {dayOfWeekAnalysis.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dayOfWeekAnalysis}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="day_name"
                                        stroke="#525252"
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                                        tickFormatter={(val) => val.substring(0, 3)}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#525252"
                                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#9ca3af' }}
                                    />
                                    <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                        {dayOfWeekAnalysis.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.views === maxDayViews ? '#a855f7' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm flex-col gap-2">
                                <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-gray-600 animate-spin"></div>
                                Loading chart...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub-sections wrapped for styling consistency if needed, but keeping them direct as they are component calls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Users size={18} /></div>
                        <h3 className="text-white font-semibold text-lg">Demographics</h3>
                    </div>
                    <DemographicsSection data={demographics} loading={loading} />
                </div>

                <div className="bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><MapPin size={18} /></div>
                        <h3 className="text-white font-semibold text-lg">Geography</h3>
                    </div>
                    <GeographySection data={geography} loading={loading} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                    <TrafficSourcesSection data={trafficSources} loading={loading} />
                </div>

                <div className="bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Monitor size={18} /></div>
                        <h3 className="text-white font-semibold text-lg">Devices</h3>
                    </div>
                    <DevicePlatformSection
                        devices={devices}
                        platforms={platforms}
                        loading={loading}
                    />
                </div>
            </div>

            <div className="bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <SubscriptionSection data={subscriptionSources} loading={loading} />
            </div>
        </div>
    );
};
