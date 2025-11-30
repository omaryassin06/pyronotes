from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from app.database import get_db
from app.models.folder import Folder
from app.models.lecture import Lecture
from app.schemas.folder import FolderResponse, FolderCreate

router = APIRouter()


@router.get("/folders", response_model=List[FolderResponse])
async def get_folders(db: AsyncSession = Depends(get_db)):
    """Get all folders with lecture counts."""
    result = await db.execute(select(Folder).order_by(Folder.created_at.desc()))
    folders = result.scalars().all()
    
    # Get lecture counts for each folder
    folder_responses = []
    for folder in folders:
        count_result = await db.execute(
            select(func.count(Lecture.id)).where(Lecture.folder_id == folder.id)
        )
        count = count_result.scalar() or 0
        
        folder_responses.append(
            FolderResponse(
                id=folder.id,
                name=folder.name,
                count=count,
                created_at=folder.created_at
            )
        )
    
    return folder_responses


@router.post("/folders", response_model=FolderResponse)
async def create_folder(
    folder_data: FolderCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new folder."""
    folder = Folder(**folder_data.model_dump())
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    
    return FolderResponse(
        id=folder.id,
        name=folder.name,
        count=0,
        created_at=folder.created_at
    )


@router.delete("/folders/{folder_id}")
async def delete_folder(folder_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a folder and unassign its lectures."""
    result = await db.execute(select(Folder).where(Folder.id == folder_id))
    folder = result.scalar_one_or_none()
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Unassign lectures from this folder
    lectures_result = await db.execute(
        select(Lecture).where(Lecture.folder_id == folder_id)
    )
    lectures = lectures_result.scalars().all()
    for lecture in lectures:
        lecture.folder_id = None
    
    await db.delete(folder)
    await db.commit()
    
    return {"message": "Folder deleted successfully"}


