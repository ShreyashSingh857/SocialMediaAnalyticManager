import React from 'react';
import { useInstagramData } from '../../hooks/useInstagramData';
import { Heart, MessageCircle, BarChart2, Instagram } from 'lucide-react';

export const InstagramContent: React.FC = () => {
    const { loading, error, profile, posts, debugInfo } = useInstagramData();

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mr-3"></div>
            Loading Instagram Data...
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-900/20 border border-red-900/50 rounded-xl text-center">
            <p className="text-red-400 mb-2">Failed to load Instagram Data</p>
            <p className="text-xs text-gray-500">{error}</p>
        </div>
    );

    if (!profile) return (
        <div className="flex flex-col items-center justify-center h-64 bg-[#12141a] rounded-2xl border border-white/5 p-8 text-center">
            <Instagram size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Instagram Account Connected</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-6">
                Connect your Instagram Business account via Facebook Login to see your analytics.
            </p>
            {/* The login button is in Sidebar/Settings, so maybe just a prompt here */}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header / Profile Stats */}
            <div className="bg-gradient-to-br from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#833ab4] to-[#fcb045] rounded-full blur opacity-20"></div>
                    <img
                        src={profile.profilePictureUrl}
                        alt={profile.username}
                        className="relative w-24 h-24 rounded-full border-2 border-[#fd1d1d] p-0.5 object-cover bg-black"
                    />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white mb-1">{profile.fullName}</h2>
                    <p className="text-[#fcb045] font-medium">@{profile.username}</p>
                </div>

                <div className="flex gap-8 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">{profile.followers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Followers</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">{profile.mediaCount.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Posts</div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Instagram size={20} className="text-pink-500" /> Recent Posts
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <div key={post.id} className="bg-[#12141a] rounded-xl border border-white/5 overflow-hidden group hover:border-[#833ab4]/30 transition-all">
                            <div className="aspect-square bg-gray-900 relative">
                                {post.media_url ? (
                                    <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                    <div className="flex items-center gap-2">
                                        <Heart className="fill-white" size={20} /> {post.like_count}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="fill-white" size={20} /> {post.comments_count}
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-medium">
                                    {new Date(post.timestamp).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="p-4">
                                <p className="text-sm text-gray-300 line-clamp-2 mb-4 h-10">
                                    {post.caption || 'No caption'}
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
                                    <div className="flex gap-1">
                                        <span>{(post.like_count + post.comments_count).toLocaleString()} Engagement</span>
                                    </div>
                                    <a
                                        href={post.permalink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-pink-400 hover:text-pink-300 flex items-center gap-1"
                                    >
                                        View <ArrowUpRight size={12} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Debug Info */}
            {debugInfo && (
                <div className="mt-12 p-4 bg-gray-900 border border-gray-800 rounded-xl opacity-50 hover:opacity-100 transition-opacity">
                    <h3 className="text-gray-500 font-medium mb-2 text-xs uppercase">Debug Sync Logs</h3>
                    <pre className="text-[10px] text-gray-600 font-mono overflow-auto max-h-32">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

// Simple Icon Component
const ArrowUpRight = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="7" y1="17" x2="17" y2="7"></line>
        <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
);
