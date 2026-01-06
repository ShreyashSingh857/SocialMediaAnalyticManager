import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';
import { useYouTubeData } from '../../hooks/useYouTubeData';

export const AnalyticsContent: React.FC = () => {
    const { insights } = useYouTubeData();

    if (!insights) return <div className="text-gray-400">Loading insights...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Engagement Matrix */}
                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                    <h3 className="text-gray-400 text-sm font-medium mb-4">Engagement Matrix</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    type="number"
                                    dataKey="likability"
                                    name="Likability"
                                    unit=" Likes/1k"
                                    stroke="#666"
                                    tick={{ fill: '#666', fontSize: 10 }}
                                    label={{ value: 'Likability (Likes/1k Views)', position: 'bottom', offset: 0, fill: '#666', fontSize: 10 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="discussability"
                                    name="Discussability"
                                    unit=" Comms/1k"
                                    stroke="#666"
                                    tick={{ fill: '#666', fontSize: 10 }}
                                    label={{ value: 'Discussability (Comments/1k)', angle: -90, position: 'left', fill: '#666', fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#1a1d24', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any, name: any, props: any) => {
                                        if (name === 'Likability') return [`${value} Likes/1k`, 'Likability'];
                                        if (name === 'Discussability') return [`${value} Comments/1k`, 'Discussability'];
                                        return [value, name];
                                    }}
                                />
                                <Scatter name="Videos" data={insights.engagement?.engagement_quality || []} fill="#10b981">
                                    {insights.engagement?.engagement_quality?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#10b981" />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                <h3 className="text-gray-400 text-sm font-medium mb-4">Video Deep Dive</h3>
                {/* Re-use Video List if needed, or placeholder for now */}
                <div className="text-gray-500 text-sm">
                    Select a video from the matrix to view details (Implementation Pending)
                </div>
            </div>
        </div>
    );
};
