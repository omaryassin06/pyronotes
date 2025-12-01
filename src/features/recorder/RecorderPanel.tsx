import { useState, useEffect, useRef } from 'react';
import { useTranscription } from '../../contexts/TranscriptionContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { TranscriptionStream } from './TranscriptionStream';
import { api } from '../../services/api';
import type { GenerateType, GenerateResult } from '../../types';

export function RecorderPanel() {
  const { session, audioLevel, startRecording, stopRecording, uploadAudio, saveRecording, resetSession } = useTranscription();
  const { folders, refreshLectures } = useLibrary();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saveTitle, setSaveTitle] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showGenerateOptions, setShowGenerateOptions] = useState(false);
  const [savedLectureId, setSavedLectureId] = useState<string | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (session?.status === 'recording') {
      setIsRecording(true);
      intervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session?.status]);

  // Set default title when recording stops
  useEffect(() => {
    if (session?.status === 'done' && !saveTitle && !showGenerateOptions) {
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      setSaveTitle(`Live Recording - ${timestamp}`);
    }
  }, [session?.status, saveTitle, showGenerateOptions]);

  const handleStartRecording = async () => {
    setElapsedTime(0);
    setSaveTitle('');
    setSelectedFolder('');
    setShowGenerateOptions(false);
    setSavedLectureId(null);
    setGenerateResult(null);
    await startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleSaveRecording = async () => {
    if (!saveTitle.trim()) {
      alert('Please enter a title for your recording');
      return;
    }
    
    if (!session) return;
    
    await saveRecording(saveTitle.trim(), selectedFolder || undefined);
    await refreshLectures();
    
    // Show generate options instead of resetting
    setSavedLectureId(session.id);
    setShowGenerateOptions(true);
  };

  const handleGenerate = async (type: GenerateType) => {
    if (!savedLectureId) return;
    
    setGenerateResult({
      type,
      content: '',
      loading: true,
    });
    
    try {
      const result = await api.generate({
        type,
        scope: 'lecture',
        id: savedLectureId,
      });
      
      setGenerateResult({
        type,
        content: result.content,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to generate:', error);
      setGenerateResult({
        type,
        content: '',
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to generate content',
      });
    }
  };

  const handleSkipGenerate = () => {
    // Reset everything and go back to start
    resetSession();
    setSaveTitle('');
    setSelectedFolder('');
    setShowGenerateOptions(false);
    setSavedLectureId(null);
    setGenerateResult(null);
  };

  const handleDiscardRecording = () => {
    if (confirm('Are you sure you want to discard this recording?')) {
      resetSession();
      setSaveTitle('');
      setSelectedFolder('');
      setShowGenerateOptions(false);
      setSavedLectureId(null);
      setGenerateResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAudio(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGenerateButtonLabel = (type: GenerateType) => {
    switch (type) {
      case 'notes':
        return 'Generate Study Notes';
      case 'flashcards':
        return 'Generate Flashcards';
      case 'quiz':
        return 'Generate Quiz';
    }
  };

  return (
    <div id="recorder" className="scroll-mt-20">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-10">
        Record or Upload
      </h2>

      <div className="space-y-6">
        {/* Recording Controls */}
        {(!session || session.status === 'saving') && !showGenerateOptions && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleStartRecording}
              disabled={session?.status === 'saving'}
              className="flex-1 px-8 py-4 rounded-lg bg-gradient-pyro text-white text-lg font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Start Recording</span>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={session?.status === 'saving'}
              className="flex-1 px-8 py-4 rounded-lg border-2 border-pyro-500 text-pyro-600 dark:text-pyro-400 text-lg font-medium hover:bg-pyro-50 dark:hover:bg-pyro-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Upload Audio</span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {session && session.status === 'recording' && (
          <button
            onClick={handleStopRecording}
            className="w-full px-8 py-4 rounded-lg bg-red-600 text-white text-lg font-medium hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
          >
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <rect x="6" y="6" width="8" height="8" rx="1" />
              </svg>
              <span>Stop Recording</span>
            </div>
          </button>
        )}

        {/* Timer and Audio Level */}
        {isRecording && (
          <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-600 dark:text-gray-400">
                Recording
              </span>
              <span className="text-3xl font-mono font-bold text-pyro-600 dark:text-pyro-400">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-pyro transition-all duration-150"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Save Recording Panel */}
        {session?.status === 'done' && !showGenerateOptions && (
          <div className="p-6 bg-gradient-to-br from-pyro-50 to-orange-50 dark:from-pyro-950 dark:to-orange-950 rounded-lg border-2 border-pyro-200 dark:border-pyro-800 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pyro-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recording Complete!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duration: {formatTime(session.durationSec)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter a title for your recording"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pyro-500"
                />
              </div>

              <div>
                <label htmlFor="folder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder (Optional)
                </label>
                <select
                  id="folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pyro-500"
                >
                  <option value="">No folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveRecording}
                  className="flex-1 px-6 py-3 rounded-lg bg-pyro-600 text-white font-medium hover:bg-pyro-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                >
                  Save to Library
                </button>
                <button
                  onClick={handleDiscardRecording}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Options Panel */}
        {showGenerateOptions && !generateResult && (
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Saved Successfully!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  "{saveTitle}" has been added to your library
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generate study materials from this recording:
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleGenerate('notes')}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Study Notes
                </button>
                
                <button
                  onClick={() => handleGenerate('flashcards')}
                  className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Generate Flashcards
                </button>
                
                <button
                  onClick={() => handleGenerate('quiz')}
                  className="px-6 py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Generate Quiz
                </button>
              </div>

              <button
                onClick={handleSkipGenerate}
                className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                Skip & Go to Library
              </button>
            </div>
          </div>
        )}

        {/* Generate Result Panel */}
        {generateResult && (
          <div className="p-6 bg-white dark:bg-gray-950 rounded-lg border-2 border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getGenerateButtonLabel(generateResult.type)}
              </h3>
              <button
                onClick={handleSkipGenerate}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Close & Go to Library
              </button>
            </div>

            {generateResult.loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pyro-500 border-t-transparent mx-auto" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generating content with AI...
                  </p>
                </div>
              </div>
            )}

            {generateResult.error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {generateResult.error}
                </p>
              </div>
            )}

            {!generateResult.loading && !generateResult.error && generateResult.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-sm">{generateResult.content}</pre>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setGenerateResult(null)}
                    className="px-6 py-2 rounded-lg bg-pyro-600 text-white font-medium hover:bg-pyro-700 transition-colors"
                  >
                    Generate Another
                  </button>
                  <button
                    onClick={handleSkipGenerate}
                    className="px-6 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {session?.status === 'uploading' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Uploading audio file...
              </span>
            </div>
          </div>
        )}

        {/* Saving Progress */}
        {session?.status === 'saving' && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Saving recording to library...
              </span>
            </div>
          </div>
        )}

        {/* Transcription Stream */}
        {session &&
          (session.status === 'recording' ||
            session.status === 'transcribing' ||
            session.status === 'done') && (
            <TranscriptionStream />
          )}
      </div>
    </div>
  );
}

