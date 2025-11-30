from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db, AsyncSessionLocal
from app.models.lecture import Lecture, LectureStatus
from app.schemas.lecture import TranscriptionStartResponse, TranscriptionCompleteResponse
from app.services.storage import storage_service
from app.services.whisper import whisper_service
from app.services.lecture_buddy import lecture_buddy_service
import json

router = APIRouter()


@router.post("/transcriptions", response_model=TranscriptionCompleteResponse)
async def transcribe_audio_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an audio file for batch transcription.
    This endpoint handles the complete transcription process.
    """
    # Save audio file
    try:
        audio_path = await storage_service.save_audio_file(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save audio file: {str(e)}")
    
    # Create lecture record
    lecture = Lecture(
        title=file.filename or "Untitled Lecture",
        audio_path=audio_path,
        status=LectureStatus.processing
    )
    db.add(lecture)
    await db.commit()
    await db.refresh(lecture)
    
    # Transcribe audio
    try:
        transcript = await whisper_service.transcribe_audio_file(audio_path)
        
        # Analyze with lecture buddy
        ai_insights = await lecture_buddy_service.analyze_transcript_chunk(transcript)
        
        # Update lecture
        lecture.transcript = transcript
        lecture.ai_insights = ai_insights
        lecture.status = LectureStatus.ready
        
        await db.commit()
        await db.refresh(lecture)
        
        return TranscriptionCompleteResponse(
            id=lecture.id,
            transcript=transcript,
            ai_insights=ai_insights
        )
    
    except Exception as e:
        lecture.status = LectureStatus.error
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/transcriptions/start", response_model=TranscriptionStartResponse)
async def start_transcription(db: AsyncSession = Depends(get_db)):
    """
    Start a real-time transcription session.
    Returns a session ID for WebSocket connection.
    """
    lecture = Lecture(
        title="Live Recording",
        status=LectureStatus.recording
    )
    db.add(lecture)
    await db.commit()
    await db.refresh(lecture)
    
    return TranscriptionStartResponse(id=lecture.id)


@router.websocket("/transcriptions/{lecture_id}/stream")
async def transcription_stream(websocket: WebSocket, lecture_id: str):
    """
    WebSocket endpoint for real-time transcription streaming.
    
    Client sends: audio chunks (binary data) or text messages
    Server sends: JSON events with types: transcript_chunk, ai_chunk, done, error
    """
    await websocket.accept()
    
    # Get database session
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
        lecture = result.scalar_one_or_none()
        
        if not lecture:
            await websocket.send_json({"type": "error", "message": "Lecture not found"})
            await websocket.close()
            return
        
        accumulated_transcript = ""
        last_analysis_length = 0
        
        try:
            while True:
                # Receive data from client
                data = await websocket.receive()
                
                if "text" in data:
                    # Handle text messages (e.g., transcript chunks from client)
                    message = json.loads(data["text"])
                    
                    if message.get("type") == "transcript_chunk":
                        # Client is sending us transcript chunks
                        text = message.get("text", "")
                        accumulated_transcript += text
                        
                        # Echo back
                        await websocket.send_json({
                            "type": "transcript_chunk",
                            "text": text
                        })
                        
                        # Run lecture buddy analysis every ~250 characters
                        if len(accumulated_transcript) - last_analysis_length > 250:
                            chunk_to_analyze = accumulated_transcript[last_analysis_length:]
                            insights = await lecture_buddy_service.analyze_transcript_chunk(chunk_to_analyze)
                            
                            for insight in insights:
                                await websocket.send_json({
                                    "type": "ai_chunk",
                                    "subtype": insight["subtype"],
                                    "term": insight["term"],
                                    "text": insight["text"]
                                })
                            
                            last_analysis_length = len(accumulated_transcript)
                    
                    elif message.get("type") == "finalize":
                        # Client is done recording
                        break
        
        except WebSocketDisconnect:
            print(f"WebSocket disconnected for lecture {lecture_id}")
        
        except Exception as e:
            print(f"Error in WebSocket: {e}")
            try:
                await websocket.send_json({"type": "error", "message": str(e)})
            except:
                pass
        
        finally:
            # Finalize lecture
            if accumulated_transcript:
                lecture.transcript = accumulated_transcript
                lecture.status = LectureStatus.ready
                
                # Run final analysis if needed
                if len(accumulated_transcript) > last_analysis_length:
                    final_insights = await lecture_buddy_service.analyze_transcript_chunk(
                        accumulated_transcript[last_analysis_length:]
                    )
                    lecture.ai_insights = (lecture.ai_insights or []) + final_insights
                
                await db.commit()
            
            # Only send if WebSocket is still connected
            try:
                if websocket.client_state.value == 1:  # WebSocketState.CONNECTED
                    await websocket.send_json({"type": "done"})
            except:
                pass
            
            # Close WebSocket gracefully
            try:
                await websocket.close()
            except:
                pass
