import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import { LecturesList } from './LecturesList';
import { FolderSidebar } from './FolderSidebar';
import { GeneratePromptModal } from '../generate/GeneratePromptModal';
import { GenerateResultPanel } from '../generate/GenerateResultPanel';
import type { GenerateType, GenerateResult } from '../../types';
import { api } from '../../services/api';

export function LecturesLibrary() {
  const { lectures, folders, selectedFolder, setSelectedFolder } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderSidebar, setShowFolderSidebar] = useState(true);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder ? lecture.folderId === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  const selectedFolderName = folders.find((f) => f.id === selectedFolder)?.name;

  const handleFolderGenerate = async (type: GenerateType) => {
    if (!selectedFolder) return;

    setGenerateResult({
      type,
      content: '',
      loading: true,
    });

    try {
      const result = await api.generate({
        type,
        scope: 'folder',
        id: selectedFolder,
      });

      setGenerateResult({
        type,
        content: result.payload?.content || 'Generated content',
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

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">My Lectures</h2>
          <button
            onClick={() => setShowFolderSidebar(!showFolderSidebar)}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
            aria-label="Toggle folder sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pyro-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {selectedFolder && (
            <button
              onClick={() => setGenerateModalOpen(true)}
              className="px-6 py-3 rounded-lg bg-gradient-pyro text-white text-base font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>Generate from Folder</span>
              </div>
            </button>
          )}
        </div>

        {selectedFolder && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Viewing:</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pyro-100 dark:bg-pyro-900 text-pyro-800 dark:text-pyro-200">
              📁 {selectedFolderName}
            </span>
            <button
              onClick={() => setSelectedFolder(null)}
              className="text-sm text-pyro-600 dark:text-pyro-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 rounded"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-12">
        {/* Folder Sidebar */}
        {showFolderSidebar && (
          <div className="w-64 flex-shrink-0">
            <FolderSidebar />
          </div>
        )}

        {/* Lectures List */}
        <div className="flex-1 min-w-0">
          <LecturesList lectures={filteredLectures} />
        </div>
      </div>

      {/* Generate Modal */}
      <GeneratePromptModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onGenerate={handleFolderGenerate}
        scope="folder"
        title={selectedFolderName}
      />

      {/* Generate Result */}
      <GenerateResultPanel
        result={generateResult}
        onClose={() => setGenerateResult(null)}
      />
    </div>
  );
}

