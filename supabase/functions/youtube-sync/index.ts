import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Parse Input
        const { user_id } = await req.json();
        if (!user_id) throw new Error("Missing user_id");

        // 2. Initialize Admin Client (Bypass RLS)
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 3. Get User's YouTube Credentials
        const { data: account, error: accountError } = await supabase
            .from("connected_accounts")
            .select("*")
            .eq("user_id", user_id)
            .eq("platform", "youtube")
            .single();

        if (accountError || !account) {
            throw new Error("No YouTube account connected for this user");
        }

        const accessToken = account.access_token;
        // NOTE: In a real prod app, you'd check `token_expires_at` and refresh if needed here.

        // 4. Resolve "Uploads" Playlist ID
        let uploadsPlaylistId = account.platform_metadata?.uploads_playlist_id;

        if (!uploadsPlaylistId) {
            console.log("Fetching uploads playlist ID...");
            const channelResp = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const channelData = await channelResp.json();

            if (!channelResp.ok) throw new Error(`YouTube API Error (Channel): ${JSON.stringify(channelData)}`);

            uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

            if (uploadsPlaylistId) {
                // Save it for future efficiency
                await supabase
                    .from("connected_accounts")
                    .update({
                        platform_metadata: { ...account.platform_metadata, uploads_playlist_id: uploadsPlaylistId }
                    })
                    .eq("id", account.id);
            } else {
                throw new Error("Could not find uploads playlist");
            }
        }

        // 5. Fetch Latest Videos from Playlist
        console.log(`Fetching videos from playlist ${uploadsPlaylistId}...`);
        const videosResp = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=10`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const videosData = await videosResp.json();

        if (!videosResp.ok) throw new Error(`YouTube API Error (Playlist): ${JSON.stringify(videosData)}`);

        const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId);

        // 6. Fetch Video Statistics
        console.log(`Fetching stats for ${videoIds.length} videos...`);
        const statsResp = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds.join(",")}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const statsData = await statsResp.json();

        if (!statsResp.ok) throw new Error(`YouTube API Error (Stats): ${JSON.stringify(statsData)}`);

        // 7. Process & Upsert Data
        const results = [];

        for (const item of statsData.items) {
            // A. Upsert Content Item
            const { data: contentItem, error: itemError } = await supabase
                .from("content_items")
                .upsert({
                    account_id: account.id,
                    external_id: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    url: `https://www.youtube.com/watch?v=${item.id}`,
                    thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
                    published_at: item.snippet.publishedAt,
                    type: "video",
                    static_metadata: {
                        duration: item.contentDetails.duration,
                        channelTitle: item.snippet.channelTitle
                    }
                }, { onConflict: "account_id, external_id" })
                .select()
                .single();

            if (itemError) {
                console.error(`Error saving item ${item.id}:`, itemError);
                continue;
            }

            // B. Insert Snapshot
            const { error: snapError } = await supabase
                .from("content_snapshots")
                .insert({
                    content_id: contentItem.id,
                    views: parseInt(item.statistics.viewCount || "0"),
                    likes: parseInt(item.statistics.likeCount || "0"),
                    comments: parseInt(item.statistics.commentCount || "0"),
                    engagement_rate: 0, // Calculate if desired
                    raw_data: item.statistics // Save raw stats just in case
                });

            if (snapError) console.error(`Error saving snapshot for ${item.id}:`, snapError);

            results.push({ id: item.id, title: item.snippet.title });
        }

        return new Response(JSON.stringify({ success: true, processed: results.length, data: results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
