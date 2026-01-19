from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from app.services.processor import AnalyticsProcessor
from app.core.db import supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ProcessRequest(BaseModel):
    account_id: str
    user_id: Optional[str] = None  # Can provide user_id as alternative
    # history/videos removed as we now fetch them internally

async def run_processing(payload: ProcessRequest):
    try:
        logger.info(f"Starting analytics processing for account: {payload.account_id}")
        processor = AnalyticsProcessor(payload.account_id)
        
        # 1. Fetch Data
        history = processor.fetch_history()
        videos = processor.fetch_video_stats()
        
        # 2. Process History
        history_insights = processor.process_daily_metrics(history)
        
        # 3. Process Videos
        video_insights = processor.process_video_stats(videos)
        
        # 4. Save Results
        await processor.save_insights("weekly_trend", history_insights)
        await processor.save_insights("engagement_summary", video_insights)
        
        logger.info(f"Successfully processed analytics for account: {payload.account_id}")
    except Exception as e:
        logger.error(f"Error processing analytics for {payload.account_id}: {str(e)}")

@router.post("/process")
async def process_analytics(request: ProcessRequest):
    """
    Endpoint to trigger data processing synchronously.
    Can provide either account_id directly OR user_id to lookup the YouTube account.
    """
    try:
        account_id = request.account_id
        
        # If user_id provided but no account_id, look it up
        if not account_id and request.user_id:
            logger.info(f"Looking up YouTube account for user: {request.user_id}")
            account_resp = supabase.table("connected_accounts") \
                .select("id") \
                .eq("user_id", request.user_id) \
                .eq("platform", "youtube") \
                .maybeSingle() \
                .execute()
            
            if not account_resp.data:
                raise HTTPException(status_code=404, detail="No YouTube account found for user")
            account_id = account_resp.data["id"]
        
        if not account_id:
            raise HTTPException(status_code=400, detail="Must provide account_id or user_id")
        
        logger.info(f"Received processing request for account: {account_id}")
        await run_processing(ProcessRequest(account_id=account_id))
        return {
            "message": "Analytics processing completed successfully", 
            "status": "completed",
            "account_id": account_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
