import React from 'react';
import { useAudienceData } from '../hooks/useAudienceData';
import { DemographicsSection } from '../components/audience/DemographicsSection';
import { GeographySection } from '../components/audience/GeographySection';
import { DevicePlatformSection } from '../components/audience/DevicePlatformSection';
import { SubscriptionSection } from '../components/audience/SubscriptionSection';
import { TrafficSourcesSection } from '../components/audience/TrafficSourcesSection';
import { RefreshIndicator } from '../components/RefreshIndicator';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Audience: React.FC = () => {
    const {
        loading,
        error,
        demographics,
        geography,
        devices,
        platforms,
        subscriptionSources,
        trafficSources,
        refetch
    } = useAudienceData();

    // Error State
    if (error) {
        return (
            <div className="p-8 text-white min-h-screen bg-[#0f1014] flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-md text-center">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error Loading Audience Data</h2>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-12 bg-[#0f1014] min-h-screen text-white">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-start"
            >
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Audience Insights
                    </h1>
                    <p className="text-gray-400">
                        Understand who's watching your content and where they're from
                    </p>
                </div>
                <RefreshIndicator
                    isRefreshing={loading}
                    lastUpdated={new Date()}
                    onRefresh={refetch}
                />
            </motion.header>

            {/* Demographics Section */}
            <DemographicsSection data={demographics} loading={loading} />

            {/* Geography Section */}
            <GeographySection data={geography} loading={loading} />

            {/* Traffic Sources Section */}
            <TrafficSourcesSection data={trafficSources} loading={loading} />

            {/* Devices & Platforms Section */}
            <DevicePlatformSection
                devices={devices}
                platforms={platforms}
                loading={loading}
            />

            {/* Subscription Sources Section */}
            <SubscriptionSection data={subscriptionSources} loading={loading} />

            {/* Footer Note */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6 text-center"
                >
                    <p className="text-sm text-gray-400">
                        Data is updated daily from YouTube Analytics. Some metrics may have a 24-48 hour delay.
                    </p>
                </motion.div>
            )}
        </div>
    );
};
