export interface LectureBuddyCard {
  subtype: 'definition' | 'explanation';
  term: string;
  text: string;
}

export type StreamEvent =
  | { type: 'transcript_chunk'; text: string; ts?: number }
  | { type: 'ai_chunk'; subtype: 'definition' | 'explanation'; term: string; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface Lecture {
  id: string;
  title: string;
  folderId?: string;
  durationSec?: number;
  audioPath?: string;
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
  status: 'idle' | 'recording' | 'uploading' | 'transcribing' | 'done' | 'error' | 'saving';
  transcript: string;
  aiInsights: LectureBuddyCard[];
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

