import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Smartphone, Monitor, Tv, Tablet, Gamepad2 } from 'lucide-react';
import { DonutChart } from '../charts/DonutChart';
import { motion } from 'framer-motion';

interface DevicePlatformSectionProps {
    devices: { type: string; views: number; percentage: number }[];
    platforms: { type: string; views: number; percentage: number }[];
    loading?: boolean;
}

export const DevicePlatformSection: React.FC<DevicePlatformSectionProps> = ({
    devices,
    platforms,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-purple-400" />
                    Devices & Platforms
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 h-96 animate-pulse" />
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 h-96 animate-pulse" />
                </div>
            </div>
        );
    }

    if (devices.length === 0 && platforms.length === 0) {
        return null;
    }

    // Device icons mapping
    const deviceIcons: Record<string, React.ReactNode> = {
        mobile: <Smartphone className="w-5 h-5" />,
        desktop: <Monitor className="w-5 h-5" />,
        tv: <Tv className="w-5 h-5" />,
        tablet: <Tablet className="w-5 h-5" />,
        game_console: <Gamepad2 className="w-5 h-5" />
    };

    // Device colors
    const deviceColors: Record<string, string> = {
        mobile: '#3b82f6',
        desktop: '#8b5cf6',
        tv: '#ec4899',
        tablet: '#f59e0b',
        game_console: '#10b981'
    };

    // Transform devices for bar chart
    const deviceChartData = devices.map(device => ({
        name: formatDeviceName(device.type),
        views: device.views,
        percentage: device.percentage,
        color: deviceColors[device.type] || '#6366f1'
    }));

    // Transform platforms for donut chart
    const platformChartData = platforms.map(platform => ({
        label: formatPlatformName(platform.type),
        value: platform.percentage,
        color: getPlatformColor(platform.type)
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-[#1a1d24] border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium">{data.payload.name}</p>
                    <p className="text-gray-400 text-sm">
                        {data.value.toLocaleString()} views ({data.payload.percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-purple-400" />
                Devices & Platforms
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                {devices.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#12141a] p-6 rounded-2xl border border-white/5"
                    >
                        <h3 className="text-lg font-semibold text-white mb-6">Device Types</h3>

                        {/* Bar Chart */}
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={deviceChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    width={80}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="views" radius={[0, 8, 8, 0]}>
                                    {deviceChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Device Stats */}
                        <div className="mt-6 space-y-3">
                            {devices.map((device) => (
                                <div key={device.type} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: `${deviceColors[device.type]}20` }}
                                        >
                                            <div style={{ color: deviceColors[device.type] }}>
                                                {deviceIcons[device.type] || <Monitor className="w-5 h-5" />}
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-300">
                                            {formatDeviceName(device.type)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-white">
                                            {device.views.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {device.percentage}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Platform Distribution */}
                {platforms.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <DonutChart
                            data={platformChartData}
                            title="Traffic Platforms"
                            height={350}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Helper functions
function formatDeviceName(type: string): string {
    const names: Record<string, string> = {
        mobile: 'Mobile',
        desktop: 'Desktop',
        tv: 'TV',
        tablet: 'Tablet',
        game_console: 'Game Console'
    };
    return names[type] || type;
}

function formatPlatformName(type: string): string {
    const names: Record<string, string> = {
        youtube_app: 'YouTube App',
        youtube_web: 'YouTube Web',
        embedded: 'Embedded Players'
    };
    return names[type] || type;
}

function getPlatformColor(type: string): string {
    const colors: Record<string, string> = {
        youtube_app: '#ff0000',
        youtube_web: '#3b82f6',
        embedded: '#8b5cf6'
    };
    return colors[type] || '#6366f1';
}
