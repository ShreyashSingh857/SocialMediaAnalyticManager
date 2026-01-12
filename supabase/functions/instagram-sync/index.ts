import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { user_id, access_token } = await req.json();

        if (!access_token) {
            throw new Error("Missing 'access_token'");
        }

        // 1. Fetch User's Pages to find Instagram Business Account
        console.log("Fetching Facebook Accounts...");
        const accountsResp = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${access_token}&fields=name,access_token,instagram_business_account`);

        if (!accountsResp.ok) {
            const err = await accountsResp.text();
            throw new Error(`FB Accounts API Error: ${err}`);
        }

        const accountsData = await accountsResp.json();

        // Find the first account with an IG Business Account connected
        const pageWithIG = accountsData.data?.find((page: any) => page.instagram_business_account);

        if (!pageWithIG) {
            return new Response(JSON.stringify({
                success: false,
                message: "No Instagram Business Account found linked to your Facebook Pages. Please ensure your Instagram is switched to 'Business' and linked to a Facebook Page."
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const igUserId = pageWithIG.instagram_business_account.id;
        console.log(`Found IG Business Account: ${igUserId} on Page: ${pageWithIG.name}`);

        // 2. Fetch IG Account Details
        const igAccountResp = await fetch(`https://graph.facebook.com/v19.0/${igUserId}?fields=biography,id,username,profile_picture_url,followers_count,media_count&access_token=${access_token}`);
        if (!igAccountResp.ok) {
            const err = await igAccountResp.text();
            throw new Error(`IG Account API Error: ${err}`);
        }
        const igProfile = await igAccountResp.json();

        // 3. Upsert Connected Account
        const { error: dbError } = await supabase
            .from("connected_accounts")
            .upsert({
                user_id: user_id,
                platform: "instagram",
                external_account_id: igProfile.id,
                account_name: igProfile.username || pageWithIG.name,
                account_handle: igProfile.username,
                avatar_url: igProfile.profile_picture_url,
                follower_count: igProfile.followers_count,
                media_count: igProfile.media_count,
                access_token: access_token, // Converting user token. Ideally, use long-lived page token if meant for offline access
                is_active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,platform,external_account_id' });

        if (dbError) throw dbError;

        // 4. Fetch Recent Media (Last 25 posts)
        const mediaResp = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media?fields=caption,id,is_shared_to_feed,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count,insights.metric(engagement,impressions,reach)&limit=25&access_token=${access_token}`);

        let mediaSyncedCount = 0;

        if (mediaResp.ok) {
            const mediaData = await mediaResp.json();
            const mediaItems = mediaData.data || [];

            for (const item of mediaItems) {
                // Determine metrics from insights if available, or basic fields
                let views = 0;
                let reach = 0;
                let engagement = 0;

                if (item.insights?.data) {
                    item.insights.data.forEach((metric: any) => {
                        if (metric.name === 'impressions') views = metric.values[0].value;
                        if (metric.name === 'reach') reach = metric.values[0].value;
                        // Engagement might be sum of likes/comments or explicit metric
                        if (metric.name === 'engagement') engagement = metric.values[0].value;
                    });
                }

                // If engagement metric missing, use likes + comments
                if (engagement === 0) {
                    engagement = (item.like_count || 0) + (item.comments_count || 0);
                }

                // Upsert Content Item
                const { error: contentError } = await supabase
                    .from("content_items")
                    .upsert({
                        account_id: (await supabase.from('connected_accounts').select('id').eq('external_account_id', igUserId).single()).data?.id,
                        external_id: item.id,
                        title: item.caption?.substring(0, 100) || 'Untitled Post', // IG doesn't have titles, use caption
                        description: item.caption,
                        type: item.media_type === 'VIDEO' ? 'reel' : 'post', // Simplification
                        thumbnail_url: item.thumbnail_url || item.media_url, // thumbnail_url only for videos
                        published_at: item.timestamp,
                        url: item.permalink,
                        platform: 'instagram'
                    }, { onConflict: 'external_id' })
                    .select()
                    .single();

                if (!contentError) {
                    // Start a snapshot
                    // We need the content_item UUID. 
                    // To be safe, we should probably fetch it or rely on the return if upsert supports it (it does with select)
                    // Added .select() above.

                    // Actually, let's just re-query or use the returned data if possible.
                    // Doing a separate insert for snapshot to keep logic simple/robust?
                    // Let's use the returned data.
                    const contentItem = (await supabase.from('content_items').select('id').eq('external_id', item.id).single()).data;

                    if (contentItem) {
                        await supabase
                            .from("content_snapshots")
                            .insert({
                                content_item_id: contentItem.id,
                                views: views,
                                likes: item.like_count || 0,
                                comments: item.comments_count || 0,
                                shares: 0, // Not always available
                                engagement_rate: views > 0 ? (engagement / views) * 100 : 0
                            });
                        mediaSyncedCount++;
                    }
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            account: igProfile.username,
            sync_stats: {
                followers: igProfile.followers_count,
                media_synced: mediaSyncedCount
            }
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("IG Sync Error:", error.message);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
