import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Lecture, Folder } from '../types';
import { api } from '../services/api';

interface LibraryContextType {
  lectures: Lecture[];
  folders: Folder[];
  selectedFolder: string | null;
  loading: boolean;
  addLecture: (lecture: Omit<Lecture, 'id' | 'createdAt'>) => Promise<void>;
  deleteLecture: (id: string) => Promise<void>;
  updateLecture: (id: string, updates: Partial<Lecture>) => Promise<void>;
  addFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setSelectedFolder: (id: string | null) => void;
  addLectureToFolder: (lectureId: string, folderId: string) => Promise<void>;
  refreshLectures: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lecturesData, foldersData] = await Promise.all([
        api.getLectures(),
        api.getFolders(),
      ]);
      setLectures(lecturesData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLectures = async () => {
    try {
      const lecturesData = await api.getLectures();
      setLectures(lecturesData);
    } catch (error) {
      console.error('Failed to refresh lectures:', error);
    }
  };

  const addLecture = async (lecture: Omit<Lecture, 'id' | 'createdAt'>) => {
    try {
      const newLecture = await api.createLecture(lecture);
      setLectures((prev) => [newLecture, ...prev]);
      
      // Update folder count if applicable
      if (lecture.folderId) {
        setFolders((prev) =>
          prev.map((f) => f.id === lecture.folderId ? { ...f, count: f.count + 1 } : f)
        );
      }
    } catch (error) {
      console.error('Failed to add lecture:', error);
      throw error;
    }
  };

  const deleteLecture = async (id: string) => {
    try {
      const lecture = lectures.find((l) => l.id === id);
      await api.deleteLecture(id);
      setLectures((prev) => prev.filter((l) => l.id !== id));
      
      // Update folder count if applicable
      if (lecture?.folderId) {
        setFolders((prev) =>
          prev.map((f) => f.id === lecture.folderId ? { ...f, count: Math.max(0, f.count - 1) } : f)
        );
      }
    } catch (error) {
      console.error('Failed to delete lecture:', error);
      throw error;
    }
  };

  const updateLecture = async (id: string, updates: Partial<Lecture>) => {
    try {
      const updatedLecture = await api.updateLecture(id, updates);
      setLectures((prev) =>
        prev.map((lecture) => (lecture.id === id ? updatedLecture : lecture))
      );
    } catch (error) {
      console.error('Failed to update lecture:', error);
      throw error;
    }
  };

  const addFolder = async (name: string) => {
    try {
      const newFolder = await api.createFolder(name);
      setFolders((prev) => [...prev, newFolder]);
    } catch (error) {
      console.error('Failed to add folder:', error);
      throw error;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await api.deleteFolder(id);
      
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
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  };

  const addLectureToFolder = async (lectureId: string, folderId: string) => {
    try {
      const lecture = lectures.find((l) => l.id === lectureId);
      const oldFolderId = lecture?.folderId;
      
      await updateLecture(lectureId, { folderId });
      
      // Update folder counts
      setFolders((prev) =>
        prev.map((f) => {
          if (f.id === folderId) return { ...f, count: f.count + 1 };
          if (f.id === oldFolderId) return { ...f, count: Math.max(0, f.count - 1) };
          return f;
        })
      );
    } catch (error) {
      console.error('Failed to add lecture to folder:', error);
      throw error;
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        lectures,
        folders,
        selectedFolder,
        loading,
        addLecture,
        deleteLecture,
        updateLecture,
        addFolder,
        deleteFolder,
        setSelectedFolder,
        addLectureToFolder,
        refreshLectures,
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

