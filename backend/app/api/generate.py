from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.lecture import Lecture
from app.schemas.generation import GenerateRequest, GenerateResponse
from app.services.generation import generation_service

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_study_materials(
    request: GenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate study materials (notes, flashcards, or quiz) from lecture(s)."""
    
    # Fetch transcript(s) based on scope
    if request.scope == "lecture":
        result = await db.execute(select(Lecture).where(Lecture.id == request.id))
        lecture = result.scalar_one_or_none()
        
        if not lecture:
            raise HTTPException(status_code=404, detail="Lecture not found")
        
        if not lecture.transcript:
            raise HTTPException(status_code=400, detail="Lecture has no transcript")
        
        transcript = lecture.transcript
    
    else:  # scope == "folder"
        result = await db.execute(
            select(Lecture).where(Lecture.folder_id == request.id)
        )
        lectures = result.scalars().all()
        
        if not lectures:
            raise HTTPException(status_code=404, detail="No lectures found in folder")
        
        # Combine transcripts
        transcripts = [l.transcript for l in lectures if l.transcript]
        if not transcripts:
            raise HTTPException(status_code=400, detail="No transcripts available in folder")
        
        transcript = "\n\n---\n\n".join(transcripts)
    
    # Generate content
    try:
        content = await generation_service.generate_study_material(
            transcript=transcript,
            material_type=request.type
        )
        
        return GenerateResponse(type=request.type, content=content)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


