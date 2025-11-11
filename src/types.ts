export type StreamEvent =
  | { type: 'transcript_chunk'; text: string; ts?: number }
  | { type: 'ai_chunk'; text: string; section?: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface Lecture {
  id: string;
  title: string;
  folderId?: string;
  durationSec?: number;
  createdAt: string;
  status: 'ready' | 'processing' | 'error';
}

export interface Folder {
  id: string;
  name: string;
  count: number;
}

export interface TranscriptionSession {
  id: string;
  status: 'idle' | 'recording' | 'uploading' | 'transcribing' | 'done' | 'error';
  transcript: string;
  aiOrganized: string;
  durationSec: number;
  startTime?: number;
}

export type GenerateType = 'notes' | 'flashcards' | 'quiz';

export interface GenerateRequest {
  type: GenerateType;
  scope: 'lecture' | 'folder';
  id: string;
}

export interface GenerateResult {
  type: GenerateType;
  content: string;
  loading: boolean;
  error?: string;
}

