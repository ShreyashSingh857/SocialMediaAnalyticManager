import os
import google.generativeai as genai
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class AIGenerator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables.")
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')

    async def generate_viral_titles(self, description: str) -> List[str]:
        """
        Generate 5 viral YouTube titles based on the description.
        """
        if not os.getenv("GEMINI_API_KEY"):
            return ["Error: API Key not configured"]

        prompt = f"""
        You are an expert YouTube strategist. 
        I have a video with the following description:
        "{description}"

        Please generate 5 highly clickable, viral, but not clickbaity titles for this video.
        They should be under 60 characters if possible.
        Return ONLY a JSON array of strings. Example: ["Title 1", "Title 2", ...]
        Do not include markdown formatting like ```json.
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean up potential markdown code blocks
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            titles = json.loads(text.strip())
            return titles
        except Exception as e:
            print(f"Error generating titles: {e}")
            return [f"Error generating titles: {str(e)}"]

    async def analyze_thumbnail(self, image_data: bytes, mime_type: str) -> Dict[str, Any]:
        """
        Analyze a YouTube thumbnail image and return valid JSON feedback.
        """
        if not os.getenv("GEMINI_API_KEY"):
            return {"error": "API Key not configured"}

        prompt = """
        Analyze this YouTube thumbnail image as an expert content strategist.
        Rate it on a scale of 0-10 based on clickability, clarity, and emotional impact.
        Provide a list of 3 Pros, 3 Cons, and 3 specific Suggestions for improvement.
        
        Return ONLY a JSON object with this exact structure:
        {
            "score": 8.5,
            "pros": ["Pro 1", "Pro 2", "Pro 3"],
            "cons": ["Con 1", "Con 2", "Con 3"],
            "suggestions": ["Sugg 1", "Sugg 2", "Sugg 3"]
        }
        Do not include markdown formatting like ```json.
        """

        try:
            image_part = {
                "mime_type": mime_type,
                "data": image_data
            }
            
            response = self.model.generate_content([prompt, image_part])
            text = response.text.strip()
            
            # Clean up potential markdown
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
                
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error analyzing thumbnail: {e}")
            return {"error": str(e)}

    async def generate_script(self, topic: str, tone: str) -> Dict[str, Any]:
        """
        Generate a structured YouTube video script.
        """
        if not os.getenv("GEMINI_API_KEY"):
            return {"error": "API Key not configured"}

        prompt = f"""
        Write a YouTube video script for the following topic:
        Topic: "{topic}"
        Tone: {tone}

        The script must follow this structure:
        1. Hook (0-10s): Grab attention immediately.
        2. Intro (10-30s): Briefly explain what the video is about.
        3. Body: Key points or steps (bullet points).
        4. Call to Action (CTA): Encouragement to like/subscribe.

        Return ONLY a JSON object with this exact structure:
        {{
            "hook": "Script for the hook...",
            "intro": "Script for the intro...",
            "body": ["Point 1...", "Point 2...", "Point 3..."],
            "cta": "Script for the CTA..."
        }}
        Do not include markdown formatting like ```json.
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean up potential markdown
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
                
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error generating script: {e}")
            return {"error": str(e)}

ai_service = AIGenerator()
