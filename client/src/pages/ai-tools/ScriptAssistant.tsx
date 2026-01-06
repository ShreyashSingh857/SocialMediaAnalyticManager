import React, { useState } from 'react';
import { Video, Scroll, Copy, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ScriptResult {
    hook: string;
    intro: string;
    body: string[];
    cta: string;
}

export const ScriptAssistant: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Professional');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScriptResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const tones = ['Professional', 'Casual', 'Energetic', 'Humorous', 'Educational'];

    const handleGenerate = async () => {
        if (!topic.trim() || topic.split(' ').length < 3) {
            setError('Please describe your topic in a bit more detail.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:8000/api/v1/ai/generate-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic, tone }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate script');
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

                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
                    <Video className="text-pink-400" />
                    Script Assistant
                </h1>
                <p className="text-gray-400 mt-2 max-w-2xl">
                    Generate structured video scripts that keep viewers watching.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Video Topic
                            </label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. 5 tips for better sleep, How to learn coding as a beginner..."
                                className="w-full h-32 bg-[#0a0b0e] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Tone
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {tones.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTone(t)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tone === t
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-[#0a0b0e] text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center text-red-400 text-sm animate-pulse">
                                <AlertCircle size={16} className="mr-2" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className={`
                                w-full
                                bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500
                                text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-pink-500/20
                                transition-all duration-300 flex items-center justify-center gap-2
                                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Writing Script...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Generate Script
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-6 h-full">
                    {result ? (
                        <div className="space-y-4">
                            <ScriptSection title="Hook (0-10s)" content={result.hook} onCopy={() => copyToClipboard(result.hook)} delay={0} />
                            <ScriptSection title="Intro (10-30s)" content={result.intro} onCopy={() => copyToClipboard(result.intro)} delay={0.1} />
                            <ScriptListSection title="Body / Key Points" items={result.body} onCopy={() => copyToClipboard(result.body.join('\n'))} delay={0.2} />
                            <ScriptSection title="Call to Action" content={result.cta} onCopy={() => copyToClipboard(result.cta)} delay={0.3} />
                        </div>
                    ) : (
                        !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-2xl p-12 min-h-[400px]">
                                <Scroll size={48} className="mb-4 opacity-20" />
                                <p>Your generated script will appear here</p>
                            </div>
                        )
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles size={48} className="text-pink-400 opacity-50" />
                            </motion.div>
                            <p className="mt-6 font-medium animate-pulse">Drafting content...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScriptSection: React.FC<{ title: string; content: string; onCopy: () => void; delay: number }> = ({ title, content, onCopy, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#12141a] p-5 rounded-xl border border-white/5 group relative hover:border-pink-500/20 transition-colors"
    >
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-pink-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
            <button onClick={onCopy} className="text-gray-500 hover:text-white transition-colors p-1" title="Copy">
                <Copy size={14} />
            </button>
        </div>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
    </motion.div>
);

const ScriptListSection: React.FC<{ title: string; items: string[]; onCopy: () => void; delay: number }> = ({ title, items, onCopy, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#12141a] p-5 rounded-xl border border-white/5 group relative hover:border-pink-500/20 transition-colors"
    >
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-pink-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
            <button onClick={onCopy} className="text-gray-500 hover:text-white transition-colors p-1" title="Copy All">
                <Copy size={14} />
            </button>
        </div>
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start text-gray-300">
                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-500/50 shrink-0"></span>
                    {item}
                </li>
            ))}
        </ul>
    </motion.div>
);
