import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';

export function FolderSidebar() {
  const { folders, selectedFolder, setSelectedFolder, addFolder, deleteFolder } = useLibrary();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Folders
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 rounded text-pyro-600 dark:text-pyro-400 hover:bg-pyro-50 dark:hover:bg-pyro-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
          title="Create new folder"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* All Lectures */}
      <button
        onClick={() => setSelectedFolder(null)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 ${
          selectedFolder === null
            ? 'bg-pyro-100 dark:bg-pyro-900 text-pyro-800 dark:text-pyro-200'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span>All Lectures</span>
        </div>
      </button>

      {/* Folder List */}
      {folders.map((folder) => (
        <div
          key={folder.id}
          className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedFolder === folder.id
              ? 'bg-pyro-100 dark:bg-pyro-900 text-pyro-800 dark:text-pyro-200'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <button
            onClick={() => setSelectedFolder(folder.id)}
            className="flex-1 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 rounded"
          >
            <div className="flex items-center space-x-2">
              <span>📁</span>
              <span className="truncate">{folder.name}</span>
            </div>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{folder.count}</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete folder "${folder.name}"?`)) {
                deleteFolder(folder.id);
              }
            }}
            className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:opacity-100"
            title="Delete folder"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ))}

      {/* Create Folder Form */}
      {isCreating && (
        <form onSubmit={handleCreateFolder} className="mt-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pyro-500 focus:border-transparent"
          />
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-gradient-pyro text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewFolderName('');
              }}
              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

