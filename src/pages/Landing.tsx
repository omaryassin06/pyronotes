import { RecorderPanel } from '../features/recorder/RecorderPanel';
import { LecturesLibrary } from '../features/library/LecturesLibrary';

export function Landing() {
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
    </div>
  );
}

