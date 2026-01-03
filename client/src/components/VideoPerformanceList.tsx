import React from 'react';
import { Eye, ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VideoPerformance {
    id: string;
    title: string;
    thumbnailUrl: string;
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
}

interface VideoPerformanceListProps {
    videos: VideoPerformance[];
}

export const VideoPerformanceList: React.FC<VideoPerformanceListProps> = ({ videos }) => {
    return (
        <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
            <h3 className="text-gray-400 text-sm font-medium mb-4">Top Performing Content</h3>
            <div className="space-y-4">
                {videos.map((video) => (
                    <div key={video.id} className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer">
                        <div className="relative w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                            {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                                {video.title}
                            </h4>
                            <p className="text-gray-500 text-xs mb-3">
                                Published {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                            </p>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Eye size={14} />
                                    <span className="text-xs font-medium">{video.views.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <ThumbsUp size={14} />
                                    <span className="text-xs font-medium">{video.likes.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <MessageSquare size={14} />
                                    <span className="text-xs font-medium">{video.comments.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {videos.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        No video data available yet.
                    </div>
                )}
            </div>
        </div>
    );
};
