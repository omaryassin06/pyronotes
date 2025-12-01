import type { Lecture, Folder, GenerateRequest, StreamEvent } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';
const WS_BASE_URL = 'ws://localhost:8000/api';

// Shape returned by the backend for lectures (snake_case)
type LectureApi = {
  id: string;
  title: string;
  folder_id?: string | null;
  duration_sec?: number | null;
  audio_path?: string | null;
  created_at: string;
  status: string;
};

function mapLectureFromApi(api: LectureApi): Lecture {
  return {
    id: api.id,
    title: api.title,
    folderId: api.folder_id ?? undefined,
    durationSec: api.duration_sec ?? undefined,
    audioPath: api.audio_path ?? undefined,
    createdAt: api.created_at,
    status: api.status as Lecture['status'],
  };
}

function mapLectureToApiInput(
  data: Partial<Omit<Lecture, 'id' | 'createdAt'>>,
): Partial<LectureApi> {
  const payload: Partial<LectureApi> = {};

  if (data.title !== undefined) {
    (payload as any).title = data.title;
  }
  if ('folderId' in data) {
    (payload as any).folder_id = data.folderId ?? null;
  }
  if (data.durationSec !== undefined) {
    (payload as any).duration_sec = data.durationSec;
  }
  if (data.audioPath !== undefined) {
    (payload as any).audio_path = data.audioPath;
  }
  if (data.status !== undefined) {
    (payload as any).status = data.status;
  }

  return payload;
}

export const api = {
  // Transcription endpoints
  async startTranscription(): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/transcriptions/start`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to start transcription');
    return response.json();
  },

  async uploadAudioFile(file: File): Promise<{ id: string; transcript: string; ai_insights: unknown[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/transcriptions`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload audio');
    return response.json();
  },

  async finalizeTranscription(): Promise<void> {
    // Not needed anymore - handled by WebSocket close
    return Promise.resolve();
  },

  // WebSocket for streaming transcription
  subscribeToTranscription(
    id: string,
    onEvent: (event: StreamEvent) => void
  ): { unsubscribe: () => void; sendTranscript: (text: string) => void } {
    const ws = new WebSocket(`${WS_BASE_URL}/transcriptions/${id}/stream`);

    ws.onopen = () => {
      console.log('WebSocket connected for session:', id);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data as StreamEvent);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
        onEvent({
          type: 'error',
          message: 'Received malformed data from transcription stream',
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onEvent({
        type: 'error',
        message: 'Real-time connection error. Your current transcript is safe, but new audio may not be processed.',
      });
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed', { code: event.code, reason: event.reason, wasClean: event.wasClean });
      if (!event.wasClean) {
        onEvent({
          type: 'error',
          message: 'Real-time connection closed unexpectedly. You can stop recording and save what you have.',
        });
      }
    };

    const sendTranscript = (text: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'transcript_chunk', text }));
      }
    };

    const unsubscribe = () => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'finalize' }));
        }
      } finally {
        ws.close();
      }
    };

    return { unsubscribe, sendTranscript };
  },

  // Generation endpoints
  async generate(request: GenerateRequest): Promise<{ type: string; content: string }> {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to generate content');
    return response.json();
  },

  // Library endpoints
  async getLectures(folderId?: string): Promise<Lecture[]> {
    const url = folderId 
      ? `${API_BASE_URL}/lectures?folder_id=${folderId}`
      : `${API_BASE_URL}/lectures`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch lectures');
    const data: LectureApi[] = await response.json();
    return data.map(mapLectureFromApi);
  },

  async createLecture(data: Omit<Lecture, 'id' | 'createdAt'>): Promise<Lecture> {
    const response = await fetch(`${API_BASE_URL}/lectures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapLectureToApiInput(data)),
    });
    if (!response.ok) throw new Error('Failed to create lecture');
    const json: LectureApi = await response.json();
    return mapLectureFromApi(json);
  },

  async updateLecture(id: string, data: Partial<Omit<Lecture, 'id' | 'createdAt'>>): Promise<Lecture> {
    const response = await fetch(`${API_BASE_URL}/lectures/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapLectureToApiInput(data)),
    });
    if (!response.ok) throw new Error('Failed to update lecture');
    const json: LectureApi = await response.json();
    return mapLectureFromApi(json);
  },

  async deleteLecture(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/lectures/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete lecture');
  },

  // Folder endpoints
  async getFolders(): Promise<Folder[]> {
    const response = await fetch(`${API_BASE_URL}/folders`);
    if (!response.ok) throw new Error('Failed to fetch folders');
    return response.json();
  },

  async createFolder(name: string): Promise<Folder> {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create folder');
    return response.json();
  },

  async deleteFolder(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete folder');
  },

  // Auth endpoints (not implemented yet in backend)
  async signUp(): Promise<{ token: string }> {
    // TODO: Implement when auth is added to backend
    return Promise.resolve({ token: 'mock-jwt-token' });
  },

  async signIn(): Promise<{ token: string }> {
    // TODO: Implement when auth is added to backend
    return Promise.resolve({ token: 'mock-jwt-token' });
  },
};

