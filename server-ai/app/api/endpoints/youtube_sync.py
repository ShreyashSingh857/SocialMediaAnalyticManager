"""
YouTube Sync Service
Handles YouTube OAuth token refresh and data synchronization
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import httpx
import json
import os
from datetime import datetime, timedelta
import logging
from app.core.db import supabase
from app.core.config import settings
from app.services.processor import AnalyticsProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "logs"))
LOG_PATH = os.path.join(LOG_DIR, "youtube_sync.log")
os.makedirs(LOG_DIR, exist_ok=True)

if not any(isinstance(handler, logging.FileHandler) and getattr(handler, "baseFilename", None) == LOG_PATH for handler in logger.handlers):
    file_handler = logging.FileHandler(LOG_PATH)
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(file_handler)
router = APIRouter()

class YouTubeSyncRequest(BaseModel):
    user_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

class YouTubeSyncResponse(BaseModel):
    success: bool
    message: str
    channel: Optional[str] = None
    videos_processed: int = 0
    comments_synced: int = 0
    comments_debug: Optional[List[str]] = None

async def fetch_token_info(access_token: str) -> Optional[dict]:
    """Fetch token info to inspect granted scopes."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"access_token": access_token},
                timeout=10.0
            )
            if response.status_code != 200:
                logger.warning(f"Tokeninfo failed: {response.status_code}")
                return None
            return response.json()
    except Exception as e:
        logger.warning(f"Tokeninfo error: {str(e)}")
        return None

async def refresh_youtube_token(client_id: str, client_secret: str, refresh_token: str):
    """Refresh expired YouTube access token"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("access_token"), data.get("expires_in", 3600)
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise

async def fetch_youtube_channel(access_token: str):
    """Fetch current YouTube channel info"""
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={
                "part": "snippet,statistics,contentDetails",
                "mine": "true"
            },
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        return data["items"][0] if data.get("items") else None

async def fetch_youtube_analytics(access_token: str, start_date: str, end_date: str):
    """Fetch YouTube Analytics data"""
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://youtubeanalytics.googleapis.com/v2/reports",
            params={
                "ids": "channel==MINE",
                "startDate": start_date,
                "endDate": end_date,
                "metrics": "views,estimatedMinutesWatched,subscribersGained",
                "dimensions": "day",
                "sort": "day"
            },
            headers=headers
        )
        
        if response.status_code != 200:
            logger.warning(f"Analytics API failed: {response.status_code}")
            return None
        
        return response.json()

async def fetch_latest_videos(access_token: str, uploads_playlist_id: str):
    """Fetch latest videos from channel"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        # Get playlist items
        response = await client.get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            params={
                "part": "snippet,contentDetails",
                "playlistId": uploads_playlist_id,
                "maxResults": 10
            },
            headers=headers
        )
        response.raise_for_status()
        
        playlist_data = response.json()
        video_ids = [item["contentDetails"]["videoId"] for item in playlist_data.get("items", [])]
        
        if not video_ids:
            return []
        
        # Get video statistics
        response = await client.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={
                "part": "statistics,snippet",
                "id": ",".join(video_ids)
            },
            headers=headers
        )
        response.raise_for_status()
        return response.json().get("items", [])

