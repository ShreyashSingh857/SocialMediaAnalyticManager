from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(title="SocialManager AI Service")

# Configure CORS
origins = [
    "http://localhost:5173",  # React Client
    "http://127.0.0.1:5173",
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

from app.api.endpoints import analytics, ai

app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])

# Alias app to main to allow 'uvicorn app.main:main' to work
main = app

