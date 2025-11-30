import { useState } from 'react';
import type { Lecture, GenerateType, GenerateResult } from '../../types';
import { useLibrary } from '../../contexts/LibraryContext';
import { GeneratePromptModal } from '../generate/GeneratePromptModal';
import { GenerateResultPanel } from '../generate/GenerateResultPanel';
import { ManageFolderModal } from './ManageFolderModal';
import { AudioPlayer } from './AudioPlayer';
import { api } from '../../services/api';

interface LecturesListProps {
  lectures: Lecture[];
}

export function LecturesList({ lectures }: LecturesListProps) {
  const { deleteLecture, folders } = useLibrary();
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);
  const [manageFolderModalOpen, setManageFolderModalOpen] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleGenerate = async (type: GenerateType) => {
    if (!selectedLecture) return;

    setGenerateResult({
      type,
      content: '',
      loading: true,
    });

    try {
      const result = await api.generate({
        type,
        scope: 'lecture',
        id: selectedLecture.id,
      });

      setGenerateResult({
        type,
        content: result.content || 'Generated content',
        loading: false,
      });
    } catch (error) {
      setGenerateResult({
        type,
        content: '',
        loading: false,
        error: 'Failed to generate content. Please try again.',
      });
    }
  };

  const handleAddToFolder = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setManageFolderModalOpen(true);
  };

  const getStatusBadge = (status: Lecture['status']) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            Ready
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
            <svg className="animate-spin -ml-0.5 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
            Error
          </span>
        );
    }
  };

  if (lectures.length === 0) {
    return (
      <div className="p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No lectures found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Start by recording or uploading your first lecture.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lectures.map((lecture) => {
        const folderName = folders.find((f) => f.id === lecture.folderId)?.name;

        return (
          <div
            key={lecture.id}
            className="py-6 border-b border-gray-100 dark:border-gray-900 last:border-0"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {lecture.title}
                  </h3>
                  {getStatusBadge(lecture.status)}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-gray-500 dark:text-gray-400 mb-4">
                  {lecture.durationSec && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(lecture.durationSec)}
                    </span>
                  )}
                  <span>{formatDate(lecture.createdAt)}</span>
                  {folderName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      📁 {folderName}
                    </span>
                  )}
                </div>

                {/* Audio Player */}
                {lecture.status === 'ready' && (
                  <AudioPlayer lectureId={lecture.id} lectureTitle={lecture.title} />
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedLecture(lecture);
                    setGenerateModalOpen(true);
                  }}
                  disabled={lecture.status !== 'ready'}
                  className="p-2 rounded-lg text-pyro-600 dark:text-pyro-400 hover:bg-pyro-50 dark:hover:bg-pyro-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate study materials"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handleAddToFolder(lecture)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
                  title="Add to folder"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => deleteLecture(lecture.id)}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  title="Delete lecture"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Generate Modal */}
      <GeneratePromptModal
        isOpen={generateModalOpen}
        onClose={() => {
          setGenerateModalOpen(false);
          setSelectedLecture(null);
        }}
        onGenerate={handleGenerate}
        scope="lecture"
        title={selectedLecture?.title}
      />

      {/* Generate Result */}
      <GenerateResultPanel
        result={generateResult}
        onClose={() => setGenerateResult(null)}
      />

      {/* Manage Folder Modal */}
      <ManageFolderModal
        isOpen={manageFolderModalOpen}
        onClose={() => {
          setManageFolderModalOpen(false);
          setSelectedLecture(null);
        }}
        lecture={selectedLecture}
      />
    </div>
  );
}

