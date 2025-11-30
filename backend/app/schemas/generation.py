from pydantic import BaseModel
from typing import Literal


class GenerateRequest(BaseModel):
    type: Literal["notes", "flashcards", "quiz"]
    scope: Literal["lecture", "folder"]
    id: str


class GenerateResponse(BaseModel):
    type: str
    content: str


