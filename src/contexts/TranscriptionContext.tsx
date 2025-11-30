import { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TranscriptionSession, StreamEvent } from '../types';
import { api } from '../services/api';

interface TranscriptionContextType {
  session: TranscriptionSession | null;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  uploadAudio: (file: File) => Promise<void>;
  handleStreamEvent: (event: StreamEvent) => void;
  resetSession: () => void;
  saveRecording: (title: string, folderId?: string) => Promise<void>;
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export function TranscriptionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TranscriptionSession | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsConnectionRef = useRef<{ unsubscribe: () => void; sendTranscript: (text: string) => void } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup audio level monitoring on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startAudioLevelMonitoring = (stream: MediaStream) => {
    // Create audio context and analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    microphone.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    
    // Update audio level in real-time
    const updateLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Normalize to 0-1 range (0-255 -> 0-1)
        const normalizedLevel = average / 255;
        
        // Apply some smoothing and boost for better visualization
        const boostedLevel = Math.min(normalizedLevel * 2, 1);
        setAudioLevel(boostedLevel);
      }
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const stopAudioLevelMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const startRecording = async () => {
    try {
      // Check if browser supports Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser. Please use Chrome.');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start audio level monitoring
      startAudioLevelMonitoring(stream);

      // Start transcription session on backend
      const { id } = await api.startTranscription();
      
      // Create new session
      const newSession: TranscriptionSession = {
        id,
        status: 'recording',
        transcript: '',
        aiInsights: [],
        durationSec: 0,
        startTime: Date.now(),
      };
      setSession(newSession);

      // Set up WebSocket for real-time transcription
      const wsConnection = api.subscribeToTranscription(id, handleStreamEvent);
      wsConnectionRef.current = wsConnection;

      // Set up MediaRecorder to save audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect chunks every second

      // Set up Speech Recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognitionRef.current = recognition;

      // Handle recognition results
      recognition.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        // Send final transcript to backend
        if (finalTranscript && wsConnectionRef.current) {
          wsConnectionRef.current.sendTranscript(finalTranscript);
          console.log('Transcript sent to backend:', finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        handleStreamEvent({ 
          type: 'error', 
          message: `Speech recognition error: ${event.error}` 
        });
      };

      recognition.onend = () => {
        // Restart recognition if still recording
        if (session?.status === 'recording' && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.log('Recognition already started or ended');
          }
        }
      };

      // Start recognition
      recognition.start();
      console.log('Speech recognition and audio recording started');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      handleStreamEvent({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to start recording' 
      });
    }
  };

  const stopRecording = async () => {
    if (!session) return;
    
    // Stop audio level monitoring
    stopAudioLevelMonitoring();
    
    // Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        console.log('Speech recognition stopped');
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
    }

    // Stop MediaRecorder and upload audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Wait for final data
      await new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            resolve();
          };
        } else {
          resolve();
        }
      });

      // Create audio blob and upload
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `${session.id}.webm`, { type: 'audio/webm' });
        
        console.log('Uploading audio file:', audioFile.size, 'bytes');
        
        // Upload audio to backend to associate with lecture
        try {
          const formData = new FormData();
          formData.append('file', audioFile);
          formData.append('lecture_id', session.id);
          
          await fetch(`http://localhost:8000/api/lectures/${session.id}/audio`, {
            method: 'POST',
            body: formData,
          });
          
          console.log('Audio uploaded successfully');
        } catch (error) {
          console.error('Failed to upload audio:', error);
        }
      }

      // Stop microphone stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
    }

    // Close WebSocket
    if (wsConnectionRef.current) {
      wsConnectionRef.current.unsubscribe();
      wsConnectionRef.current = null;
    }
    
    const duration = session.startTime 
      ? Math.floor((Date.now() - session.startTime) / 1000)
      : 0;
    
    setSession({
      ...session,
      status: 'done',
      durationSec: duration,
    });
  };

  const saveRecording = async (title: string, folderId?: string) => {
    if (!session || session.status !== 'done') return;
    
    setSession({ ...session, status: 'saving' });
    
    try {
      // Update the lecture with title and folder
      await api.updateLecture(session.id, {
        title,
        folderId,
        status: 'ready',
      });
      
      console.log('Recording saved successfully');
      
      // Reset session after successful save
      resetSession();
    } catch (error) {
      console.error('Failed to save recording:', error);
      setSession({ ...session, status: 'error' });
    }
  };

  const uploadAudio = async (file: File) => {
    const newSession: TranscriptionSession = {
      id: `upload-${Date.now()}`,
      status: 'uploading',
      transcript: '',
      aiInsights: [],
      durationSec: 0,
    };
    setSession(newSession);

    try {
      // Upload to backend
      const result = await api.uploadAudioFile(file);
      
      // Update session with results
      setSession({
        id: result.id,
        status: 'done',
        transcript: result.transcript,
        aiInsights: result.ai_insights as any[],
        durationSec: 0, // Backend should return this
      });
    } catch (error) {
      console.error('Failed to upload audio:', error);
      setSession((prev) => prev ? { ...prev, status: 'error' } : prev);
      handleStreamEvent({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to upload audio' 
      });
    }
  };

  const handleStreamEvent = (event: StreamEvent) => {
    setSession((prev) => {
      if (!prev) return prev;
      
      switch (event.type) {
        case 'transcript_chunk':
          return { ...prev, transcript: prev.transcript + event.text };
        case 'ai_chunk':
          return { 
            ...prev, 
            aiInsights: [...prev.aiInsights, {
              subtype: event.subtype,
              term: event.term,
              text: event.text
            }]
          };
        case 'done':
          return { ...prev, status: 'done' };
        case 'error':
          return { ...prev, status: 'error' };
        default:
          return prev;
      }
    });
  };

  const resetSession = () => {
    setSession(null);
    setAudioLevel(0);
  };

  return (
    <TranscriptionContext.Provider
      value={{
        session,
        audioLevel,
        startRecording,
        stopRecording,
        uploadAudio,
        handleStreamEvent,
        resetSession,
        saveRecording,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  );
}

export function useTranscription() {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error('useTranscription must be used within TranscriptionProvider');
  }
  return context;
}
