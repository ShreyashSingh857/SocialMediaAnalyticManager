from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(title="SocialManager AI Service")

# Configure CORS
origins = [
    "http://localhost:5173",  # React Client
    "http://localhost:5174",  # React Client (alternate port)
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SocialManager AI Service Running"}

from app.api.endpoints import analytics, ai, youtube_sync

app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(youtube_sync.router, prefix="/api/v1/youtube", tags=["youtube"])

# Alias app to main to allow 'uvicorn app.main:main' to work
main = app

