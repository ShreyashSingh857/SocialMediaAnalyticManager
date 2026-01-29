# SocialManager

A comprehensive social media management platform that leverages AI to provide deep analytics and actionable insights for content creators.

## 🚀 Features

- **YouTube Integration**: Connect and analyze data from YouTube.
- **AI-Powered Insights**: deeply analyze engagement, trends, and content performance using Gemini AI.
- **Advanced Analytics**: Visualizations for views, engagement rates, subscriber growth, and more.
- **Predictive Metrics**: estimated impact of future content based on historical data.
- **Secure Authentication**: Robust user management via Supabase Auth.
- **Creator Toolkit**: AI Studio tools for scripts, metadata, and thumbnail ratings.
- **Profile Management**: Creator profile setup and quick access.

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **State/Data**: Supabase Client
- **Visualization**: Recharts
- **Icons**: Lucide React
- **Animation**: Framer Motion

### Server AI (Backend)
- **Framework**: FastAPI (Python 3.10+)
- **AI Model**: Google Generative AI (Gemini)
- **Data Processing**: Pandas
- **Database Integration**: Supabase Python Client

### Infrastructure & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Edge Functions**: Deno (Supabase Edge Functions)

## 📂 Project Structure

- **/client**: React frontend application
- **/server-ai**: Python FastAPI service for AI processing
- **/supabase**: Supabase configuration, migrations, and edge functions

## ⚡ Setup Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Supabase Account & CLI

### 1. Client Setup
Navigate to the client directory and install dependencies:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173/ (Vite will auto-increment if the port is in use).

### 2. Server AI Setup
Navigate to the server-ai directory:

```bash
cd server-ai
```

Create and activate a virtual environment:

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `server-ai` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GOOGLE_API_KEY=your_gemini_api_key
PORT=8000
```

Run the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000/.

## ▲ Vercel Deployment (Frontend)

This repo includes a Vercel configuration at `vercel.json` to build and serve the Vite app from the `client` folder.

Recommended environment variables in Vercel (Project Settings → Environment Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## ▶ Run Both (Local)

In two terminals:

```bash
cd client
npm run dev
```

```bash
cd server-ai
uvicorn app.main:app --reload
```

## 📜 License
[MIT](LICENSE)
