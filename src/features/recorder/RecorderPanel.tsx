import { useState, useEffect, useRef } from 'react';
import { useTranscription } from '../../contexts/TranscriptionContext';
import { TranscriptionStream } from './TranscriptionStream';

export function RecorderPanel() {
  const { session, startRecording, stopRecording, uploadAudio } = useTranscription();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (session?.status === 'recording') {
      setIsRecording(true);
      intervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        // Simulate audio level fluctuation
        setAudioLevel(Math.random() * 0.8 + 0.2);
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

  const handleStartRecording = async () => {
    setElapsedTime(0);
    await startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording();
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

  return (
    <div id="recorder" className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/60 dark:border-gray-800/60 p-6 shadow-sm hover:shadow-md transition-shadow scroll-mt-20">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Record or Upload
      </h2>

      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center space-x-4">
          {!session || session.status === 'done' ? (
            <>
              <button
                onClick={handleStartRecording}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-pyro text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
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
                className="flex-1 px-6 py-3 rounded-lg border-2 border-pyro-500 text-pyro-600 dark:text-pyro-400 font-medium hover:bg-pyro-50 dark:hover:bg-pyro-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
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
            </>
          ) : (
            <button
              onClick={handleStopRecording}
              className="w-full px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              disabled={session.status !== 'recording'}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <rect x="6" y="6" width="8" height="8" rx="1" />
                </svg>
                <span>Stop Recording</span>
              </div>
            </button>
          )}
        </div>

        {/* Timer and Audio Level */}
        {isRecording && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Recording
              </span>
              <span className="text-2xl font-mono font-bold text-pyro-600 dark:text-pyro-400">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-pyro transition-all duration-150"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
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

        {/* Transcription Stream */}
        {session && (session.status === 'recording' || session.status === 'transcribing' || session.status === 'done') && (
          <TranscriptionStream />
        )}
      </div>
    </div>
  );
}

