import { useEffect, useMemo, useRef, useState } from 'react';
import { exportElementToPdf } from '../../utils/pdfExport';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsViewProps {
  rawContent: string;
}

type Mode = 'grid' | 'study';

export function FlashcardsView({ rawContent }: FlashcardsViewProps) {
  const [mode, setMode] = useState<Mode>('grid');
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const studyRef = useRef<HTMLDivElement | null>(null);

  const parsed = useMemo<Flashcard[] | { error: string }>(() => {
    try {
      const data = JSON.parse(rawContent);
      if (!Array.isArray(data)) {
        return { error: 'Unexpected flashcards format from AI.' };
      }

      const cleaned: Flashcard[] = data
        .filter(
          (item: any) =>
            item &&
            typeof item.question === 'string' &&
            typeof item.answer === 'string'
        )
        .map((item: any) => ({
          question: item.question,
          answer: item.answer,
        }));

      if (!cleaned.length) {
        return { error: 'No valid flashcards were returned by the AI.' };
      }

      return cleaned;
    } catch {
      return {
        error: 'Failed to read flashcards. Please try generating again.',
      };
    }
  }, [rawContent]);

  useEffect(() => {
    setFlipped(false);
  }, [activeIndex]);

  useEffect(() => {
    if (mode !== 'study') return;

    const handleKey = (e: KeyboardEvent) => {
      if (!Array.isArray(parsed)) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((i) => Math.min(i + 1, parsed.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, parsed]);

  const handleDownloadPdf = async () => {
    const target =
      mode === 'grid' ? gridRef.current : studyRef.current ?? gridRef.current;
    if (!target || !Array.isArray(parsed)) return;
    await exportElementToPdf(target, 'flashcards.pdf');
  };

  if (!Array.isArray(parsed)) {
    return (
      <ErrorBox
        title="Flashcards Unavailable"
        message={parsed.error}
      />
    );
  }

  const active = parsed[activeIndex];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🗂️ Flashcards
          </h3>
          <ModeToggle mode={mode} setMode={setMode} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {parsed.length} cards
          </span>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
            />
          </svg>
          Download PDF
        </button>
      </div>

      {mode === 'grid' ? (
        <div
          ref={gridRef}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto pr-1"
        >
          {parsed.map((card, index) => (
            <div
              key={index}
              className="group relative h-40 cursor-pointer [perspective:800px]"
              onClick={() => {
                setMode('study');
                setActiveIndex(index);
                setFlipped(false);
              }}
            >
              <div className="absolute inset-0 rounded-xl bg-white/80 dark:bg-gray-900/80 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col p-4 transition-transform duration-300 group-hover:-translate-y-1">
                <div className="text-xs font-medium text-pyro-600 dark:text-pyro-400 mb-2">
                  Card {index + 1}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-4">
                  {card.question}
                </div>
                <div className="mt-auto text-xs text-gray-500 dark:text-gray-400">
                  Click to study →
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={studyRef}
          className="flex flex-col gap-4 items-center justify-between h-full"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Card {activeIndex + 1} of {parsed.length}
          </div>

          <div className="flex-1 flex items-center justify-center w-full">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="relative w-full max-w-xl h-64 [perspective:1000px] focus-visible:outline-none"
            >
              <div
                className={[
                  'relative w-full h-full rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-5 transition-transform duration-500 [transform-style:preserve-3d]',
                  flipped ? '[transform:rotateY(180deg)]' : '',
                ].join(' ')}
              >
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col">
                  <div className="text-xs font-medium text-pyro-600 dark:text-pyro-400 mb-2">
                    Question
                  </div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {active.question}
                  </div>
                  <div className="mt-auto text-xs text-gray-500 dark:text-gray-400">
                    Click or press Space / Enter to flip
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col">
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                    Answer
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {active.answer}
                  </div>
                  <div className="mt-auto text-xs text-gray-500 dark:text-gray-400">
                    Click or press Space / Enter to flip back
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between w-full max-w-xl gap-4">
            <button
              type="button"
              onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
              disabled={activeIndex === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => setMode('grid')}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Back to Grid
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((i) => Math.min(i + 1, parsed.length - 1))
              }
              disabled={activeIndex === parsed.length - 1}
              className="px-4 py-2 rounded-lg bg-pyro-600 text-white text-sm font-medium disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 p-0.5 text-xs">
      <button
        type="button"
        onClick={() => setMode('grid')}
        className={
          'px-3 py-1 rounded-full ' +
          (mode === 'grid'
            ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-300')
        }
      >
        Grid
      </button>
      <button
        type="button"
        onClick={() => setMode('study')}
        className={
          'px-3 py-1 rounded-full ' +
          (mode === 'study'
            ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-300')
        }
      >
        Study
      </button>
    </div>
  );
}

function ErrorBox({ title, message }: { title: string; message: string }) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
      <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-red-800 dark:text-red-200">{message}</p>
    </div>
  );
}


