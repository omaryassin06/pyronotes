from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api import transcriptions, lectures, folders, generate

app = FastAPI(title="PyroNotes API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transcriptions.router, prefix="/api", tags=["transcriptions"])
app.include_router(lectures.router, prefix="/api", tags=["lectures"])
app.include_router(folders.router, prefix="/api", tags=["folders"])
app.include_router(generate.router, prefix="/api", tags=["generate"])


@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/")
async def root():
    return {"message": "PyroNotes API"}


