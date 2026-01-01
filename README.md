# SocialManager

A comprehensive social media management platform with AI capabilities.

## Structure

- **/client**: React (Vite) + TypeScript Frontend
- **/server-main**: Node.js + Express + TypeScript Backend
- **/server-ai**: Python + FastAPI AI Service

## Setup

### Client
```bash
cd client
npm install
npm run dev
```

### Server Main
```bash
cd server-main
npm install
npm run dev
```

### Server AI
```bash
cd server-ai
# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Install deps
pip install -r requirements.txt
# Run
uvicorn app.main:app --reload
```
