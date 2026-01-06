import React from 'react';
import { Sparkles, PenTool, Image, Video, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AIStudio: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            <header className="mb-12">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI Studio
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Supercharge your content creation with AI-powered tools
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/ai-studio/title-generator">
                    <ToolCard
                        title="Viral Title Generator"
                        description="Generate click-worthy titles optimized for high CTR using advanced language models."
                        icon={<PenTool className="w-6 h-6 text-blue-400" />}
                        color="blue"
                        status="New"
                    />
                </Link>
                <Link to="/ai-studio/thumbnail-rater">
                    <ToolCard
                        title="Thumbnail Rater"
                        description="Upload your thumbnail options and get AI-predicted performance scores."
                        icon={<Image className="w-6 h-6 text-purple-400" />}
                        color="purple"
                        status="New"
                    />
                </Link>
                <Link to="/ai-studio/script-assistant">
                    <ToolCard
                        title="Script Assistant"
                        description="Create engaging video scripts with hooks, body content, and call-to-actions."
                        icon={<Video className="w-6 h-6 text-pink-400" />}
                        color="pink"
                        status="New"
                    />
                </Link>
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
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, color, status }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 group-hover:shadow-blue-500/10',
        purple: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40 group-hover:shadow-purple-500/10',
        pink: 'bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40 group-hover:shadow-pink-500/10',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`group относи relative p-6 rounded-2xl border transition-all duration-300 ${colorClasses[color]} bg-[#12141a]`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${color === 'blue' ? 'bg-blue-500/20' : color === 'purple' ? 'bg-purple-500/20' : 'bg-pink-500/20'}`}>
                    {icon}
                </div>
                {status && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                        {status}
                    </span>
                )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                {description}
            </p>

            <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors">
                Launch Tool <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    );
};
