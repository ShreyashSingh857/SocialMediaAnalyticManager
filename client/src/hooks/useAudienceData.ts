import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DemographicsData {
    ageGroups: { label: string; value: number; color: string }[];
    gender: { label: string; value: number; color: string }[];
    ageGenderMatrix: { age: string; male: number; female: number; other: number }[];
}

export interface GeographyData {
    countries: {
        code: string;
        name: string;
        views: number;
        watchTime: number;
        subscribers: number;
    }[];
}

export interface DeviceData {
    type: string;
    views: number;
    percentage: number;
}

export interface PlatformData {
    type: string;
    views: number;
    percentage: number;
}

export interface SubscriptionSourceData {
    source: string;
    subscribers: number;
    percentage: number;
}

export interface RetentionData {
    newViewers: number;
    returningViewers: number;
    subscribers: number;
    nonSubscribers: number;
}

export interface TrafficSourceData {
    source: string;
    views: number;
    percentage: number;
}

interface AudienceDataState {
    loading: boolean;
    error: string | null;
    demographics: DemographicsData | null;
    geography: GeographyData | null;
    devices: DeviceData[];
    platforms: PlatformData[];
    subscriptionSources: SubscriptionSourceData[];
    retention: RetentionData | null;
    trafficSources: TrafficSourceData[];
}

