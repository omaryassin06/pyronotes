from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import os
from app.database import get_db
from app.models.lecture import Lecture
from app.schemas.lecture import LectureResponse, LectureCreate, LectureUpdate, LectureDetailResponse
from app.services.storage import storage_service

router = APIRouter()


@router.get("/lectures", response_model=List[LectureResponse])
async def get_lectures(
    folder_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all lectures, optionally filtered by folder."""
    query = select(Lecture)
    if folder_id:
        query = query.where(Lecture.folder_id == folder_id)
    
    result = await db.execute(query.order_by(Lecture.created_at.desc()))
    lectures = result.scalars().all()
    return lectures


@router.get("/lectures/{lecture_id}", response_model=LectureDetailResponse)
async def get_lecture(lecture_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific lecture with full details."""
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    return lecture


@router.post("/lectures", response_model=LectureResponse)
async def create_lecture(
    lecture_data: LectureCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new lecture record."""
    lecture = Lecture(**lecture_data.model_dump())
    db.add(lecture)
    await db.commit()
    await db.refresh(lecture)
    return lecture


@router.patch("/lectures/{lecture_id}", response_model=LectureResponse)
async def update_lecture(
    lecture_id: str,
    lecture_data: LectureUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a lecture."""
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    # Update fields
    update_data = lecture_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lecture, field, value)
    
    await db.commit()
    await db.refresh(lecture)
    return lecture


@router.post("/lectures/{lecture_id}/audio")
async def upload_lecture_audio(
    lecture_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload audio file for a lecture."""
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    # Save audio file
    try:
        audio_path = await storage_service.save_audio_file(file)
        lecture.audio_path = audio_path
        await db.commit()
        return {"message": "Audio uploaded successfully", "audio_path": audio_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save audio: {str(e)}")


@router.get("/lectures/{lecture_id}/audio")
async def get_lecture_audio(lecture_id: str, db: AsyncSession = Depends(get_db)):
    """Stream the audio file for a lecture."""
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    if not lecture.audio_path or not os.path.exists(lecture.audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    # Return the audio file
    return FileResponse(
        lecture.audio_path,
        media_type="audio/webm",
        filename=f"{lecture.title}.webm"
    )


@router.delete("/lectures/{lecture_id}")
async def delete_lecture(lecture_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a lecture and its audio file."""
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    lecture = result.scalar_one_or_none()
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    # Delete audio file if exists
    if lecture.audio_path:
        storage_service.delete_audio_file(lecture.audio_path)
    
    await db.delete(lecture)
    await db.commit()
    
    return {"message": "Lecture deleted successfully"}
