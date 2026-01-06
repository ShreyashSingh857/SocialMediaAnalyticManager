import React, { useState } from 'react';
import { Sparkles, Copy, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const TitleGenerator: React.FC = () => {
    const [description, setDescription] = useState('');
    const [titles, setTitles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!description.trim() || description.split(' ').length < 5) {
            setError('Please describe your video in at least 5 words.');
            return;
        }

        setLoading(true);
        setError(null);
        setTitles([]);

        try {
            const response = await fetch('http://localhost:8000/api/v1/ai/generate-titles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate titles');
            }

            const data = await response.json();
            setTitles(data.titles);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            <header className="mb-8">
                <Link to="/ai-studio" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to AI Studio
                </Link>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                    <Sparkles className="text-blue-400" />
                    Viral Title Generator
                </h1>
                <p className="text-gray-400 mt-2 max-w-2xl">
                    Describe your video content, and our AI will generate engaging, high-CTR titles optimized for YouTube.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Video Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. A vlog about my trip to Japan where I tried street food in Tokyo and visited a cat cafe..."
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
                                    bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500
                                    text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20
                                    transition-all duration-300 flex items-center gap-2
                                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Generate Titles
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-4">
                    {titles.length > 0 && (
                        <h2 className="text-lg font-semibold text-gray-300">Generated Titles</h2>
                    )}

                    <div className="space-y-3">
                        {titles.map((title, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-[#12141a] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 flex items-center justify-between"
                            >
                                <span className="text-gray-200 font-medium">{title}</span>
                                <button
                                    onClick={() => copyToClipboard(title)}
                                    className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Copy to clipboard"
                                >
                                    <Copy size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {titles.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-2xl p-12">
                            <Sparkles size={48} className="mb-4 opacity-20" />
                            <p>Your viral titles will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
