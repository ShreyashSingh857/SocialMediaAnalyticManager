import React, { useState } from 'react';
import { Eye, ThumbsUp, MessageSquare, X } from 'lucide-react';
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
    const [selectedVideo, setSelectedVideo] = useState<VideoPerformance | null>(null);
    const [showAll, setShowAll] = useState(false);

    const displayedVideos = showAll ? videos : videos.slice(0, 5);

    return (
        <>
            <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 text-sm font-medium">Top Performing Content</h3>
                    {videos.length > 5 && (
                        <button 
                            onClick={() => setShowAll(!showAll)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            {showAll ? 'Show Less' : 'View All'}
                        </button>
                    )}
                </div>
                <div className="space-y-4">
                    {displayedVideos.map((video) => (
                        <div 
                            key={video.id} 
                            onClick={() => setSelectedVideo(video)}
                            className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer"
                        >
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

            {/* Video Details Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
                    <div className="bg-[#1a1b23] border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="relative aspect-video bg-black">
                            <img src={selectedVideo.thumbnailUrl} alt={selectedVideo.title} className="w-full h-full object-contain" />
                            <button 
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Published {formatDistanceToNow(new Date(selectedVideo.publishedAt), { addSuffix: true })}
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl text-center">
                                    <Eye className="mx-auto mb-2 text-blue-400" size={24} />
                                    <div className="text-2xl font-bold text-white">{selectedVideo.views.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Views</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl text-center">
                                    <ThumbsUp className="mx-auto mb-2 text-green-400" size={24} />
                                    <div className="text-2xl font-bold text-white">{selectedVideo.likes.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Likes</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl text-center">
                                    <MessageSquare className="mx-auto mb-2 text-purple-400" size={24} />
                                    <div className="text-2xl font-bold text-white">{selectedVideo.comments.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Comments</div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm text-gray-400">Engagement Rate</div>
                                        <div className="text-xl font-bold text-white">
                                            {((selectedVideo.likes + selectedVideo.comments) / (selectedVideo.views || 1) * 100).toFixed(2)}%
                                        </div>
                                    </div>
                                    <a 
                                        href={`https://www.youtube.com/watch?v=${selectedVideo.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Watch on YouTube
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
