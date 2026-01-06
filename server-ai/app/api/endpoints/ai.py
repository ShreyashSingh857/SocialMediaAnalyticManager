from fastapi import APIRouter, HTTPException, Body
from app.services.ai_generator import ai_service
from pydantic import BaseModel
from typing import List

router = APIRouter()

class TitleRequest(BaseModel):
    description: str

class TitleResponse(BaseModel):
    titles: List[str]

@router.post("/generate-titles", response_model=TitleResponse)
async def generate_titles(request: TitleRequest):
    """
    Generate viral titles based on video description.
    """
    if len(request.description.split()) < 5:
        raise HTTPException(status_code=400, detail="Description is too short. Please provide at least 5 words.")
        
    titles = await ai_service.generate_viral_titles(request.description)
    
    if titles and titles[0].startswith("Error"):
         raise HTTPException(status_code=500, detail=titles[0])

    return TitleResponse(titles=titles)
