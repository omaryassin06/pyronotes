import { useEffect, useRef, useState } from 'react';
import { useTranscription } from '../../contexts/TranscriptionContext';

export function TranscriptionStream() {
  const { session } = useTranscription();
  const [activeTab, setActiveTab] = useState<'transcript' | 'ai'>('transcript');
  const transcriptRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (activeTab === 'transcript' && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [session?.transcript, activeTab]);

  useEffect(() => {
    if (activeTab === 'ai' && aiRef.current) {
      aiRef.current.scrollTop = aiRef.current.scrollHeight;
    }
  }, [session?.aiInsights, activeTab]);

  if (!session) return null;

  const hasTranscript = session.transcript.length > 0;
  const hasAiInsights = session.aiInsights.length > 0;

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 px-6 py-4 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pyro-500 ${
            activeTab === 'transcript'
              ? 'bg-white dark:bg-gray-950 text-pyro-600 dark:text-pyro-400 border-b-2 border-pyro-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Live Transcript
          {hasTranscript && (
            <span className="ml-2 inline-flex items-center justify-center w-2 h-2 rounded-full bg-pyro-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 px-6 py-4 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pyro-500 ${
            activeTab === 'ai'
              ? 'bg-white dark:bg-gray-950 text-pyro-600 dark:text-pyro-400 border-b-2 border-pyro-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Lecture Buddy
          {hasAiInsights && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-pyro-100 dark:bg-pyro-900 text-pyro-700 dark:text-pyro-300">
              {session.aiInsights.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-950">
        {activeTab === 'transcript' && (
          <div
            ref={transcriptRef}
            className="h-64 overflow-y-auto p-6 text-base text-gray-700 dark:text-gray-300 leading-relaxed"
            aria-live="polite"
            aria-atomic="false"
          >
            {hasTranscript ? (
              <p className="whitespace-pre-wrap">{session.transcript}</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-600 italic">
                Transcription will appear here as you speak...
              </p>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div
            ref={aiRef}
            className="h-64 overflow-y-auto p-6"
            aria-live="polite"
            aria-atomic="false"
          >
            {hasAiInsights ? (
              <div className="space-y-3">
                {session.aiInsights.map((card, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg shadow-sm ${
                      card.subtype === 'definition'
                        ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                        : 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <h3 className={`font-semibold text-lg mb-1 ${
                      card.subtype === 'definition'
                        ? 'text-blue-800 dark:text-blue-200'
                        : 'text-amber-800 dark:text-amber-200'
                    }`}>
                      {card.subtype === 'definition' ? 'Definition' : 'Explanation'}:{' '}
                      <span className="font-bold">{card.term}</span>
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {card.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-600 italic">
                AI insights will appear here as you speak...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Status indicator */}
      {session.status === 'transcribing' && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950 border-t border-amber-200 dark:border-amber-900">
          <div className="flex items-center space-x-2 text-sm text-amber-800 dark:text-amber-200">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
            <span>Processing transcription...</span>
          </div>
        </div>
      )}
    </div>
  );
}
