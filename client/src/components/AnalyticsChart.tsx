import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
    date: string;
    value: number;
}

interface AnalyticsChartProps {
    title: string;
    data: DataPoint[];
    valueFormatter?: (value: number) => string;
    color?: string;
}

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1b23] border border-gray-700 p-2 rounded shadow-xl text-xs">
                <p className="text-gray-400 mb-1">{format(new Date(label), 'MMM d, yyyy')}</p>
                <p className="text-white font-semibold">
                    {formatter ? formatter(payload[0].value) : payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ title, data, color = "#3b82f6", valueFormatter }) => {
    return (
        <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 flex flex-col">
            <h3 className="text-gray-400 text-sm font-medium mb-6">{title}</h3>
            {/* Container with guaranteed minimum dimensions */}
            <div className="flex-1 w-full min-h-80 min-w-0">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320} minWidth={300} debounce={300}>
                            <AreaChart
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 0,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(number) =>
                                        valueFormatter ? valueFormatter(number) : new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(number)
                                    }
                                />
                                <Tooltip content={<CustomTooltip formatter={valueFormatter} />} cursor={{ stroke: '#4b5563', strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={color}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#gradient-${title})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                ) : (
                    <div className="text-gray-500 text-sm flex items-center justify-center w-full h-80">
                        {data && data.length === 0 ? 'No data available' : 'Loading chart...'}
                    </div>
                )}
            </div>
        </div>
    );
};
