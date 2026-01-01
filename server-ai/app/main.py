from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(title="SocialManager AI Service")

@app.get("/")
def read_root():
    return {"message": "SocialManager AI Service Running"}

# Import and include routers here later
# from app.router import api_router
# app.include_router(api_router)
