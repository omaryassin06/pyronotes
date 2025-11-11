import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lecture, Folder } from '../types';

interface LibraryContextType {
  lectures: Lecture[];
  folders: Folder[];
  selectedFolder: string | null;
  addLecture: (lecture: Omit<Lecture, 'id' | 'createdAt'>) => void;
  deleteLecture: (id: string) => void;
  updateLecture: (id: string, updates: Partial<Lecture>) => void;
  addFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  setSelectedFolder: (id: string | null) => void;
  addLectureToFolder: (lectureId: string, folderId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Mock data
const mockLectures: Lecture[] = [
  {
    id: '1',
    title: 'Introduction to React Hooks',
    folderId: 'f1',
    durationSec: 1800,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'ready',
  },
  {
    id: '2',
    title: 'Advanced TypeScript Patterns',
    folderId: 'f1',
    durationSec: 2400,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'ready',
  },
  {
    id: '3',
    title: 'Database Design Fundamentals',
    folderId: 'f2',
    durationSec: 3600,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'ready',
  },
  {
    id: '4',
    title: 'Machine Learning Basics',
    durationSec: 2700,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'processing',
  },
];

const mockFolders: Folder[] = [
  { id: 'f1', name: 'Web Development', count: 2 },
  { id: 'f2', name: 'Computer Science', count: 1 },
  { id: 'f3', name: 'Data Science', count: 0 },
];

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [lectures, setLectures] = useState<Lecture[]>(mockLectures);
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const addLecture = (lecture: Omit<Lecture, 'id' | 'createdAt'>) => {
    const newLecture: Lecture = {
      ...lecture,
      id: `lecture-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLectures((prev) => [newLecture, ...prev]);
    
    // Update folder count if applicable
    if (lecture.folderId) {
      setFolders((prev) =>
        prev.map((f) => f.id === lecture.folderId ? { ...f, count: f.count + 1 } : f)
      );
    }
  };

  const deleteLecture = (id: string) => {
    const lecture = lectures.find((l) => l.id === id);
    setLectures((prev) => prev.filter((l) => l.id !== id));
    
    // Update folder count if applicable
    if (lecture?.folderId) {
      setFolders((prev) =>
        prev.map((f) => f.id === lecture.folderId ? { ...f, count: Math.max(0, f.count - 1) } : f)
      );
    }
  };

  const updateLecture = (id: string, updates: Partial<Lecture>) => {
    setLectures((prev) =>
      prev.map((lecture) => (lecture.id === id ? { ...lecture, ...updates } : lecture))
    );
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      count: 0,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const deleteFolder = (id: string) => {
    // Remove folder association from lectures
    setLectures((prev) =>
      prev.map((lecture) =>
        lecture.folderId === id ? { ...lecture, folderId: undefined } : lecture
      )
    );
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (selectedFolder === id) {
      setSelectedFolder(null);
    }
  };

  const addLectureToFolder = (lectureId: string, folderId: string) => {
    const lecture = lectures.find((l) => l.id === lectureId);
    const oldFolderId = lecture?.folderId;
    
    updateLecture(lectureId, { folderId });
    
    // Update folder counts
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id === folderId) return { ...f, count: f.count + 1 };
        if (f.id === oldFolderId) return { ...f, count: Math.max(0, f.count - 1) };
        return f;
      })
    );
  };

  return (
    <LibraryContext.Provider
      value={{
        lectures,
        folders,
        selectedFolder,
        addLecture,
        deleteLecture,
        updateLecture,
        addFolder,
        deleteFolder,
        setSelectedFolder,
        addLectureToFolder,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}

