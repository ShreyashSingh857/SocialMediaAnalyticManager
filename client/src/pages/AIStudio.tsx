import React from 'react';
import { Sparkles, PenTool, Image, Video, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AIStudio: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-8 font-sans relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 w-fit">
                        <Sparkles size={14} className="text-cyan-400" />
                        <span className="text-xs font-medium text-cyan-400 uppercase tracking-widest">AI Studio</span>
                    </div>
                    <div className="mt-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                            Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Toolkit</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Supercharge your content creation with AI-powered tools designed to boost engagement and growth.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link to="/ai-studio/video-metadata" className="h-full">
                        <ToolCard
                            title="Video Metadata Optimizer"
                            description="Generate viral titles, SEO descriptions, and trending hashtags in one click."
                            icon={<PenTool className="w-5 h-5 text-blue-400" />}
                            color="blue"
                            status="Updated"
                        />
                    </Link>
                    <Link to="/ai-studio/thumbnail-rater" className="h-full">
                        <ToolCard
                            title="Thumbnail Rater"
                            description="Upload your thumbnail options and get AI-predicted performance scores."
                            icon={<Image className="w-5 h-5 text-purple-400" />}
                            color="purple"
                            status="New"
                            delay={0.1}
                        />
                    </Link>
                    <Link to="/ai-studio/script-assistant" className="h-full">
                        <ToolCard
                            title="Script Assistant"
                            description="Create engaging video scripts with hooks, body content, and call-to-actions."
                            icon={<Video className="w-5 h-5 text-pink-400" />}
                            color="pink"
                            status="New"
                            delay={0.2}
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
};

interface ToolCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'pink';
    status?: string;
    delay?: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, color, status, delay = 0 }) => {
    // Subtle gradients for the cards
    const bgGradients = {
        blue: 'from-blue-500/[0.08] to-transparent',
        purple: 'from-purple-500/[0.08] to-transparent',
        pink: 'from-pink-500/[0.08] to-transparent',
    };

    const borderColors = {
        blue: 'group-hover:border-blue-500/30',
        purple: 'group-hover:border-purple-500/30',
        pink: 'group-hover:border-pink-500/30',
    };

    const iconBg = {
        blue: 'bg-blue-500/10 text-blue-400',
        purple: 'bg-purple-500/10 text-purple-400',
        pink: 'bg-pink-500/10 text-pink-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -5 }}
            className={`group relative h-full p-8 rounded-3xl border border-white/5 bg-gradient-to-b ${bgGradients[color]} backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${borderColors[color]}`}
        >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${bgGradients[color]} pointer-events-none`} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl ${iconBg[color]} transition-colors group-hover:scale-110 duration-300`}>
                        {icon}
                    </div>
                    {status && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status === 'New' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-400/10 text-blue-400 border-blue-400/20'}`}>
                            {status}
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8 flex-1 group-hover:text-gray-300 transition-colors">
                    {description}
                </p>

                <div className="flex items-center text-sm font-semibold text-gray-500 group-hover:text-white transition-colors mt-auto">
                    Launch Tool <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
};
