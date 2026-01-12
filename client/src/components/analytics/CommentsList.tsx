import React from 'react';
import type { VideoComment } from '../../hooks/useYouTubeData';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommentsListProps {
    comments: VideoComment[];
    videoTitle?: string;
}

export const CommentsList: React.FC<CommentsListProps> = ({ comments, videoTitle }) => {
    if (!comments || comments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-[#12141a] rounded-2xl border border-white/5">
                <MessageSquare className="w-8 h-8 mb-3 opacity-50" />
                <p>No comments available for this video yet.</p>
                <p className="text-xs opacity-60 mt-1">Comments are synced daily.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#12141a] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">
                    Latest Comments <span className="text-gray-500 font-normal ml-2">{videoTitle}</span>
                </h3>
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">
                    {comments.length} synced
                </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5 p-2">
                {comments.map((comment) => (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={comment.id}
                        className="p-4 hover:bg-white/[0.02] transition-colors rounded-lg group"
                    >
                        <div className="flex gap-3">
                            <div className="shrink-0">
                                <img
                                    src={comment.author_avatar}
                                    alt={comment.author_name}
                                    className="w-8 h-8 rounded-full border border-white/10"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-200 truncate">
                                        {comment.author_name}
                                    </span>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                        {new Date(comment.published_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-400 leading-relaxed mb-2 line-clamp-4 group-hover:line-clamp-none transition-all">
                                    <span dangerouslySetInnerHTML={{ __html: comment.text_display }} />
                                </p>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp size={12} className={comment.like_count > 0 ? "text-blue-400" : ""} />
                                        <span>{comment.like_count}</span>
                                    </div>
                                    <button className="hover:text-white transition-colors">Reply on YouTube</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
