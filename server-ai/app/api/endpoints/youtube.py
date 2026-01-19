from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import os
from datetime import datetime
from supabase import create_client, Client

router = APIRouter()

class YouTubeSyncRequest(BaseModel):
    user_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

class YouTubeSyncResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

# Get credentials from environment
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("YOUTUBE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET") or os.getenv("YOUTUBE_CLIENT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

@router.post("/sync", response_model=YouTubeSyncResponse)
async def sync_youtube(request: YouTubeSyncRequest):
    """
    Sync YouTube data for a user.
    This endpoint fetches YouTube channel data, analytics, and videos.
    """
    try:
        print("[YouTube] ===== SYNC REQUEST STARTED =====")
        print(f"[YouTube] User ID: {request.user_id}")
        print(f"[YouTube] Has access token: {bool(request.access_token)}")
        print(f"[YouTube] Has refresh token: {bool(request.refresh_token)}")
        
        # Validate environment - Google credentials are optional if we have a valid access token
        print(f"[YouTube] GOOGLE_CLIENT_ID present: {bool(GOOGLE_CLIENT_ID)}")
        print(f"[YouTube] GOOGLE_CLIENT_SECRET present: {bool(GOOGLE_CLIENT_SECRET)}")
        
        if not SUPABASE_URL:
            print("[YouTube] ERROR: Missing SUPABASE_URL environment variable")
            raise HTTPException(status_code=500, detail="Missing Supabase URL")
        
        if not SUPABASE_SERVICE_ROLE_KEY:
            print("[YouTube] ERROR: Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
            raise HTTPException(status_code=500, detail="Missing Supabase service role key")
        
        user_id = request.user_id
        access_token = request.access_token
        
        if not user_id:
            raise HTTPException(status_code=400, detail="Missing user_id")
        
        if not access_token:
            print("[YouTube] ERROR: No access token provided")
            raise HTTPException(status_code=401, detail="No YouTube access token. Please provide access_token.")
        
        print("[YouTube] Credentials validated successfully")
        print("[YouTube] Fetching YouTube channel data...")
        
        # Fetch channel details
        async with httpx.AsyncClient() as client:
            channel_resp = await client.get(
                "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=30.0
            )
        
        print(f"[YouTube] Channel API response status: {channel_resp.status_code}")
        
        if channel_resp.status_code != 200:
            error_text = channel_resp.text[:500]  # Limit error text
            print(f"[YouTube] ERROR: YouTube API error: {channel_resp.status_code} {error_text}")
            raise HTTPException(status_code=400, detail=f"YouTube API error: {channel_resp.status_code}")
        
        channel_data = channel_resp.json()
        channel_item = channel_data.get("items", [{}])[0] if channel_data.get("items") else {}
        
        if not channel_item:
            print("[YouTube] ERROR: No YouTube channel found in response")
            raise HTTPException(status_code=400, detail="No YouTube channel found")
        
        # Extract channel info
        subscriber_count = int(channel_item.get("statistics", {}).get("subscriberCount", 0))
        view_count = int(channel_item.get("statistics", {}).get("viewCount", 0))
        video_count = int(channel_item.get("statistics", {}).get("videoCount", 0))
        channel_name = channel_item.get("snippet", {}).get("title", "Unknown")
        
        print(f"[YouTube] Success! Channel: {channel_name}")
        print(f"[YouTube] Subscribers: {subscriber_count}, Views: {view_count}, Videos: {video_count}")
        
        # Save to database
        print("[YouTube] Saving data to database...")
        try:
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            
            # Get or create connected account
            channel_id = channel_item.get("id", "")
            print(f"[YouTube] Channel ID: {channel_id}")
            
            # Check if account exists
            account_result = supabase.table("connected_accounts").select("*").eq("user_id", user_id).eq("platform", "youtube").execute()
            
            if account_result.data and len(account_result.data) > 0:
                account_id = account_result.data[0]["id"]
                print(f"[YouTube] Found existing account: {account_id}")
                
                # Update the account
                supabase.table("connected_accounts").update({
                    "account_name": channel_name,
                    "external_account_id": channel_id,
                    "access_token": access_token,
                    "refresh_token": request.refresh_token,
                    "last_synced_at": datetime.utcnow().isoformat(),
                    "platform_metadata": {
                        "subscriber_count": subscriber_count,
                        "view_count": view_count,
                        "video_count": video_count
                    }
                }).eq("id", account_id).execute()
                print("[YouTube] Updated existing account")
            else:
                # Create new account
                print("[YouTube] Creating new account...")
                insert_result = supabase.table("connected_accounts").insert({
                    "user_id": user_id,
                    "platform": "youtube",
                    "external_account_id": channel_id,
                    "account_name": channel_name,
                    "access_token": access_token,
                    "refresh_token": request.refresh_token,
                    "last_synced_at": datetime.utcnow().isoformat(),
                    "platform_metadata": {
                        "subscriber_count": subscriber_count,
                        "view_count": view_count,
                        "video_count": video_count
                    }
                }).execute()
                account_id = insert_result.data[0]["id"]
                print(f"[YouTube] Created new account: {account_id}")
            
            # Create account snapshot
            print("[YouTube] Creating account snapshot...")
            supabase.table("account_snapshots").insert({
                "account_id": account_id,
                "follower_count": subscriber_count,
                "total_views": view_count,
                "recorded_at": datetime.utcnow().isoformat()
            }).execute()
            print("[YouTube] Snapshot created successfully")
            
        except Exception as db_error:
            print(f"[YouTube] Database error: {type(db_error).__name__}: {str(db_error)}")
            # Don't fail the whole request if DB save fails
            import traceback
            traceback.print_exc()
        
        print("[YouTube] ===== SYNC COMPLETED SUCCESSFULLY =====")
        
        return YouTubeSyncResponse(
            success=True,
            message="YouTube sync completed successfully",
            data={
                "channel_name": channel_name,
                "subscribers": subscriber_count,
                "views": view_count,
                "videos": video_count
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[YouTube] EXCEPTION: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"YouTube sync error: {str(e)[:200]}")
