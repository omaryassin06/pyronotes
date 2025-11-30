import type { Lecture, Folder, GenerateRequest, StreamEvent } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';
const WS_BASE_URL = 'ws://localhost:8000/api';

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
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onEvent({ type: 'error', message: 'Connection error' });
    };
    
    ws.onclose = () => {
      console.log('WebSocket closed');
    };
    
    const sendTranscript = (text: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'transcript_chunk', text }));
      }
    };
    
    const unsubscribe = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'finalize' }));
      }
      ws.close();
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
    return response.json();
  },

  async createLecture(data: Omit<Lecture, 'id' | 'createdAt'>): Promise<Lecture> {
    const response = await fetch(`${API_BASE_URL}/lectures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create lecture');
    return response.json();
  },

  async updateLecture(id: string, data: Partial<Omit<Lecture, 'id' | 'createdAt'>>): Promise<Lecture> {
    const response = await fetch(`${API_BASE_URL}/lectures/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update lecture');
    return response.json();
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

