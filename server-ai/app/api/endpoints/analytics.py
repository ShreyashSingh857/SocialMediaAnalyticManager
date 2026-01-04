from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.processor import AnalyticsProcessor

router = APIRouter()

class ProcessRequest(BaseModel):
    account_id: str
    history: List[Dict[str, Any]] # Daily metrics
    videos: List[Dict[str, Any]] # Video stats

async def run_processing(payload: ProcessRequest):
    processor = AnalyticsProcessor(payload.account_id)
    
    # 1. Process History
    history_insights = processor.process_daily_metrics(payload.history)
    
    # 2. Process Videos
    video_insights = processor.process_video_stats(payload.videos)
    
    # 3. Save Results
    await processor.save_insights("weekly_trend", history_insights)
    await processor.save_insights("engagement_summary", video_insights)
    
    return {
        "weekly_trend": history_insights,
        "engagement_summary": video_insights
    }

@router.post("/process")
async def process_analytics(request: ProcessRequest):
    """
    Endpoint to trigger data processing.
    Processes synchronously and returns results for debugging.
    """
    try:
        results = await run_processing(request)
        return {
            "message": "Processing complete", 
            "status": "success",
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
