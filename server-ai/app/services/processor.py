import pandas as pd
import numpy as np
from typing import List, Dict, Any
from app.core.db import supabase

class AnalyticsProcessor:
    def __init__(self, account_id: str):
        self.account_id = account_id

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

        return {
            "summary": {
                "trend_direction": trend_direction,
                "trend_slope": round(float(slope), 2),
                "peak_date": peak_day['date'].strftime('%Y-%m-%d'),
                "peak_views": int(peak_day['views'])
            },
            "rolling_averages": df[['date', 'views_7d_avg']].tail(30).to_dict(orient='records')
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
            "top_engaged_videos": top_engaged[['id', 'title', 'engagement_rate']].to_dict(orient='records')
        }

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
            supabase.table("analytics_insights").insert(payload).execute()
            print(f"Saved {insight_type} insight for {self.account_id}")
        except Exception as e:
            print(f"Error saving insight: {e}")

