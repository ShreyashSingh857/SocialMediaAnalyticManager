import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Env Validation
// @ts-ignore
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || Deno.env.get("YOUTUBE_CLIENT_ID");
// @ts-ignore
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || Deno.env.get("YOUTUBE_CLIENT_SECRET");
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// @ts-ignore
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// @ts-ignore
const AI_SERVICE_URL = Deno.env.get("AI_SERVICE_URL") || "http://localhost:8000";

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID");
        if (!GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");
        if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
        if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

        const body = await req.json().catch(() => ({}));
        const { user_id, access_token: reqAccessToken, refresh_token: reqRefreshToken } = body;

        console.log(`Processing sync for user: ${user_id}`);
        if (!user_id) throw new Error("Missing user_id in request body");

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        let { data: account, error: accountError } = await supabase
            .from("connected_accounts")
            .select("*")
            .eq("user_id", user_id)
            .eq("platform", "youtube")
            .maybeSingle();

        if (accountError) throw new Error(`Database error fetching account: ${accountError.message}`);

        let accessToken = reqAccessToken || account?.access_token;
        let refreshToken = reqRefreshToken || account?.refresh_token;

        // If no account exists but we have a token, we must "link" it now
        if (!account && reqAccessToken) {
            console.log("No account found in DB, performing initial link with provided access_token...");
            const tempHeaders = { Authorization: `Bearer ${reqAccessToken}` };
            const channelResp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`, { headers: tempHeaders });

            if (!channelResp.ok) {
                const errText = await channelResp.text();
                throw new Error(`YouTube Channel API failed during linking: ${channelResp.status} ${errText}`);
            }

            const channelData = await channelResp.json();
            const channel = channelData.items?.[0];

            if (channel) {
                console.log(`Linking YouTube channel: ${channel.snippet.title} (${channel.id})`);
                const { data: newAccount, error: createError } = await supabase
                    .from("connected_accounts")
                    .upsert({
                        user_id,
                        platform: "youtube",
                        external_account_id: channel.id,
                        account_name: channel.snippet.title,
                        account_handle: channel.snippet.customUrl,
                        avatar_url: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
                        access_token: reqAccessToken,
                        refresh_token: reqRefreshToken,
                        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                        is_active: true
                    }, { onConflict: 'user_id,platform,external_account_id' })
                    .select()
                    .single();

                if (createError) throw new Error(`Failed to create/update connected_account: ${createError.message}`);
                account = newAccount;
            } else {
                throw new Error("No YouTube channel found for the provided access token.");
            }
        } else if (account && reqRefreshToken && reqRefreshToken !== account.refresh_token) {
            console.log("Updating stored refresh_token...");
            await supabase.from("connected_accounts").update({ refresh_token: reqRefreshToken }).eq("id", account.id);
        }

        if (!account) {
            console.warn(`Sync failed: No YouTube account found for user ${user_id} and no access_token provided.`);
            throw new Error("No YouTube account connected. Please sign in with Google again.");
        }

        // --- TOKEN REFRESH LOGIC ---
        const expiresAt = account.token_expires_at;
        const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() + 300000 : true; // 5 min buffer

        if ((isExpired || !accessToken) && account.refresh_token) {
            console.log("Access token expired or missing. Refreshing...");
            const refreshResp = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    refresh_token: account.refresh_token,
                    grant_type: "refresh_token",
                }),
            });

            const refreshData = await refreshResp.json();
            if (refreshResp.ok) {
                accessToken = refreshData.access_token;
                const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();
                console.log("Token refreshed successfully.");

                await supabase
                    .from("connected_accounts")
                    .update({
                        access_token: accessToken,
                        token_expires_at: newExpiresAt
                    })
                    .eq("id", account.id);
            } else {
                console.error("Failed to refresh token:", refreshData);
                // If refresh token is invalid (e.g. revoked), we might want to tell the user to re-auth
                if (refreshData.error === 'invalid_grant') {
                    throw new Error("YouTube session expired. Please sign in with Google again.");
                }
            }
        }

        if (!accessToken) throw new Error("Could not obtain a valid YouTube access token.");
        const headers = { Authorization: `Bearer ${accessToken}` };

        // 4. Fetch Channel Details (Overview)
        console.log("Fetching channel statistics from YouTube...");
        const channelResp = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true`, { headers });
        if (!channelResp.ok) {
            const err = await channelResp.json().catch(() => ({}));
            throw new Error(`YouTube API Error (Channel): ${channelResp.status} ${JSON.stringify(err)}`);
        }

        const channelData = await channelResp.json();
        const channelItem = channelData.items?.[0];
        if (!channelItem) throw new Error("No YouTube channel found for this account.");

        // Upsert Account Snapshot
        console.log("Recording account snapshot...");
        await supabase.from('account_snapshots').insert({
            account_id: account.id,
            follower_count: parseInt(channelItem.statistics.subscriberCount) || 0,
            total_views: parseInt(channelItem.statistics.viewCount) || 0,
            media_count: parseInt(channelItem.statistics.videoCount) || 0,
            recorded_at: new Date().toISOString()
        });

        // 5. Fetch Analytics Report (Last 30 Days)
        console.log("Fetching YouTube Analytics reports...");
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,subscribersGained&dimensions=day&sort=day`;

        const analyticsResp = await fetch(analyticsUrl, { headers });
        if (!analyticsResp.ok) {
            const err = await analyticsResp.json().catch(() => ({}));
            console.warn("YouTube Analytics API failed. Skipping daily metrics sync.", err);
        } else {
            const analyticsJson = await analyticsResp.json();
            if (analyticsJson.rows) {
                console.log(`Processing ${analyticsJson.rows.length} rows of analytics data...`);
                const dailyMetrics = analyticsJson.rows.map((row: any[]) => ({
                    account_id: account.id,
                    date: row[0],
                    views: row[1],
                    watch_time_hours: parseFloat((row[2] / 60).toFixed(1)),
                    subscribers_gained: row[3]
                }));

                await supabase.from('channel_daily_metrics').upsert(dailyMetrics, { onConflict: 'account_id,date' });
            }
        }

        // 6. Fetch Latest Videos
        console.log("Syncing latest videos...");
        const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;
        const pItemsResp = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=10`, { headers });

        if (!pItemsResp.ok) {
            const err = await pItemsResp.json().catch(() => ({}));
            console.warn("YouTube Playlist API failed. Skipping video sync.", err);
        } else {
            const pItemsData = await pItemsResp.json();
            const videoIds = pItemsData.items?.map((item: any) => item.contentDetails.videoId) || [];

            if (videoIds.length > 0) {
                const statsResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(",")}`, { headers });

                if (statsResp.ok) {
                    const statsData = await statsResp.json();
                    console.log(`Updating ${statsData.items?.length} videos...`);
                    for (const item of statsData.items) {
                        const { data: contentItem, error: itemError } = await supabase
                            .from("content_items")
                            .upsert({
                                account_id: account.id,
                                external_id: item.id,
                                title: item.snippet.title,
                                thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
                                published_at: item.snippet.publishedAt,
                                type: "video"
                            }, { onConflict: "account_id, external_id" })
                            .select()
                            .single();

                        if (!itemError && contentItem) {
                            await supabase.from("content_snapshots").insert({
                                content_id: contentItem.id,
                                views: parseInt(item.statistics.viewCount || "0"),
                                likes: parseInt(item.statistics.likeCount || "0"),
                                comments: parseInt(item.statistics.commentCount || "0"),
                                recorded_at: new Date().toISOString()
                            });
                        }
                    }
                }
            }
        }

        // 7. (Optional) AI Trigger - Removed to use Frontend Trigger
        // The frontend now triggers the AI service directly to ensure valid network reachability (localhost vs cloud).

        return new Response(JSON.stringify({ success: true, channel: channelItem.snippet.title }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
