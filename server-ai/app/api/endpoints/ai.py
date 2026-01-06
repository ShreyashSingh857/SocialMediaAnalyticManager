from fastapi import APIRouter, HTTPException, Body, UploadFile, File
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

@router.post("/analyze-thumbnail")
async def analyze_thumbnail(file: UploadFile = File(...)):
    """
    Upload an image file to analyze.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        result = await ai_service.analyze_thumbnail(contents, file.content_type)
        
        if "error" in result:
             raise HTTPException(status_code=500, detail=result["error"])
             
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ScriptRequest(BaseModel):
    topic: str
    tone: str

@router.post("/generate-script")
async def generate_script(request: ScriptRequest):
    """
    Generate a video script.
    """
    if len(request.topic.split()) < 3:
        raise HTTPException(status_code=400, detail="Topic is too short. Please be more descriptive.")
    
    result = await ai_service.generate_script(request.topic, request.tone)
    
    if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
    return result
