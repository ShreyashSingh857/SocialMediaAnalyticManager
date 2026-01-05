import React from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface RefreshIndicatorProps {
    isRefreshing: boolean;
    lastUpdated?: Date | null;
    onRefresh?: () => void;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
    isRefreshing,
    lastUpdated,
    onRefresh
}) => {
    const formatLastUpdated = (date: Date | null | undefined) => {
        if (!date) return 'Never';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="flex items-center gap-3 text-sm text-gray-400">
            {/* Last Updated */}
            <span className="hidden sm:inline">
                Last updated: <span className="text-gray-300">{formatLastUpdated(lastUpdated)}</span>
            </span>

            {/* Refresh Button */}
            {onRefresh && (
                <motion.button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                        p-2 rounded-lg border border-white/10 
                        hover:bg-white/5 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${isRefreshing ? 'bg-white/5' : 'bg-transparent'}
                    `}
                    title="Refresh data"
                >
                    <RefreshCw
                        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                </motion.button>
            )}

            {/* Syncing Indicator */}
            {isRefreshing && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-blue-400"
                >
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-xs">Syncing...</span>
                </motion.div>
            )}
        </div>
    );
};
