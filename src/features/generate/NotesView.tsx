import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { exportElementToPdf } from '../../utils/pdfExport';

interface NotesViewProps {
  content: string;
}

export function NotesView({ content }: NotesViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = async () => {
    if (!containerRef.current) return;
    const title = extractTitle(content) ?? 'study-notes';
    await exportElementToPdf(containerRef.current, `${title}.pdf`);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📚 Generated Study Notes
        </h3>
        <button
          onClick={handleDownload}
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

      <div
        ref={containerRef}
        className="prose prose-sm sm:prose dark:prose-invert max-w-none bg-white dark:bg-gray-950 rounded-lg p-6 border border-gray-200 dark:border-gray-800 overflow-y-auto"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function extractTitle(markdown: string): string | null {
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) return trimmed.replace(/^#\s+/, '');
    if (trimmed.startsWith('## ')) return trimmed.replace(/^##\s+/, '');
  }
  return null;
}


