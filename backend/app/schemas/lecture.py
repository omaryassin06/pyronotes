from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class LectureBuddyCard(BaseModel):
    subtype: str  # "definition" or "explanation"
    term: str
    text: str


class LectureBase(BaseModel):
    title: str
    folder_id: Optional[str] = None


class LectureCreate(LectureBase):
    pass


class LectureUpdate(BaseModel):
    title: Optional[str] = None
    folder_id: Optional[str] = None


class LectureResponse(LectureBase):
    id: str
    duration_sec: Optional[int] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class LectureDetailResponse(LectureResponse):
    audio_path: Optional[str] = None
    transcript: Optional[str] = None
    ai_insights: Optional[List[LectureBuddyCard]] = None
    
    class Config:
        from_attributes = True


class TranscriptionStartResponse(BaseModel):
    id: str


class TranscriptionCompleteResponse(BaseModel):
    id: str
    transcript: str
    ai_insights: List[LectureBuddyCard]


