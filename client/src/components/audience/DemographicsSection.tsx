import React from 'react';
import { DonutChart } from '../charts/DonutChart';
import { Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemographicsSectionProps {
    data: {
        ageGroups: { label: string; value: number; color: string }[];
        gender: { label: string; value: number; color: string }[];
    } | null;
    loading?: boolean;
}

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({
    data,
    loading = false
}) => {
    // Loading State
    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    Demographics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 h-96 animate-pulse" />
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5 h-96 animate-pulse" />
                </div>
            </div>
        );
    }

    // Empty State - No Data Available
    if (!data || (data.ageGroups.length === 0 && data.gender.length === 0)) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    Demographics
                </h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#12141a] p-12 rounded-2xl border border-white/5 text-center"
                >
                    <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Demographics Data Not Available
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Demographics data requires a minimum number of signed-in viewers.
                        This data will become available as your channel grows.
                    </p>
                </motion.div>
            </div>
        );
    }

    // Data Available - Show Charts
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                Demographics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age Distribution */}
                {data.ageGroups.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <DonutChart
                            data={data.ageGroups}
                            title="Age Distribution"
                            height={350}
                        />
                    </motion.div>
                )}

                {/* Gender Split */}
                {data.gender.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <DonutChart
                            data={data.gender}
                            title="Gender Distribution"
                            height={350}
                        />
                    </motion.div>
                )}
            </div>

            {/* Info Note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
            >
                <p className="text-sm text-blue-300">
                    <strong>Note:</strong> Demographics data is based on signed-in viewers only.
                    Actual audience may vary.
                </p>
            </motion.div>
        </div>
    );
};
