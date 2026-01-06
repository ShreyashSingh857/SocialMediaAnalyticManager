import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, Play, Eye, Calendar, ExternalLink } from 'lucide-react';

interface TrendingVideo {
    id: string;
    snippet: {
        title: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: {
            medium: { url: string };
            high: { url: string };
            standard?: { url: string };
            maxres?: { url: string };
        };
    };
    statistics: {
        viewCount: string;
        likeCount: string;
    };
}

export const TrendyContent: React.FC = () => {
    const { profile, session } = useAuth();
    const [videos, setVideos] = useState<TrendingVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Enhanced mapping
    const CATEGORY_MAP: Record<string, string> = {
        'gaming': '20',
        'technology': '28',
        'tech': '28',
        'science & technology': '28',
        'music': '10',
        'sports': '17',
        'entertainment': '24',
        'comedy': '23',
        'education': '27',
        'howto & style': '26',
        'lifestyle': '22',
        'film & animation': '1',
        'news & politics': '25',
        'people & blogs': '22',
        'pets & animals': '15',
        'travel & events': '19',
        'autos & vehicles': '2',
    };

    useEffect(() => {
        const fetchTrends = async () => {
            if (!session?.provider_token) {
                setLoading(false);
                return;
            }

            try {
                const rawCategory = profile?.content_type?.toLowerCase() || 'entertainment';
                const categoryId = CATEGORY_MAP[rawCategory] || '24';

                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=5&videoCategoryId=${categoryId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.provider_token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch from YouTube');
                }

                const data = await response.json();
                setVideos(data.items || []);
            } catch (err: any) {
                console.error('Error fetching trends:', err);
                setError('Could not load trending content.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [profile, session]);

    if (!session?.provider_token) {
        return (
            <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-white/5 rounded-2xl p-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <Play className="text-red-500 w-8 h-8 ml-1" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Unlock Trending Data</h3>
                    <p className="text-gray-400 max-w-lg">Sign in with Google to see what's trending in the world of <span className="text-red-400">{profile?.content_type || 'Content Creation'}</span>.</p>
                </div>
            </div>
        );
    }

    if (loading) return null;
    if (error) return null;

    return (
        <div className="space-y-6">
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-xl shadow-lg shadow-red-500/20">
                        <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Top 5 Trending</h2>
                        <p className="text-sm text-gray-400">Current viral hits in <span className="text-red-400 font-medium">{profile?.content_type || 'General'}</span></p>
                    </div>
                </div>

                <a
                    href="https://www.youtube.com/feed/trending"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/5"
                >
                    <span>View All</span>
                    <ExternalLink size={14} />
                </a>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {videos.map((video, idx) => {
                    const thumbnail = video.snippet.thumbnails.maxres ||
                        video.snippet.thumbnails.standard ||
                        video.snippet.thumbnails.high ||
                        video.snippet.thumbnails.medium;

                    return (
                        <a
                            key={idx}
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex flex-col gap-3"
                        >
                            {/* Card Image */}
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-gray-900 border border-white/10 group-hover:border-red-500/50 transition-all duration-300">
                                {/* Rank Badge */}
                                <div className="absolute top-2 left-2 w-8 h-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center z-10 font-bold text-white shadow-lg">
                                    {idx + 1}
                                </div>

                                <img
                                    src={thumbnail.url}
                                    alt={video.snippet.title}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                {/* Play Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-600/30 text-white">
                                        <Play size={20} fill="currentColor" className="ml-1" />
                                    </div>
                                </div>

                                {/* Duration/Stats Overlay Bottom */}
                                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                                    <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-medium text-white flex items-center gap-1">
                                        <Eye size={10} />
                                        {parseInt(video.statistics.viewCount).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-200 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                                    {video.snippet.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                                    {video.snippet.channelTitle}
                                    <span className="w-1 h-1 rounded-full bg-gray-700 mx-1" />
                                    {new Date(video.snippet.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
