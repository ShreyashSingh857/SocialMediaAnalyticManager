export interface YouTubeStats {
    id: string;
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
                id: channel.id,
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

export const fetchFullAnalyticsDebug = async (providerToken: string) => {
    console.log("--- STARTING FULL YOUTUBE DATA FETCH DEBUG ---");
    const headers = { Authorization: `Bearer ${providerToken}` };

    try {
        // 1. Channel Details (inc. Content Details for Uploads Playlist)
        console.log("\n1. Fetching Channel Details...");
        const channelResp = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true', { headers });
        const channelData = await channelResp.json();
        console.log("Channel Data:", channelData);

        if (!channelData.items?.length) {
            console.warn("No channel found.");
            return;
        }

        const channelId = channelData.items[0].id;
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        console.log(`Channel ID: ${channelId}, Uploads Playlist: ${uploadsPlaylistId}`);

        // 2. Recent Videos from Uploads Playlist
        console.log("\n2. Fetching Recent Videos (PlaylistItems)...");
        const playlistResp = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10`, { headers });
        const playlistData = await playlistResp.json();
        console.log("Recent Videos (PlaylistItems):", playlistData);

        if (playlistData.items?.length) {
            const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

            // 3. Detailed Video Stats
            console.log("\n3. Fetching Detailed Video Stats...");
            const videosResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`, { headers });
            const videosData = await videosResp.json();
            console.log("Video Stats (videos.list):", videosData);
        }

        // 4. Analytics Report (Last 30 Days)
        console.log("\n4. Fetching Analytics Report (Last 30 Days)...");
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost&dimensions=day&sort=day`;

        console.log(`Requesting Analytics: ${analyticsUrl}`);
        const analyticsResp = await fetch(analyticsUrl, { headers });

        if (!analyticsResp.ok) {
            const errText = await analyticsResp.text();
            console.error("Analytics API Error:", analyticsResp.status, errText);
        } else {
            const analyticsData = await analyticsResp.json();
            console.log("Analytics Report Data:", analyticsData);
        }

    } catch (error) {
        console.error("FATAL ERROR IN DEBUG FETCH:", error);
    }
    console.log("--- END DEBUG FETCH ---");
};
