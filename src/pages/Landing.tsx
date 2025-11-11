import { useState, useEffect } from 'react';
import { RecorderPanel } from '../features/recorder/RecorderPanel';
import { LecturesLibrary } from '../features/library/LecturesLibrary';
import { GeneratePromptModal } from '../features/generate/GeneratePromptModal';
import { GenerateResultPanel } from '../features/generate/GenerateResultPanel';
import { useTranscription } from '../contexts/TranscriptionContext';
import { useLibrary } from '../contexts/LibraryContext';
import type { GenerateType, GenerateResult } from '../types';
import { api } from '../services/api';

export function Landing() {
  const { session, resetSession } = useTranscription();
  const { addLecture } = useLibrary();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);

  // Show generate modal when recording is done
  useEffect(() => {
    if (session?.status === 'done' && session.transcript) {
      setShowGenerateModal(true);
    }
  }, [session?.status, session?.transcript]);

  const handleGenerate = async (type: GenerateType) => {
    if (!session) return;

    setGenerateResult({
      type,
      content: '',
      loading: true,
    });

    try {
      const result = await api.generate({
        type,
        scope: 'lecture',
        id: session.id,
      });

      setGenerateResult({
        type,
        content: result.payload?.content || 'Generated content',
        loading: false,
      });

      // Add lecture to library
      addLecture({
        title: `Lecture from ${new Date().toLocaleDateString()}`,
        status: 'ready',
        durationSec: session.durationSec,
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

  const handleCloseGenerate = () => {
    setShowGenerateModal(false);
    setGenerateResult(null);
    resetSession();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* Recording Block */}
        <RecorderPanel />

        {/* Library Block */}
        <div id="lectures">
          <LecturesLibrary />
        </div>
      </div>

      {/* Generate Modal */}
      <GeneratePromptModal
        isOpen={showGenerateModal}
        onClose={handleCloseGenerate}
        onGenerate={handleGenerate}
        scope="lecture"
        title={session?.transcript.slice(0, 50) + '...'}
      />

      {/* Generate Result */}
      <GenerateResultPanel result={generateResult} onClose={handleCloseGenerate} />
    </div>
  );
}

