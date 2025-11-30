from openai import AsyncOpenAI
from app.config import settings
from pathlib import Path

client = AsyncOpenAI(api_key=settings.openai_api_key)


class WhisperService:
    async def transcribe_audio_file(self, audio_path: str) -> str:
        """
        Transcribe an audio file using OpenAI Whisper API.
        Returns the full transcript.
        """
        try:
            with open(audio_path, "rb") as audio_file:
                transcript = await client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            return transcript if isinstance(transcript, str) else transcript.text
        
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            raise


whisper_service = WhisperService()


