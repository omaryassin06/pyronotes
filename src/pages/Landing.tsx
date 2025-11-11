import { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
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
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] bg-gradient-pyro-subtle blur-3xl opacity-50 dark:opacity-30" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-10">
        {/* Hero Section */}
        <Hero />

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

