import { useState, useEffect, useRef } from 'react';
import type { GenerateType } from '../../types';

interface GeneratePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: GenerateType) => void;
  scope: 'lecture' | 'folder';
  title?: string;
}

export function GeneratePromptModal({
  isOpen,
  onClose,
  onGenerate,
  scope,
  title,
}: GeneratePromptModalProps) {
  const [selectedType, setSelectedType] = useState<GenerateType>('notes');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    onGenerate(selectedType);
    onClose();
  };

  const options: { type: GenerateType; icon: string; title: string; description: string }[] = [
    {
      type: 'notes',
      icon: '📝',
      title: 'Study Notes',
      description: 'Comprehensive, organized notes with key concepts and summaries',
    },
    {
      type: 'flashcards',
      icon: '🗂️',
      title: 'Flashcards',
      description: 'Question and answer cards for active recall practice',
    },
    {
      type: 'quiz',
      icon: '✅',
      title: 'Quiz',
      description: 'Multiple-choice questions to test your understanding',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                Generate Study Materials
              </h2>
              {title && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  For: {title}
                </p>
              )}
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

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose what type of study materials you'd like to generate from {scope === 'lecture' ? 'this lecture' : 'all lectures in this folder'}:
          </p>

          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 ${
                  selectedType === option.type
                    ? 'border-pyro-500 bg-pyro-50 dark:bg-pyro-950'
                    : 'border-gray-200 dark:border-gray-800 hover:border-pyro-300 dark:hover:border-pyro-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {option.title}
                      </h3>
                      {selectedType === option.type && (
                        <svg
                          className="w-5 h-5 text-pyro-600 dark:text-pyro-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2 rounded-lg bg-gradient-pyro text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500"
          >
            Generate {options.find((o) => o.type === selectedType)?.title}
          </button>
        </div>
      </div>
    </div>
  );
}