async def fetch_video_comments(access_token: str, video_id: str):
    """Fetch comments for a specific video"""
    try:
        logger.debug(f"🔍 Starting comment fetch for video_id: {video_id}")
        logger.debug(f"🔐 Token preview: {access_token[:20]}...{access_token[-20:]}")
        
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            logger.debug(f"📡 Making API call to YouTube commentThreads endpoint...")
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/commentThreads",
                params={
                    "part": "snippet",
                    "videoId": video_id,
                    "maxResults": 100,
                    "order": "time",
                    "textFormat": "plainText"
                },
                headers=headers,
                timeout=10.0
            )
            
            logger.info(f"📊 YouTube API Response Status: {response.status_code} for video {video_id}")
            
            if response.status_code != 200:
                logger.warning(f"⚠️ Comments API failed for video {video_id}: {response.status_code}")
                response_text = response.text[:800]
                logger.warning(f"Response body: {response_text}")
                
                # Log the actual JSON error if available
                try:
                    error_json = response.json()
                    logger.warning(f"API Error JSON: {json.dumps(error_json, indent=2)}")
                except:
                    pass
                
                try:
                    error_json = response.json()
                    reason = error_json.get("error", {}).get("errors", [{}])[0].get("reason")
                    return [], f"api_error={response.status_code};reason={reason or 'unknown'}"
                except Exception:
                    return [], f"api_error={response.status_code}"
            
            data = response.json()
            items_count = len(data.get('items', []))
            logger.info(f"✅ API Response received: {items_count} comment threads for video {video_id}")
            
            # Log the full response for debugging
            if items_count == 0:
                logger.warning(f"⚠️ YouTube returned 0 comments for video {video_id}")
                logger.debug(f"Full API response: {json.dumps(data, indent=2)[:500]}")
            
            comments = []
            
            for idx, thread in enumerate(data.get("items", [])):
                try:
                    top_comment = thread["snippet"]["topLevelComment"]
                    snippet = top_comment["snippet"]
                    comment_obj = {
                        "id": top_comment["id"],
                        "author_name": snippet["authorDisplayName"],
                        "author_avatar": snippet["authorProfileImageUrl"],
                        "text_display": snippet["textDisplay"],
                        "like_count": snippet["likeCount"],
                        "published_at": snippet["publishedAt"]
                    }
                    comments.append(comment_obj)
                    logger.debug(f"  ✓ Parsed comment {idx + 1}: {snippet['authorDisplayName']}")
                except (KeyError, TypeError) as e:
                    logger.warning(f"❌ Failed to parse comment {idx}: {str(e)}")
                    continue
            
            logger.info(f"✅ Fetched {len(comments)} comments for video {video_id}")
            
            return comments, f"api_ok={items_count}"
    except Exception as e:
        logger.error(f"❌ Exception in fetch_video_comments for video {video_id}: {str(e)}", exc_info=True)
        return [], f"exception={type(e).__name__}"

