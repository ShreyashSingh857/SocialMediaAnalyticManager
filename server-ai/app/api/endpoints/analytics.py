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
    history: List[Dict[str, Any]] # Daily metrics
    videos: List[Dict[str, Any]] # Video stats

async def run_processing(payload: ProcessRequest):
    try:
        logger.info(f"Starting analytics processing for account: {payload.account_id}")
        processor = AnalyticsProcessor(payload.account_id)
        
        # 1. Process History
        history_insights = processor.process_daily_metrics(payload.history)
        
        # 2. Process Videos
        video_insights = processor.process_video_stats(payload.videos)
        
        # 3. Save Results
        await processor.save_insights("weekly_trend", history_insights)
        await processor.save_insights("engagement_summary", video_insights)
        
        logger.info(f"Successfully processed analytics for account: {payload.account_id}")
    except Exception as e:
        logger.error(f"Error processing analytics for {payload.account_id}: {str(e)}")

@router.post("/process")
async def process_analytics(request: ProcessRequest, background_tasks: BackgroundTasks):
    """
    Endpoint to trigger data processing asynchronously.
    """
    try:
        logger.info(f"Received processing request for account: {request.account_id}")
        background_tasks.add_task(run_processing, request)
        return {
            "message": "Processing started in background", 
            "status": "accepted",
            "account_id": request.account_id
        }
    except Exception as e:
        logger.error(f"Failed to queue processing for {request.account_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
