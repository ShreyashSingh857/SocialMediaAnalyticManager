import React, { useState } from 'react';
import { Sparkles, Copy, ArrowLeft, Loader2, AlertCircle, Hash, AlignLeft, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../../lib/config';

interface MetadataResult {
    titles: string[];
    description: string;
    hashtags: string[];
}

export const VideoMetadata: React.FC = () => {
    const [description, setDescription] = useState('');
    const [result, setResult] = useState<MetadataResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!description.trim() || description.split(' ').length < 3) {
            setError('Please describe your video in at least 3 words.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(API_ENDPOINTS.AI.GENERATE_METADATA, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate metadata');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            <header className="mb-8">
                <Link to="/ai-studio" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to AI Studio
                </Link>

                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                    <Sparkles className="text-blue-400" />
                    Video Metadata Optimizer
                </h1>
                <p className="text-gray-400 mt-2 max-w-2xl">
                    Generate viral titles, SEO-optimized descriptions, and trending hashtags in one click.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            What is your video about?
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. A tutorial on how to use React Hooks for beginners, focusing on useState and useEffect..."
                            className="w-full h-48 bg-[#0a0b0e] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                        />
                        {error && (
                            <div className="flex items-center text-red-400 text-sm mt-2 animate-pulse">
                                <AlertCircle size={16} className="mr-2" />
                                {error}
                            </div>
                        )}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className={`
                                    bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500
                                    text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20
                                    transition-all duration-300 flex items-center gap-2
                                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Optimizing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Generate Metadata
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-6">
                    {result ? (
                        <>
                            {/* Titles */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#12141a] p-5 rounded-xl border border-white/5"
                            >
                                <div className="flex items-center gap-2 mb-4 text-blue-400 font-semibold">
                                    <Type size={18} />
                                    <h3>Viral Titles</h3>
                                </div>
                                <div className="space-y-3">
                                    {result.titles.map((title, index) => (
                                        <div key={index} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                            <span className="text-gray-200">{title}</span>
                                            <button onClick={() => copyToClipboard(title)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-colors p-1" title="Copy Title">
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-[#12141a] p-5 rounded-xl border border-white/5"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                                        <AlignLeft size={18} />
                                        <h3>SEO Description</h3>
                                    </div>
                                    <button onClick={() => copyToClipboard(result.description)} className="text-gray-500 hover:text-white transition-colors p-1" title="Copy Description">
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {result.description}
                                </div>
                            </motion.div>

                            {/* Hashtags */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-[#12141a] p-5 rounded-xl border border-white/5"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                                        <Hash size={18} />
                                        <h3>Hashtags</h3>
                                    </div>
                                    <button onClick={() => copyToClipboard(result.hashtags.join(' '))} className="text-gray-500 hover:text-white transition-colors p-1" title="Copy All">
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.hashtags.map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-sm border border-purple-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-2xl p-12 min-h-100">
                                <Sparkles size={48} className="mb-4 opacity-20" />
                                <p>Optimized metadata will appear here</p>
                            </div>
                        )
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-100">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles size={48} className="text-blue-400 opacity-50" />
                            </motion.div>
                            <p className="mt-6 font-medium animate-pulse">Analyzing topic & trends...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