@router.post("/sync", response_model=YouTubeSyncResponse)
async def sync_youtube(request: YouTubeSyncRequest, background_tasks: BackgroundTasks):
    """
    Sync YouTube data for a user
    - Refreshes expired tokens
    - Fetches channel statistics
    - Syncs videos and comments
    - Stores data in Supabase
    """
    try:
        user_id = request.user_id
        logger.info(f"Processing YouTube sync for user: {user_id}")
        
        if not user_id:
            raise HTTPException(status_code=400, detail="Missing user_id")
        
        # Fetch existing account from database
        account_resp = supabase.table("connected_accounts").select("*").eq("user_id", user_id).eq("platform", "youtube").maybeSingle().execute()
        account = account_resp.data if account_resp.data else None
        
        access_token = request.access_token or (account.get("access_token") if account else None)
        refresh_token = request.refresh_token or (account.get("refresh_token") if account else None)
        
        # If no account but we have token, perform initial link
        if not account and request.access_token:
            logger.info("No account found, performing initial link...")
            channel = await fetch_youtube_channel(request.access_token)
            
            if not channel:
                raise HTTPException(status_code=400, detail="No YouTube channel found")
            
            account_data = {
                "user_id": user_id,
                "platform": "youtube",
                "external_account_id": channel["id"],
                "account_name": channel["snippet"]["title"],
                "account_handle": channel["snippet"].get("customUrl", ""),
                "avatar_url": (channel["snippet"]["thumbnails"].get("high") or channel["snippet"]["thumbnails"]["default"])["url"],
                "access_token": request.access_token,
                "refresh_token": request.refresh_token,
                "token_expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
                "is_active": True
            }
            
            account_resp = supabase.table("connected_accounts").upsert(account_data).execute()
            account = account_resp.data[0] if account_resp.data else None
        
        if not account:
            raise HTTPException(status_code=400, detail="No YouTube account connected")
        
        # Check if token needs refresh
        expires_at = account.get("token_expires_at")
        needs_refresh = False
        
        if expires_at:
            expires_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            needs_refresh = expires_dt < (datetime.utcnow() + timedelta(minutes=5))
        else:
            needs_refresh = True
        
        if needs_refresh and refresh_token:
            logger.info("Refreshing YouTube access token...")
            try:
                new_access_token, expires_in = await refresh_youtube_token(
                    settings.GOOGLE_CLIENT_ID,
                    settings.GOOGLE_CLIENT_SECRET,
                    refresh_token
                )
                access_token = new_access_token
                new_expires_at = (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat()
                
                supabase.table("connected_accounts").update({
                    "access_token": access_token,
                    "token_expires_at": new_expires_at
                }).eq("id", account["id"]).execute()
                
                logger.info("Token refreshed successfully")
            except Exception as e:
                logger.error(f"Token refresh failed: {str(e)}")
                raise HTTPException(status_code=401, detail="YouTube session expired. Please sign in again.")
        
        if not access_token:
            raise HTTPException(status_code=401, detail="No valid YouTube access token")

        comments_debug: List[str] = []
        token_info = await fetch_token_info(access_token)
        if token_info:
            scopes = token_info.get("scope", "")
            comments_debug.append(f"token_scopes={scopes}")
            logger.info(f"Token scopes: {scopes}")
        
        # Fetch channel info
        logger.info("Fetching YouTube channel information...")
        channel = await fetch_youtube_channel(access_token)
        
        if not channel:
            raise HTTPException(status_code=400, detail="Could not fetch YouTube channel")
        
        # Record account snapshot
        supabase.table("account_snapshots").insert({
            "account_id": account["id"],
            "follower_count": int(channel["statistics"].get("subscriberCount", 0)),
            "total_views": int(channel["statistics"].get("viewCount", 0)),
            "media_count": int(channel["statistics"].get("videoCount", 0)),
            "recorded_at": datetime.utcnow().isoformat()
        }).execute()
        
        # Fetch analytics data (last 30 days)
        logger.info("Fetching YouTube analytics...")
        end_date = datetime.utcnow().date().isoformat()
        start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
        
        analytics_data = await fetch_youtube_analytics(access_token, start_date, end_date)
        
        if analytics_data and analytics_data.get("rows"):
            logger.info(f"Processing {len(analytics_data['rows'])} days of analytics")
            daily_metrics = []
            for row in analytics_data["rows"]:
                daily_metrics.append({
                    "account_id": account["id"],
                    "date": row[0],
                    "views": row[1],
                    "watch_time_hours": round(row[2] / 60, 1),
                    "subscribers_gained": row[3]
                })
            
            if daily_metrics:
                supabase.table("channel_daily_metrics").upsert(daily_metrics).execute()
        
        # Fetch and sync videos
        logger.info("Syncing latest videos...")
        uploads_playlist_id = channel["contentDetails"]["relatedPlaylists"]["uploads"]
        videos = await fetch_latest_videos(access_token, uploads_playlist_id)
        
        comments_synced = 0
        
        for video in videos:
            video_data = {
                "account_id": account["id"],
                "external_id": video["id"],
                "title": video["snippet"]["title"],
                "thumbnail_url": (video["snippet"]["thumbnails"].get("high") or video["snippet"]["thumbnails"]["default"])["url"],
                "published_at": video["snippet"]["publishedAt"],
                "type": "video",
                "url": f"https://youtube.com/watch?v={video['id']}"
            }
            
            content_resp = supabase.table("content_items").upsert(video_data).select("*").execute()
            
            if content_resp.data:
                content_item = content_resp.data[0]
                
                # Record snapshot
                supabase.table("content_snapshots").insert({
                    "content_id": content_item["id"],
                    "views": int(video["statistics"].get("viewCount", 0)),
                    "likes": int(video["statistics"].get("likeCount", 0)),
                    "comments": int(video["statistics"].get("commentCount", 0)),
                    "recorded_at": datetime.utcnow().isoformat()
                }).execute()
                
                video_comment_count = int(video["statistics"].get("commentCount", 0))
                comments_debug.append(f"{video['id']}: commentCount={video_comment_count}")

                # Fetch and sync comments
                logger.info(f"📝 Fetching comments for video {video['id']}...")
                comments, comments_fetch_debug = await fetch_video_comments(access_token, video["id"])
                logger.info(f"📊 Comments fetch returned: {len(comments) if comments else 0} comments")
                if comments_fetch_debug:
                    comments_debug.append(f"{video['id']}: {comments_fetch_debug}")
                if comments:
                    try:
                        comment_records = [
                            {
                                **comment,
                                "video_id": content_item["id"],
                                "updated_at": datetime.utcnow().isoformat()
                            }
                            for comment in comments
                        ]
                        logger.debug(f"Attempting to UPSERT {len(comment_records)} comments to DB")
                        logger.debug(f"Comment record structure: {comment_records[0] if comment_records else 'N/A'}")
                        
                        result = supabase.table("video_comments").upsert(comment_records).execute()
                        result_error = getattr(result, "error", None)
                        if result_error:
                            logger.error(f"❌ DB error while saving comments for video {video['id']}: {result_error}")
                            comments_debug.append(f"{video['id']}: db_error={result_error}")
                        
                        if result.data:
                            logger.info(f"💾 Successfully saved {len(comment_records)} comments for video {video['id']}")
                        else:
                            logger.warning(f"⚠️ UPSERT returned no data for video {video['id']}")
                        
                        comments_synced += len(comments)
                        comments_debug.append(f"{video['id']}: fetched={len(comments)} saved={len(comment_records)}")
                    except Exception as e:
                        logger.error(f"❌ Failed to save comments for video {video['id']}: {str(e)}")
                        logger.error(f"Exception type: {type(e).__name__}")
                        import traceback
                        logger.error(f"Traceback: {traceback.format_exc()}")
                        comments_debug.append(f"{video['id']}: exception={type(e).__name__}")
                else:
                    logger.info(f"ℹ️ No comments to save for video {video['id']}")
                    if video_comment_count > 0:
                        comments_debug.append(f"{video['id']}: warning=commentCount>0 but fetched=0")
            else:
                logger.warning(f"⚠️ content_items upsert returned no data for video {video['id']}")
                comments_debug.append(f"{video['id']}: content_item_upsert_no_data")
        
        logger.info(f"YouTube sync completed. Videos: {len(videos)}, Comments: {comments_synced}")
        
        # 4. Calculate Analytics Insights (linear regression, trends, etc.)
        logger.info(f"Calculating analytics insights for account...")
        try:
            processor = AnalyticsProcessor(account["id"])
            
            # Fetch data and calculate insights
            history = processor.fetch_history()
            videos_data = processor.fetch_video_stats()
            
            # Calculate trends
            history_insights = processor.process_daily_metrics(history)
            video_insights = processor.process_video_stats(videos_data)
            
            # Save insights to database
            await processor.save_insights("weekly_trend", history_insights)
            await processor.save_insights("engagement_summary", video_insights)
            
            logger.info(f"Analytics insights calculated and saved successfully")
        except Exception as e:
            logger.warning(f"Failed to calculate analytics insights: {str(e)}")
            # Don't fail the entire sync if insights calculation fails
        
        return YouTubeSyncResponse(
            success=True,
            message="YouTube sync completed successfully",
            channel=channel["snippet"]["title"],
            videos_processed=len(videos),
            comments_synced=comments_synced,
            comments_debug=comments_debug
        )
        
    except Exception as e:
        logger.error(f"YouTube sync error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"YouTube sync error: {str(e)}")

