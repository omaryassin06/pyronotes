import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { TranscriptionSession, StreamEvent } from '../types';

interface TranscriptionContextType {
  session: TranscriptionSession | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  uploadAudio: (file: File) => Promise<void>;
  handleStreamEvent: (event: StreamEvent) => void;
  resetSession: () => void;
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export function TranscriptionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TranscriptionSession | null>(null);

  const startRecording = async () => {
    // Mock implementation - will be replaced with real MediaRecorder
    const newSession: TranscriptionSession = {
      id: `session-${Date.now()}`,
      status: 'recording',
      transcript: '',
      aiOrganized: '',
      durationSec: 0,
      startTime: Date.now(),
    };
    setSession(newSession);

    // Simulate streaming transcription
    setTimeout(() => {
      handleStreamEvent({ type: 'transcript_chunk', text: 'Hello, this is a test transcription. ' });
    }, 2000);
    setTimeout(() => {
      handleStreamEvent({ type: 'transcript_chunk', text: 'More text appears as you speak. ' });
    }, 4000);
    setTimeout(() => {
      handleStreamEvent({ type: 'ai_chunk', text: '## Key Points\n- First point mentioned\n- Second observation', section: 'summary' });
    }, 6000);
  };

  const stopRecording = async () => {
    if (!session) return;
    
    const duration = session.startTime 
      ? Math.floor((Date.now() - session.startTime) / 1000)
      : 0;
    
    setSession({
      ...session,
      status: 'done',
      durationSec: duration,
    });
  };

  const uploadAudio = async (file: File) => {
    const newSession: TranscriptionSession = {
      id: `upload-${Date.now()}`,
      status: 'uploading',
      transcript: '',
      aiOrganized: '',
      durationSec: 0,
    };
    setSession(newSession);

    // Mock upload and transcription
    setTimeout(() => {
      setSession((prev) => prev ? { ...prev, status: 'transcribing' } : prev);
      handleStreamEvent({ type: 'transcript_chunk', text: `Uploaded audio file: ${file.name}. ` });
    }, 1500);
    
    setTimeout(() => {
      handleStreamEvent({ type: 'transcript_chunk', text: 'Transcribing uploaded content... ' });
    }, 3000);
    
    setTimeout(() => {
      setSession((prev) => prev ? { ...prev, status: 'done', durationSec: 120 } : prev);
    }, 5000);
  };

  const handleStreamEvent = (event: StreamEvent) => {
    setSession((prev) => {
      if (!prev) return prev;
      
      switch (event.type) {
        case 'transcript_chunk':
          return { ...prev, transcript: prev.transcript + event.text };
        case 'ai_chunk':
          return { ...prev, aiOrganized: prev.aiOrganized + event.text + '\n\n' };
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
  };

  return (
    <TranscriptionContext.Provider
      value={{
        session,
        startRecording,
        stopRecording,
        uploadAudio,
        handleStreamEvent,
        resetSession,
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