export const useAudienceData = () => {
    const [data, setData] = useState<AudienceDataState>({
        loading: true,
        error: null,
        demographics: null,
        geography: null,
        devices: [],
        platforms: [],
        subscriptionSources: [],
        retention: null,
        trafficSources: []
    });

    const loadDemographics = async (accountId: string): Promise<DemographicsData | null> => {
        try {
            const { data: dbData, error } = await supabase
                .from('audience_demographics')
                .select('*')
                .eq('account_id', accountId)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            if (!dbData) return null;

            // Transform to chart-friendly format
            const ageGroups = [
                { label: '13-17', value: dbData.age_13_17, color: '#3b82f6' },
                { label: '18-24', value: dbData.age_18_24, color: '#8b5cf6' },
                { label: '25-34', value: dbData.age_25_34, color: '#ec4899' },
                { label: '35-44', value: dbData.age_35_44, color: '#f59e0b' },
                { label: '45-54', value: dbData.age_45_54, color: '#10b981' },
                { label: '55-64', value: dbData.age_55_64, color: '#06b6d4' },
                { label: '65+', value: dbData.age_65_plus, color: '#6366f1' }
            ].filter(item => item.value > 0);

            const gender = [
                { label: 'Male', value: dbData.gender_male, color: '#3b82f6' },
                { label: 'Female', value: dbData.gender_female, color: '#ec4899' },
                { label: 'Other', value: dbData.gender_other, color: '#8b5cf6' }
            ].filter(item => item.value > 0);

            const ageGenderMatrix = dbData.age_gender_breakdown || [];

            return { ageGroups, gender, ageGenderMatrix };
        } catch (err) {
            console.error('Error loading demographics:', err);
            return null;
        }
    };

    const loadGeography = async (accountId: string): Promise<GeographyData | null> => {
        try {
            const { data: dbData, error } = await supabase
                .from('audience_geography')
                .select('*')
                .eq('account_id', accountId)
                .order('views', { ascending: false })
                .limit(50);

            if (error) throw error;
            if (!dbData || dbData.length === 0) return null;

            const countries = dbData.map(item => ({
                code: item.country_code,
                name: item.country_name || item.country_code,
                views: item.views,
                watchTime: item.watch_time_minutes,
                subscribers: item.subscribers_gained
            }));

            return { countries };
        } catch (err) {
            console.error('Error loading geography:', err);
            return null;
        }
    };

    const loadDevices = async (accountId: string): Promise<DeviceData[]> => {
        try {
            const { data: dbData, error } = await supabase
                .from('audience_devices')
                .select('*')
                .eq('account_id', accountId)
                .order('views', { ascending: false });

            if (error) throw error;
            if (!dbData) return [];

            return dbData.map(item => ({
                type: item.device_type,
                views: item.views,
                percentage: item.percentage
            }));
        } catch (err) {
            console.error('Error loading devices:', err);
            return [];
        }
    };

    const loadPlatforms = async (accountId: string): Promise<PlatformData[]> => {
        try {
            const { data: dbData, error } = await supabase
                .from('audience_platforms')
                .select('*')
                .eq('account_id', accountId)
                .order('views', { ascending: false });

            if (error) throw error;
            if (!dbData) return [];

            return dbData.map(item => ({
                type: item.platform_type,
                views: item.views,
                percentage: item.percentage
            }));
        } catch (err) {
            console.error('Error loading platforms:', err);
            return [];
        }
    };

    const loadSubscriptionSources = async (accountId: string): Promise<SubscriptionSourceData[]> => {
        try {
            const { data: dbData, error } = await supabase
                .from('subscription_sources')
                .select('*')
                .eq('account_id', accountId)
                .order('subscribers_gained', { ascending: false });

            if (error) throw error;
            if (!dbData) return [];

            return dbData.map(item => ({
                source: item.source_type,
                subscribers: item.subscribers_gained,
                percentage: item.percentage
            }));
        } catch (err) {
            console.error('Error loading subscription sources:', err);
            return [];
        }
    };

    const loadRetention = async (accountId: string): Promise<RetentionData | null> => {
        try {
            const { data: dbData, error } = await supabase
                .from('audience_retention_segments')
                .select('*')
                .eq('account_id', accountId)
                .is('content_id', null) // Channel-level retention
                .order('recorded_at', { ascending: false });

            if (error) throw error;
            if (!dbData || dbData.length === 0) return null;

            const newViewers = dbData.find(d => d.segment_type === 'new_viewers')?.average_retention || 0;
            const returningViewers = dbData.find(d => d.segment_type === 'returning_viewers')?.average_retention || 0;
            const subscribers = dbData.find(d => d.segment_type === 'subscribers')?.average_retention || 0;
            const nonSubscribers = dbData.find(d => d.segment_type === 'non_subscribers')?.average_retention || 0;

            return { newViewers, returningViewers, subscribers, nonSubscribers };
        } catch (err) {
            console.error('Error loading retention:', err);
            return null;
        }
    };

    const loadTrafficSources = async (accountId: string): Promise<TrafficSourceData[]> => {
        try {
            const { data: dbData, error } = await supabase
                .from('traffic_sources')
                .select('*')
                .eq('account_id', accountId)
                .order('views', { ascending: false });

            if (error) throw error;
            if (!dbData) return [];

            return dbData.map(item => ({
                source: item.source_type,
                views: item.views,
                percentage: item.percentage
            }));
        } catch (err) {
            console.error('Error loading traffic sources:', err);
            return [];
        }
    };

    const fetchData = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            setData(prev => ({ ...prev, loading: false, error: 'User not authenticated' }));
            return;
        }

        try {
            // Get connected YouTube account
            const { data: account } = await supabase
                .from('connected_accounts')
                .select('id')
                .eq('user_id', userId)
                .eq('platform', 'youtube')
                .maybeSingle();

            if (!account) {
                setData(prev => ({ ...prev, loading: false, error: 'No YouTube account connected' }));
                return;
            }

            // Load all audience data in parallel
            const [demographics, geography, devices, platforms, subscriptionSources, retention, trafficSources] = await Promise.all([
                loadDemographics(account.id),
                loadGeography(account.id),
                loadDevices(account.id),
                loadPlatforms(account.id),
                loadSubscriptionSources(account.id),
                loadRetention(account.id),
                loadTrafficSources(account.id)
            ]);

            setData({
                loading: false,
                error: null,
                demographics,
                geography,
                devices,
                platforms,
                subscriptionSources,
                retention,
                trafficSources
            });
        } catch (err: any) {
            console.error('Error in useAudienceData:', err);
            setData(prev => ({ ...prev, loading: false, error: err.message }));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...data, refetch: fetchData };
};
