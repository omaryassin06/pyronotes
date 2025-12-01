import type { GenerateResult } from '../../types';
import { NotesView } from './NotesView';
import { FlashcardsView } from './FlashcardsView';
import { QuizView } from './QuizView';

interface GenerateResultPanelProps {
  result: GenerateResult | null;
  onClose: () => void;
}

export function GenerateResultPanel({ result, onClose }: GenerateResultPanelProps) {
  if (!result) return null;

  const getIcon = () => {
    switch (result.type) {
      case 'notes':
        return '📝';
      case 'flashcards':
        return '🗂️';
      case 'quiz':
        return '✅';
    }
  };

  const getTitle = () => {
    switch (result.type) {
      case 'notes':
        return 'Study Notes';
      case 'flashcards':
        return 'Flashcards';
      case 'quiz':
        return 'Quiz';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getIcon()}</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 rounded"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {result.loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pyro-500 border-t-transparent" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Generating your {getTitle().toLowerCase()}...
                  </p>
                </div>
              </div>
              {/* Skeleton loading */}
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 mt-2" />
                  </div>
                ))}
              </div>
            </div>
          ) : result.error ? (
            <div className="p-6 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Generation Failed
                  </h3>
                  <p className="mt-1 text-sm text-red-800 dark:text-red-200">{result.error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {result.type === 'notes' && (
                <NotesView content={result.content} />
              )}

              {result.type === 'flashcards' && (
                <FlashcardsView rawContent={result.content} />
              )}

              {result.type === 'quiz' && (
                <QuizView rawContent={result.content} />
              )}
            </div>
          )}
        </div>

        {!result.loading && !result.error && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
