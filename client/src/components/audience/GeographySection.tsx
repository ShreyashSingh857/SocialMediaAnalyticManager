import React, { useState } from 'react';
import { Globe, Eye, Clock, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface GeographySectionProps {
    data: {
        countries: {
            code: string;
            name: string;
            views: number;
            watchTime: number;
            subscribers: number;
        }[];
    } | null;
    loading?: boolean;
}

type SortMetric = 'views' | 'watchTime' | 'subscribers';

export const GeographySection: React.FC<GeographySectionProps> = ({
    data,
    loading = false
}) => {
    const [sortBy, setSortBy] = useState<SortMetric>('views');
    const [showCount, setShowCount] = useState(10);

    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Globe className="w-6 h-6 text-green-400" />
                    Geography
                </h2>
                <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 h-96 animate-pulse" />
            </div>
        );
    }

    if (!data || data.countries.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Globe className="w-6 h-6 text-green-400" />
                    Geography
                </h2>
                <div className="bg-[#12141a] p-12 rounded-2xl border border-white/5 text-center">
                    <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No Geography Data Available
                    </h3>
                    <p className="text-gray-400">
                        Geography data will appear once you have viewers from different countries.
                    </p>
                </div>
            </div>
        );
    }

    // Sort countries based on selected metric
    const sortedCountries = [...data.countries].sort((a, b) => {
        switch (sortBy) {
            case 'watchTime':
                return b.watchTime - a.watchTime;
            case 'subscribers':
                return b.subscribers - a.subscribers;
            case 'views':
            default:
                return b.views - a.views;
        }
    });

    const displayedCountries = sortedCountries.slice(0, showCount);
    const totalViews = data.countries.reduce((sum, c) => sum + c.views, 0);

    const widthClasses = ['w-0', 'w-[10%]', 'w-[20%]', 'w-[30%]', 'w-[40%]', 'w-[50%]', 'w-[60%]', 'w-[70%]', 'w-[80%]', 'w-[90%]', 'w-full'];
    const getWidthClass = (percentage: number) => {
        const index = Math.min(10, Math.max(0, Math.round(percentage / 10)));
        return widthClasses[index];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Globe className="w-6 h-6 text-green-400" />
                    Geography
                </h2>

                {/* Sort Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortBy('views')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'views'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Views
                    </button>
                    <button
                        onClick={() => setSortBy('watchTime')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'watchTime'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Watch Time
                    </button>
                    <button
                        onClick={() => setSortBy('subscribers')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'subscribers'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Subscribers
                    </button>
                </div>
            </div>

            {/* Countries Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#12141a] rounded-2xl border border-white/5 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Country
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center justify-end gap-1">
                                        <Eye className="w-3 h-3" />
                                        Views
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3" />
                                        Watch Time
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center justify-end gap-1">
                                        <UsersIcon className="w-3 h-3" />
                                        Subscribers
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    % of Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayedCountries.map((country, index) => {
                                const percentage = ((country.views / totalViews) * 100).toFixed(1);
                                return (
                                    <motion.tr
                                        key={country.code}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            #{index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getFlagEmoji(country.code)}</span>
                                                <span className="text-sm font-medium text-white">
                                                    {country.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white font-medium">
                                            {country.views.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                                            {formatWatchTime(country.watchTime)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                                            {country.subscribers > 0 ? `+${country.subscribers}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-linear-to-r from-blue-500 to-purple-500 ${getWidthClass(percentage)}`}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-400 w-12 text-right">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Load More Button */}
                {sortedCountries.length > showCount && (
                    <div className="p-4 border-t border-white/5 text-center">
                        <button
                            onClick={() => setShowCount(prev => prev + 10)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Show More Countries
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// Helper function to format watch time
function formatWatchTime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
}
