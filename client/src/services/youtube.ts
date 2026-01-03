export interface YouTubeStats {
    channelName: string;
    subscribers: string;
    views: string;
    videos: string;
    thumbnail: string;
    customUrl: string;
}

export const fetchYouTubeStats = async (providerToken: string): Promise<YouTubeStats | null> => {
    try {
        const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true', {
            headers: {
                Authorization: `Bearer ${providerToken}`,
            },
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            console.error('YouTube API Error Body:', errorBody);
            throw new Error(`YouTube API error: ${response.status} ${response.statusText} - ${errorBody?.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const channel = data.items[0];
            return {
                channelName: channel.snippet.title,
                subscribers: channel.statistics.subscriberCount,
                views: channel.statistics.viewCount,
                videos: channel.statistics.videoCount,
                thumbnail: channel.snippet.thumbnails?.default?.url || '',
                customUrl: channel.snippet.customUrl
            };
        }

        return null; // No channel found
    } catch (error) {
        console.error('Error fetching YouTube stats:', error);
        throw error;
    }
};
