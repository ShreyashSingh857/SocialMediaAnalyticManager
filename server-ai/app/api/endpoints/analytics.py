from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from app.services.processor import AnalyticsProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ProcessRequest(BaseModel):
    account_id: str
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
    Endpoint to trigger data processing synchronously (for now).
    """
    try:
        logger.info(f"Received processing request for account: {request.account_id}")
        await run_processing(request)
        return {
            "message": "Processing completed", 
            "status": "completed",
            "account_id": request.account_id
        }
    except Exception as e:
        logger.error(f"Failed to queue processing for {request.account_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
