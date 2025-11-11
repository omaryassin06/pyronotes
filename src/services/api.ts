import type { Lecture, Folder, GenerateRequest, StreamEvent } from '../types';

// API stubs for backend integration

export const api = {
  // Transcription endpoints
  async startTranscription(): Promise<{ id: string }> {
    // POST /api/transcriptions
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: `session-${Date.now()}` });
      }, 500);
    });
  },

  async finalizeTranscription(_id: string): Promise<void> {
    // POST /api/transcriptions/:id/finalize
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },

  // WebSocket/SSE for streaming transcription
  subscribeToTranscription(
    _id: string,
    _onEvent: (event: StreamEvent) => void
  ): () => void {
    // WS/SSE /api/transcriptions/:id/stream
    // For now, returns a cleanup function
    // In real implementation, this would open a WebSocket or EventSource
    
    return () => {
      // Cleanup function
    };
  },

  // Generation endpoints
  async generate(request: GenerateRequest): Promise<{ resultUrl?: string; payload?: any }> {
    // POST /api/generate
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          payload: {
            type: request.type,
            content: `Generated ${request.type} for ${request.scope} ${request.id}`,
          },
        });
      }, 2000);
    });
  },

  // Library endpoints
  async getLectures(_folderId?: string): Promise<Lecture[]> {
    // GET /api/lectures?folderId=...
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 300);
    });
  },

  async createLecture(data: Omit<Lecture, 'id' | 'createdAt'>): Promise<Lecture> {
    // POST /api/lectures
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...data,
          id: `lecture-${Date.now()}`,
          createdAt: new Date().toISOString(),
        });
      }, 300);
    });
  },

  async deleteLecture(_id: string): Promise<void> {
    // DELETE /api/lectures/:id
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  // Folder endpoints
  async getFolders(): Promise<Folder[]> {
    // GET /api/folders
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 300);
    });
  },

  async createFolder(name: string): Promise<Folder> {
    // POST /api/folders
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `folder-${Date.now()}`,
          name,
          count: 0,
        });
      }, 300);
    });
  },

  async deleteFolder(_id: string): Promise<void> {
    // DELETE /api/folders/:id
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  // Auth endpoints
  async signUp(_email: string, _password: string, _name: string): Promise<{ token: string }> {
    // POST /api/auth/signup
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ token: 'mock-jwt-token' });
      }, 1000);
    });
  },

  async signIn(_email: string, _password: string): Promise<{ token: string }> {
    // POST /api/auth/signin
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ token: 'mock-jwt-token' });
      }, 1000);
    });
  },
};

