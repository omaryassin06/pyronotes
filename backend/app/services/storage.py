import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.config import settings


class StorageService:
    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    async def save_audio_file(self, file: UploadFile) -> str:
        """Save uploaded audio file and return the file path."""
        # Generate unique filename
        file_ext = Path(file.filename).suffix if file.filename else ".wav"
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = self.upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        return str(file_path)
    
    def delete_audio_file(self, file_path: str):
        """Delete audio file from storage."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
    
    def get_file_path(self, filename: str) -> Path:
        """Get full path for a filename."""
        return self.upload_dir / filename


storage_service = StorageService()


