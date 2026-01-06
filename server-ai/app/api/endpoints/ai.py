from fastapi import APIRouter, HTTPException, Body, UploadFile, File
from app.services.ai_generator import ai_service
from pydantic import BaseModel
from typing import List

router = APIRouter()

class MetadataRequest(BaseModel):
    description: str

class MetadataResponse(BaseModel):
    titles: List[str]
    description: str
    hashtags: List[str]

@router.post("/generate-metadata", response_model=MetadataResponse)
async def generate_metadata(request: MetadataRequest):
    """
    Generate titles, description, and hashtags.
    """
    if len(request.description.split()) < 3:
        raise HTTPException(status_code=400, detail="Description is too short.")
        
    result = await ai_service.generate_video_metadata(request.description)
    
    if "error" in result:
         raise HTTPException(status_code=500, detail=result["error"])

    return result

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
