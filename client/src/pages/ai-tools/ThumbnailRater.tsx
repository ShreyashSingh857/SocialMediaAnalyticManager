import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, ArrowLeft, Star, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface AnalysisResult {
    score: number;
    pros: string[];
    cons: string[];
    suggestions: string[];
}

export const ThumbnailRater: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/v1/ai/analyze-thumbnail', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to analyze thumbnail');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-400';
        if (score >= 5) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            <header className="mb-8">
                <Link to="/ai-studio" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to AI Studio
                </Link>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                    <ImageIcon className="text-purple-400" />
                    Thumbnail Rater
                </h1>
                <p className="text-gray-400 mt-2 max-w-2xl">
                    Get AI-powered feedback on your thumbnails before you publish. Optimize for higher CTR.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div className="bg-[#12141a] p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
                        {!preview ? (
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors rounded-xl p-8 border-2 border-dashed border-white/10 hover:border-purple-500/50">
                                <Upload size={48} className="text-gray-500 mb-4" />
                                <span className="text-lg font-medium text-gray-300">Upload Thumbnail</span>
                                <span className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                            </label>
                        ) : (
                            <div className="relative w-full">
                                <img src={preview} alt="Preview" className="w-full rounded-xl shadow-2xl" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <label className="bg-black/50 backdrop-blur px-4 py-2 rounded-lg cursor-pointer hover:bg-black/70 transition-colors text-sm font-medium">
                                        Change Image
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                    </label>
                                </div>
                            </div>
                        )}

                        {preview && (
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className={`
                                    mt-6 w-full
                                    bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                                    text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/20
                                    transition-all duration-300 flex items-center justify-center gap-2
                                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Star size={20} />
                                        Analyze Thumbnail
                                    </>
                                )}
                            </button>
                        )}

                        {error && (
                            <div className="flex items-center text-red-400 text-sm mt-4 animate-pulse bg-red-500/10 px-4 py-2 rounded-lg">
                                <AlertCircle size={16} className="mr-2" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Score Card */}
                                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-gray-400 font-medium">Predicted Performance Score</h3>
                                        <p className={`text-4xl font-bold mt-1 ${getScoreColor(result.score)}`}>
                                            {result.score}<span className="text-xl text-gray-500">/10</span>
                                        </p>
                                    </div>
                                    <div className="h-16 w-16 rounded-full border-4 border-white/10 flex items-center justify-center">
                                        <Star className={getScoreColor(result.score)} fill="currentColor" size={24} />
                                    </div>
                                </div>

                                {/* Pros */}
                                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                                    <h3 className="flex items-center text-green-400 font-semibold mb-4">
                                        <ThumbsUp size={18} className="mr-2" />
                                        What Works Well
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.pros.map((item, i) => (
                                            <li key={i} className="flex items-start text-gray-300 text-sm">
                                                <CheckCircle size={14} className="mr-2 mt-1 text-green-500/50 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Cons */}
                                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                                    <h3 className="flex items-center text-red-400 font-semibold mb-4">
                                        <ThumbsDown size={18} className="mr-2" />
                                        Needs Improvement
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.cons.map((item, i) => (
                                            <li key={i} className="flex items-start text-gray-300 text-sm">
                                                <AlertCircle size={14} className="mr-2 mt-1 text-red-500/50 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Suggestions */}
                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/20">
                                    <h3 className="flex items-center text-purple-300 font-semibold mb-4">
                                        <Lightbulb size={18} className="mr-2" />
                                        AI Suggestions
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.suggestions.map((item, i) => (
                                            <li key={i} className="flex items-start text-gray-300 text-sm">
                                                <span className="mr-2 mt-1 text-purple-400">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {!result && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-2xl p-12 min-h-[400px]">
                                <ImageIcon size={48} className="mb-4 opacity-20" />
                                <p>Upload a thumbnail to see AI analysis</p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-white/5 rounded-2xl min-h-[400px]">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                                    <Loader2 size={48} className="animate-spin relative z-10 text-purple-400" />
                                </div>
                                <p className="mt-6 font-medium animate-pulse">Analyzing visual elements...</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
