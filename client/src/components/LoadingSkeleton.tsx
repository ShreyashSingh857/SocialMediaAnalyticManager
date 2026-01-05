import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular'
}) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl'
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        />
    );
};

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <motion.header
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-12"
            >
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-4 w-96" variant="text" />
            </motion.header>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="h-3 w-20" variant="text" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                    </motion.div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/5"
                    >
                        <Skeleton className="h-6 w-48 mb-6" />
                        <Skeleton className="h-64 w-full" />
                    </motion.div>
                </div>

                {/* Right Column - Profile Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md h-fit"
                >
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton className="h-5 w-24" variant="text" />
                        <Skeleton className="h-5 w-5" variant="circular" />
                    </div>

                    <div className="flex flex-col items-center mb-6">
                        <Skeleton className="w-24 h-24 mb-4" variant="circular" />
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" variant="text" />
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <Skeleton className="h-4 w-16 mb-2" variant="text" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Analytics Skeleton
export const AnalyticsSkeleton: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            {/* Header Skeleton */}
            <header>
                <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10" variant="circular" />
                    <div>
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" variant="text" />
                    </div>
                </div>
            </header>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#12141a] p-6 rounded-2xl border border-white/5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="w-10 h-10" />
                        </div>
                        <Skeleton className="h-3 w-20 mb-2" variant="text" />
                        <Skeleton className="h-8 w-24" />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Graph Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs Skeleton */}
                    <div className="flex space-x-2 bg-[#12141a] p-1.5 rounded-lg border border-white/5 w-fit">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-9 w-24" />
                        ))}
                    </div>

                    {/* Chart Skeleton */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#12141a] p-6 rounded-2xl border border-white/5"
                    >
                        <Skeleton className="h-6 w-48 mb-6" />
                        <Skeleton className="h-80 w-full" />
                    </motion.div>

                    {/* Insights Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="bg-[#12141a] p-6 rounded-2xl border border-white/5"
                            >
                                <Skeleton className="h-4 w-24 mb-4" variant="text" />
                                <Skeleton className="h-10 w-32 mb-2" />
                                <Skeleton className="h-4 w-full" variant="text" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Side Panel Skeleton */}
                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                    <Skeleton className="h-6 w-32 mb-6" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                                className="flex gap-3"
                            >
                                <Skeleton className="w-20 h-14" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-full mb-2" variant="text" />
                                    <Skeleton className="h-3 w-24" variant="text" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Video List Skeleton
export const VideoListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 p-3 rounded-lg bg-white/5"
                >
                    <Skeleton className="w-24 h-16" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-2" variant="text" />
                        <Skeleton className="h-3 w-32 mb-2" variant="text" />
                        <div className="flex gap-4">
                            <Skeleton className="h-3 w-16" variant="text" />
                            <Skeleton className="h-3 w-16" variant="text" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
