import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, MessageSquare, Play } from 'lucide-react';
import { useYouTubeData } from '../../hooks/useYouTubeData';
import { CommentsList } from '../../components/analytics/CommentsList';

export const AnalyticsContent: React.FC = () => {
    const { insights, topVideos, comments, debugInfo } = useYouTubeData();
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    if (!insights) return (
        <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">
            Loading insights & comments...
        </div>
    );

    // Default to the first video with comments if none selected
    const activeVideoId = selectedVideoId || (topVideos.length > 0 ? topVideos[0].id : null);
    const activeComments = activeVideoId && comments ? comments[activeVideoId] : [];
    const activeVideoStats = topVideos.find(v => v.id === activeVideoId);

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
                                {insights.weeklyTrend?.summary?.avd_minutes || 0}m
                            </div>
                            <p className="text-xs text-gray-500">Avg View Duration</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {insights.weeklyTrend?.summary?.sub_conversion_rate || 0}%
                            </div>
                            <p className="text-xs text-gray-500">Sub Conversion</p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-white/5">
                            <div className="text-xl font-bold text-white mb-1">
                                {insights.engagement?.average_engagement_rate || 0}%
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
                                />
                                <YAxis
                                    type="number"
                                    dataKey="discussability"
                                    name="Discussability"
                                    unit=" Comms/1k"
                                    stroke="#666"
                                    tick={{ fill: '#666', fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#1a1d24', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
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

            {/* Video Deep Dive & Comments Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of Recent Videos to Select */}
                <div className="bg-[#12141a] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="text-sm font-medium text-gray-300">Select Video</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
                        {topVideos.map((video) => (
                            <button
                                key={video.id}
                                onClick={() => setSelectedVideoId(video.id)}
                                className={`w-full text-left p-3 flex gap-3 hover:bg-white/5 transition-colors ${activeVideoId === video.id ? 'bg-white/5 border-l-2 border-red-500' : ''}`}
                            >
                                <div className="relative w-24 aspect-video rounded bg-gray-800 overflow-hidden shrink-0">
                                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium line-clamp-2 ${activeVideoId === video.id ? 'text-white' : 'text-gray-400'}`}>
                                        {video.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                                        <span className="flex items-center gap-0.5"><Play size={8} /> {video.views}</span>
                                        <span className="flex items-center gap-0.5"><MessageSquare size={8} /> {video.comments}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comments List for Selected Video */}
                <div className="lg:col-span-2">
                    <CommentsList
                        comments={activeComments}
                        videoTitle={activeVideoStats?.title}
                    />
                </div>
            </div>
        </div>
    );
};
