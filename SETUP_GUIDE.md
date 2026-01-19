# Quick Setup Guide for Architecture Changes

## Overview
The application has been improved with:
1. ✅ Fixed Recharts rendering errors
2. ✅ Migrated backend to centralized FastAPI
3. ✅ Centralized API endpoint configuration
4. ✅ Enhanced YouTube sync with async operations

## Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase project set up
- Google OAuth credentials

## Step 1: Backend Setup

```bash
cd server-ai

# Create Python environment
python -m venv venv
source venv/Scripts/activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env  # if exists, or create manually

# Add these to .env:
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=8000

# Run FastAPI server
python -m uvicorn app.main:app --reload
```

FastAPI should now be running at `http://localhost:8000`

Verify it works:
```bash
curl http://localhost:8000/
# Should return: {"message": "SocialManager AI Service Running"}
```

## Step 2: Frontend Setup

```bash
cd client

# Create .env file
cp .env.example .env  # if exists, or create manually

# Add these to .env:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000

# Install dependencies
npm install

# Run React dev server
npm run dev
```

React should now be running at `http://localhost:5173`

## Step 3: Test the Flow

1. **Open browser console** (F12)
2. **Navigate to login page**
3. **Click "Sign in with Google"**
4. **After redirect, check console for**:
   ```
   Auth Event: SIGNED_IN
   Sync Complete: {success: true, ...}
   ```
5. **Navigate to Analytics page**
6. **Verify charts render** (no -1 width/height warnings)

## Step 4: Verify Data Sync

Check Supabase for populated data:

```sql
-- Check connected accounts
SELECT * FROM connected_accounts 
WHERE platform = 'youtube' 
LIMIT 1;

-- Check daily metrics
SELECT * FROM channel_daily_metrics 
ORDER BY date DESC 
LIMIT 10;

-- Check videos
SELECT * FROM content_items 
WHERE type = 'video' 
LIMIT 10;

-- Check comments
SELECT * FROM video_comments 
LIMIT 10;
```

If these tables have data, analytics should work!

## Troubleshooting

### Issue: CORS Error when calling FastAPI
**Solution**: 
- Make sure FastAPI is running on `http://localhost:8000`
- Check VITE_API_URL in `.env` matches
- Verify CORS middleware in `server-ai/app/main.py` includes your React URL

### Issue: YouTube API returns 401
**Solution**:
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env`
- Check tokens are being saved in `connected_accounts` table
- Verify token refresh logic by checking logs

### Issue: Charts still show -1 dimensions
**Solution**:
- Hard refresh browser (Ctrl+Shift+R)
- Check React dev tools for AnalyticsChart dimensions
- Verify data is loading (check console for "Attempting to load data from DB")

### Issue: Analytics pages empty
**Solution**:
- Check if sync completed (look for "Sync Complete" in console)
- Query Supabase tables to verify data exists
- Check FastAPI logs for sync errors
- May need to manually trigger sync by refreshing page

### Issue: "No YouTube channel found"
**Solution**:
- Verify you're using a YouTube channel account (not just Google account)
- Check that YouTube scopes are requested:
  - `youtube.readonly`
  - `yt-analytics.readonly`
- Try signing out and signing back in

## Environment Variables Reference

### Server (server-ai/.env)
```
SUPABASE_URL=              # Your Supabase URL
SUPABASE_SERVICE_KEY=      # Service key (same as client anon key won't work)
SUPABASE_SERVICE_ROLE_KEY= # Service role key (for admin operations)
GOOGLE_CLIENT_ID=          # From Google Cloud Console
GOOGLE_CLIENT_SECRET=      # From Google Cloud Console
OPENAI_API_KEY=            # Optional, for AI features
PORT=8000                  # FastAPI port
```

### Client (client/.env)
```
VITE_SUPABASE_URL=         # Your Supabase URL
VITE_SUPABASE_ANON_KEY=    # Anon/public key from Supabase
VITE_API_URL=              # FastAPI URL (http://localhost:8000)
```

## File Structure Changes

### New Files
- `client/src/lib/config.ts` - Centralized API endpoints
- `server-ai/app/api/endpoints/youtube_sync.py` - Enhanced YouTube sync

### Modified Files
- `server-ai/app/core/config.py` - Added OAuth config
- `client/src/components/AnalyticsChart.tsx` - Fixed rendering
- `client/src/hooks/useYouTubeData.ts` - Uses FastAPI
- `client/src/pages/ai-tools/*.tsx` - Uses config endpoints

## What Was Changed & Why

### Before
```
React Client → Supabase Edge Functions (Deno) → YouTube API
           ↓
         Database
```

**Problems**:
- Multiple network hops
- Deno compilation overhead
- Separate code maintenance
- Recharts rendering issues

### After
```
React Client → FastAPI (Python) → YouTube API
           ↓
         Database
```

**Benefits**:
- Direct backend calls (faster)
- Unified Python codebase
- Easier debugging
- Fixed chart rendering

## Performance Tips

1. **Charts load slower first time?** 
   - This is normal (data loading + rendering)
   - Subsequent loads are cached

2. **YouTube sync takes time?**
   - First sync processes all history (30 days)
   - Subsequent syncs are incremental

3. **Want to force resync?**
   - Refresh the page
   - Or delete `connected_accounts` row and sign in again

## Next Steps

1. ✅ Set up backend FastAPI server
2. ✅ Configure environment variables
3. ✅ Set up frontend React app
4. ✅ Test Google authentication
5. ✅ Verify data syncs to database
6. ✅ Check analytics pages display correctly
7. Deploy to production (update VITE_API_URL)

## Production Deployment

For production, update:

### `client/.env` (or deployment config)
```
VITE_API_URL=https://your-backend-domain.com
```

### `server-ai/.env` (or deployment config)
- Use production Supabase URL/keys
- Set appropriate CORS origins
- Configure production-grade database backups

## Support

If you encounter issues:
1. Check console.log output (browser and FastAPI logs)
2. Verify all environment variables are set
3. Check Supabase tables for data
4. Review ISSUES_FIXED.md for known problems
5. Check ARCHITECTURE_IMPROVEMENTS.md for technical details
