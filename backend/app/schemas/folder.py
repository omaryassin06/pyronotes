from pydantic import BaseModel
from datetime import datetime


class FolderBase(BaseModel):
    name: str


class FolderCreate(FolderBase):
    pass


class FolderResponse(FolderBase):
    id: str
    count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


