import json
from openai import AsyncOpenAI
from app.config import settings
from typing import Literal

client = AsyncOpenAI(api_key=settings.openai_api_key)


class GenerationService:
    async def generate_study_material(
        self,
        transcript: str,
        material_type: Literal["notes", "flashcards", "quiz"]
    ) -> str:
        """
        Generate study materials from a transcript using GPT-4.
        """
        prompts = {
            "notes": """Create comprehensive study notes from this lecture transcript.
Format as markdown with clear headings, key concepts, and summaries.
Include important details and organize information logically.

Transcript:
{transcript}
""",
            "flashcards": """Create flashcard pairs from this lecture transcript.
Return a JSON array of objects with "question" and "answer" fields.
Focus on key concepts and important information.
Create 10-15 flashcards.

Format: [{{"question": "...", "answer": "..."}}, ...]

Transcript:
{transcript}
""",
            "quiz": """Create a multiple-choice quiz from this lecture transcript.
Return a JSON array of objects with:
- "question": the question text
- "options": array of 4 possible answers
- "correct": index (0-3) of the correct answer

Create 8-10 questions that test understanding of key concepts.

Format: [{{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}}, ...]

Transcript:
{transcript}
"""
        }
        
        prompt = prompts[material_type].format(transcript=transcript)
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert educational content creator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            
            # For flashcards and quiz, validate JSON and basic structure
            if material_type in ["flashcards", "quiz"]:
                try:
                    data = json.loads(content)
                    if not isinstance(data, list):
                        raise ValueError("Expected a list of items")

                    # Very lightweight schema validation to keep the frontend logic robust
                    if material_type == "flashcards":
                        # Each item should have question + answer
                        cleaned = []
                        for item in data:
                            if (
                                isinstance(item, dict)
                                and isinstance(item.get("question"), str)
                                and isinstance(item.get("answer"), str)
                            ):
                                cleaned.append(
                                    {
                                        "question": item["question"],
                                        "answer": item["answer"],
                                    }
                                )
                        if not cleaned:
                            raise ValueError("No valid flashcards in response")
                        content = json.dumps(cleaned)

                    elif material_type == "quiz":
                        # Each item should have question, options (list), and optional correct index
                        cleaned = []
                        for item in data:
                            if not isinstance(item, dict):
                                continue
                            question = item.get("question")
                            options = item.get("options")
                            correct = item.get("correct")
                            if not isinstance(question, str) or not isinstance(
                                options, list
                            ):
                                continue
                            cleaned.append(
                                {
                                    "question": question,
                                    "options": options,
                                    "correct": correct
                                    if isinstance(correct, int)
                                    else None,
                                }
                            )
                        if not cleaned:
                            raise ValueError("No valid quiz questions in response")
                        content = json.dumps(cleaned)

                except Exception:
                    # If not valid JSON or wrong structure, wrap it in a simple error object
                    content = json.dumps([{"error": "Failed to generate valid format"}])
            
            return content
        
        except Exception as e:
            print(f"Error generating {material_type}: {e}")
            raise


generation_service = GenerationService()


