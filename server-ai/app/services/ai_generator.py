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

ai_service = AIGenerator()
