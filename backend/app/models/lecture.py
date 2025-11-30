from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid
import enum


class LectureStatus(enum.Enum):
    ready = "ready"
    processing = "processing"
    recording = "recording"
    error = "error"


class Lecture(Base):
    __tablename__ = "lectures"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=True)
    duration_sec = Column(Integer, nullable=True)
    audio_path = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    ai_insights = Column(JSON, nullable=True, default=list)
    status = Column(Enum(LectureStatus), default=LectureStatus.processing, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    folder = relationship("Folder", back_populates="lectures")


