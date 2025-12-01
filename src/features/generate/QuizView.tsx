import { useMemo, useRef, useState } from 'react';
import { exportElementToPdf } from '../../utils/pdfExport';

interface QuizQuestion {
  question: string;
  options: string[];
  correct?: number | null;
}

interface QuizViewProps {
  rawContent: string;
}

export function QuizView({ rawContent }: QuizViewProps) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const parsed = useMemo<QuizQuestion[] | { error: string }>(() => {
    try {
      const data = JSON.parse(rawContent);
      if (!Array.isArray(data)) {
        return { error: 'Unexpected quiz format from AI.' };
      }

      const cleaned: QuizQuestion[] = data
        .filter(
          (item: any) =>
            item &&
            typeof item.question === 'string' &&
            Array.isArray(item.options) &&
            item.options.length >= 2
        )
        .map((item: any) => ({
          question: item.question,
          options: item.options.map((opt: any) => String(opt)),
          correct:
            typeof item.correct === 'number' && item.correct >= 0
              ? item.correct
              : null,
        }));

      if (!cleaned.length) {
        return { error: 'No valid quiz questions were returned by the AI.' };
      }

      return cleaned;
    } catch {
      return {
        error: 'Failed to read quiz questions. Please try generating again.',
      };
    }
  }, [rawContent]);

  const handleDownloadPdf = async () => {
    if (!containerRef.current || !Array.isArray(parsed)) return;
    await exportElementToPdf(containerRef.current, 'quiz.pdf');
  };

  if (!Array.isArray(parsed)) {
    return (
      <ErrorBox
        title="Quiz Unavailable"
        message={parsed.error}
      />
    );
  }

  const total = parsed.length;
  let score = 0;
  if (submitted) {
    parsed.forEach((q, i) => {
      const correct = q.correct;
      if (
        typeof correct === 'number' &&
        answers[i] != null &&
        answers[i] === correct
      ) {
        score += 1;
      }
    });
  }

  const handleChange = (qIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ✅ Quiz
          </h3>
          {submitted && (
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Score: {score}/{total} ({Math.round((score / total) * 100)}%)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
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
          {submitted ? (
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Retry
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 rounded-lg bg-pyro-600 text-white text-sm font-medium hover:bg-pyro-700"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="space-y-6 overflow-y-auto pr-1"
      >
        {parsed.map((q, qIndex) => (
          <div
            key={qIndex}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-950"
          >
            <div className="font-semibold text-gray-900 dark:text-white mb-3">
              {qIndex + 1}. {q.question}
            </div>
            <div className="space-y-2">
              {q.options.map((option, optionIndex) => {
                const selected = answers[qIndex] === optionIndex;
                const isCorrect = q.correct === optionIndex;
                const showCorrect = submitted && isCorrect;
                const isWrongSelection =
                  submitted && selected && !isCorrect && q.correct != null;

                return (
                  <label
                    key={optionIndex}
                    className={[
                      'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      'border-gray-200 dark:border-gray-800',
                      !submitted &&
                        'hover:bg-gray-50 dark:hover:bg-gray-800',
                      showCorrect &&
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
                      isWrongSelection &&
                        'border-red-500 bg-red-50 dark:bg-red-950',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={selected || false}
                      onChange={() => handleChange(qIndex, optionIndex)}
                      className="w-4 h-4 text-pyro-600 focus:ring-pyro-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {option}
                      {showCorrect && (
                        <span className="ml-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          (correct)
                        </span>
                      )}
                      {isWrongSelection && (
                        <span className="ml-2 text-xs font-semibold text-red-700 dark:text-red-300">
                          (your answer)
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
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


