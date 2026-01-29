import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, MessageSquare, Play, Video, BarChart2 } from 'lucide-react';
import { useYouTubeData } from '../../hooks/useYouTubeData';
import { CommentsList } from '../../components/analytics/CommentsList';

export const AnalyticsContent: React.FC = () => {
    const { insights, topVideos, comments } = useYouTubeData();
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    if (!insights) return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 animate-pulse space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-cyan-500 animate-spin"></div>
            <span>Loading content insights...</span>
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
                <div className="bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden shadow-lg group hover:border-white/20 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock size={100} className="text-purple-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Clock size={18} /></div>
                        <h3 className="text-white font-semibold text-lg">Content Quality</h3>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-3xl font-bold text-white mb-1">
                                {insights.weeklyTrend?.summary?.avd_minutes || 0}m
                            </div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Avg View Duration</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-3xl font-bold text-white mb-1">
                                {insights.weeklyTrend?.summary?.sub_conversion_rate || 0}%
                            </div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Sub Conversion</p>
                        </div>
                        <div className="col-span-2 pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Avg Engagement Rate</p>
                                <span className="text-green-400 text-sm font-bold">Good</span>
                            </div>
                            <div className="text-4xl font-bold text-white mb-1 flex items-baseline gap-2">
                                {insights.engagement?.average_engagement_rate || 0}%
                                <span className="text-sm font-normal text-gray-500">per view</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-linear-to-r from-purple-500 to-cyan-500 w-[65%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Engagement Matrix */}
                <div className="bg-white/3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg hover:border-white/20 transition-all">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><BarChart2 size={18} /></div>
                        <h3 className="text-white font-semibold text-lg">Engagement Matrix</h3>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    type="number"
                                    dataKey="likability"
                                    name="Likability"
                                    unit=" Likes"
                                    stroke="#525252"
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ value: 'Likes per 1k Views', position: 'bottom', fill: '#666', fontSize: 10, offset: 0 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="discussability"
                                    name="Discussability"
                                    unit=" Comms"
                                    stroke="#525252"
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ value: 'Comments per 1k Views', angle: -90, position: 'left', fill: '#666', fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }}
                                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#9ca3af' }}
                                />
                                <Scatter name="Videos" data={insights.engagement?.engagement_quality || []} fill="#10b981">
                                    {insights.engagement?.engagement_quality?.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index % 2 === 0 ? '#22d3ee' : '#a855f7'}
                                            stroke="rgba(255,255,255,0.5)"
                                            strokeWidth={1}
                                        />
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
                <div className="bg-white/3 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden flex flex-col h-150 shadow-lg">
                    <div className="p-4 border-b border-white/5 bg-white/2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Video size={14} className="text-cyan-400" />
                            Select Video
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                        {topVideos.map((video) => (
                            <button
                                key={video.id}
                                onClick={() => setSelectedVideoId(video.id)}
                                className={`w-full text-left p-4 flex gap-3 hover:bg-white/5 transition-all duration-200 group ${activeVideoId === video.id ? 'bg-white/5 border-l-2 border-cyan-400 pl-3.5' : 'border-l-2 border-transparent'}`}
                            >
                                <div className="relative w-28 aspect-video rounded-lg bg-gray-900 overflow-hidden shrink-0 shadow-md group-hover:shadow-lg transition-all border border-white/5">
                                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p className={`text-sm font-medium line-clamp-2 mb-1.5 transition-colors ${activeVideoId === video.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                        {video.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                                        <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><Play size={10} /> {video.views.toLocaleString()}</span>
                                        <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><MessageSquare size={10} /> {video.comments}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {topVideos.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">No videos found.</div>
                        )}
                    </div>
                </div>

                {/* Comments List for Selected Video */}
                <div className="lg:col-span-2 bg-white/3 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg overflow-hidden h-150 flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare size={14} className="text-purple-400" />
                            Waitlist Feedback
                        </h3>
                        {activeVideoStats && (
                            <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded truncate max-w-50">
                                {activeVideoStats.title}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <CommentsList
                            comments={activeComments}
                            videoTitle={activeVideoStats?.title}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
