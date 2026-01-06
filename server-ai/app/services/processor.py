import pandas as pd
import numpy as np
from typing import List, Dict, Any
from app.core.db import supabase

class AnalyticsProcessor:
    def __init__(self, account_id: str):
        self.account_id = account_id

    def fetch_history(self, days: int = 90) -> List[Dict[str, Any]]:
        """Fetch daily metrics from Supabase."""
        try:
            response = supabase.table("channel_daily_metrics") \
                .select("*") \
                .eq("account_id", self.account_id) \
                .order("date", desc=True) \
                .limit(days) \
                .execute()
            
            # Return reversed to be in chronological order for processing
            return list(reversed(response.data)) if response.data else []
        except Exception as e:
            print(f"Error fetching history: {e}")
            return []

    def fetch_video_stats(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch video stats from Supabase."""
        try:
            # Fetch videos with their latest snapshot
            response = supabase.table("content_items") \
                .select("id, title, content_snapshots(views, likes, comments, recorded_at)") \
                .eq("account_id", self.account_id) \
                .eq("type", "video") \
                .order("published_at", desc=True) \
                .limit(limit) \
                .execute()
            
            videos = []
            if response.data:
                for item in response.data:
                    snapshots = item.get("content_snapshots", [])
                    if snapshots:
                        # Sort by recorded_at desc to get latest
                        latest = sorted(snapshots, key=lambda x: x['recorded_at'], reverse=True)[0]
                        videos.append({
                            "id": item["id"],
                            "title": item["title"],
                            "views": latest.get("views", 0),
                            "likes": latest.get("likes", 0),
                            "comments": latest.get("comments", 0)
                        })
            return videos
        except Exception as e:
            print(f"Error fetching videos: {e}")
            return []

    def process_daily_metrics(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process daily metrics to find trends.
        Input: List of {'date': 'YYYY-MM-DD', 'views': 100, ...}
        """
        if not history:
            return {}

        df = pd.DataFrame(history)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # 1. Weekly Rolling Average
        df['views_7d_avg'] = df['views'].rolling(window=7).mean().fillna(0)
        
        # 2. Growth Trend (Slope of last 7 days)
        recent = df.tail(7)
        if len(recent) > 1:
            slope = np.polyfit(range(len(recent)), recent['views'], 1)[0]
            trend_direction = "up" if slope > 0 else "down"
        else:
            slope = 0
            trend_direction = "flat"

        # 3. Peak Performance Day
        peak_day = df.loc[df['views'].idxmax()]

        # --- NEW METRICS ---
        
        # 4. Average View Duration (AVD) (Hours * 60 / Views)
        # Avoid division by zero
        total_views_period = df['views'].sum()
        total_watch_hours = df.get('watch_time_hours', pd.Series([0]*len(df))).sum()
        avd_minutes = (total_watch_hours * 60) / total_views_period if total_views_period > 0 else 0
        
        # 5. Subscriber Conversion Rate (Subs / Views * 100)
        total_subs_gained = df.get('subscribers_gained', pd.Series([0]*len(df))).sum()
        sub_conversion_rate = (total_subs_gained / total_views_period * 100) if total_views_period > 0 else 0

        # 6. Momentum (Week over Week growth)
        # Last 7 days vs Previous 7 days
        if len(df) >= 14:
            curr_week_views = df['views'].tail(7).sum()
            prev_week_views = df['views'].iloc[-14:-7].sum()
            momentum = ((curr_week_views - prev_week_views) / prev_week_views * 100) if prev_week_views > 0 else 0
        else:
            momentum = 0

        # Convert date back to string for JSON serialization
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')

        return {
            "summary": {
                "trend_direction": trend_direction,
                "trend_slope": round(float(slope), 2),
                "peak_date": peak_day['date'].strftime('%Y-%m-%d'),
                "peak_views": int(peak_day['views']),
                # New Fields
                "avd_minutes": round(float(avd_minutes), 2),
                "sub_conversion_rate": round(float(sub_conversion_rate), 4),
                "momentum_percent": round(float(momentum), 2)
            },
            "rolling_averages": df[['date', 'views_7d_avg']].tail(30).to_dict(orient='records'),
            "day_of_week_analysis": self.analyze_day_of_week(history)
        }

    def process_video_stats(self, videos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process video stats to find engagement rates.
        Input: List of {'views': 100, 'likes': 10, 'comments': 5, ...}
        """
        if not videos:
            return {}
            
        df = pd.DataFrame(videos)
        
        # Avoid division by zero
        df['engagement_rate'] = ((df['likes'] + df['comments']) / df['views'].replace(0, 1)) * 100
        
        avg_engagement = df['engagement_rate'].mean()
        top_engaged = df.nlargest(3, 'engagement_rate')

        return {
            "average_engagement_rate": round(float(avg_engagement), 2),
            "top_engaged_videos": top_engaged[['id', 'title', 'engagement_rate']].to_dict(orient='records'),
            "engagement_quality": self.analyze_engagement_quality(videos)
        }

    def analyze_day_of_week(self, history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze which day of the week gets the most views.
        Output: [{'day': 'Monday', 'views': 1500}, ...]
        """
        if not history:
            return []
            
        df = pd.DataFrame(history)
        df['date'] = pd.to_datetime(df['date'])
        
        # 0=Monday, 6=Sunday
        df['day_index'] = df['date'].dt.dayofweek
        df['day_name'] = df['date'].dt.day_name()
        
        # Calculate average views per day of week
        daily_stats = df.groupby(['day_index', 'day_name'])['views'].mean().reset_index()
        daily_stats = daily_stats.sort_values('day_index')
        
        return daily_stats[['day_name', 'views']].to_dict(orient='records')

    def analyze_engagement_quality(self, videos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculate metrics for Engagement Matrix (Likability vs Discussability)
        """
        if not videos:
            return []
            
        processed = []
        for v in videos:
            views = v.get('views', 0)
            if views > 100: # Filter low view videos for noise
                # Likes per 1k views
                likability = (v.get('likes', 0) / views) * 1000
                # Comments per 1k views
                discussability = (v.get('comments', 0) / views) * 1000
                
                processed.append({
                    "id": v['id'],
                    "title": v['title'],
                    "views": views,
                    "likability": round(likability, 2),
                    "discussability": round(discussability, 2)
                })
        
        # Return top 20 most viewed to avoid clutter
        return sorted(processed, key=lambda x: x['views'], reverse=True)[:20]

    async def save_insights(self, insight_type: str, data: Dict[str, Any], start_date: str = None, end_date: str = None):
        """
        Save calculated insights to Supabase
        """
        payload = {
            "account_id": self.account_id,
            "insight_type": insight_type,
            "data": data,
            "start_date": start_date,
            "end_date": end_date
        }
        
        # Use simple insert
        try:
            print(f"--- SAVING INSIGHT: {insight_type} ---")
            print(f"Data: {data}")
            response = supabase.table("analytics_insights").insert(payload).execute()
            print(f"Supabase Response: {response}")
            print(f"Saved {insight_type} insight for {self.account_id}")
        except Exception as e:
            print(f"Error saving insight: {e}")
            # Print detailed error if available
            if hasattr(e, 'details'):
                 print(f"Details: {e.details}")
            if hasattr(e, 'hint'):
                 print(f"Hint: {e.hint}")
            if hasattr(e, 'code'):
                 print(f"Code: {e.code}")

