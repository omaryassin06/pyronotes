import json
from openai import AsyncOpenAI
from app.config import settings
from typing import List, Dict

client = AsyncOpenAI(api_key=settings.openai_api_key)


class LectureBuddyService:
    async def analyze_transcript_chunk(self, transcript_chunk: str) -> List[Dict]:
        """
        Analyze a transcript chunk and return lecture buddy insights.
        Returns a list of cards with definitions and explanations.
        """
        if not transcript_chunk or len(transcript_chunk.strip()) < 50:
            return []
        
        prompt = f"""You are a helpful lecture buddy assisting a student during a lecture.
Analyze this transcript and identify terms or concepts that would benefit from explanation.

For each item, provide:
- type: "definition" (for terms/jargon) or "explanation" (for complex concepts)  
- term: the word or phrase being explained
- text: a clear, concise explanation suitable for a student

Return ONLY a JSON array with 2-3 of the most important items. No other text.
Format: [{{"type": "definition", "term": "example", "text": "explanation here"}}]

Transcript: "{transcript_chunk}"
"""
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful lecture buddy. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            insights = json.loads(content)
            
            # Convert to our schema format (type -> subtype)
            formatted_insights = []
            for insight in insights:
                if isinstance(insight, dict) and "type" in insight and "term" in insight and "text" in insight:
                    formatted_insights.append({
                        "subtype": insight["type"],
                        "term": insight["term"],
                        "text": insight["text"]
                    })
            
            return formatted_insights
        
        except json.JSONDecodeError as e:
            print(f"Error parsing GPT-4 response: {e}")
            return []
        except Exception as e:
            print(f"Error in lecture buddy analysis: {e}")
            return []


lecture_buddy_service = LectureBuddyService()


