import { useState, useEffect, useRef } from 'react';
import type { Lecture } from '../../types';
import { useLibrary } from '../../contexts/LibraryContext';

interface ManageFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
}

export function ManageFolderModal({ isOpen, onClose, lecture }: ManageFolderModalProps) {
  const { folders, addLectureToFolder } = useLibrary();
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && lecture) {
      setSelectedFolderId(lecture.folderId || '');

      // Focus trap
      const firstFocusable = modalRef.current?.querySelector('button');
      firstFocusable?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // ESC key handler
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, lecture, onClose]);

  if (!isOpen || !lecture) return null;

  const handleSave = () => {
    if (selectedFolderId) {
      addLectureToFolder(lecture.id, selectedFolderId);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="folder-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 id="folder-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                Add to Folder
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                {lecture.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 rounded"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Folder
          </label>
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pyro-500 focus:border-transparent"
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                📁 {folder.name} ({folder.count})
              </option>
            ))}
          </select>

          {folders.length === 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No folders yet. Create one from the sidebar to organize your lectures.
            </p>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFolderId}
            className="px-6 py-2 rounded-lg bg-gradient-pyro text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

