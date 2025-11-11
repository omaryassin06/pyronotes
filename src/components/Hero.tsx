export function Hero() {
  const scrollToRecorder = () => {
    const recorderElement = document.getElementById('recorder');
    if (recorderElement) {
      recorderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="text-center space-y-6 py-8 md:py-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
          Transform Your Lectures with{' '}
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            AI-Powered Notes
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Record or upload your lectures and instantly generate organized notes, flashcards, and quizzes. 
          Study smarter with PyroNotes.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={scrollToRecorder}
          className="px-8 py-3 rounded-lg bg-gradient-pyro text-white font-medium text-lg hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 shadow-lg"
        >
          Start Recording
        </button>
        <a
          href="#lectures"
          className="px-8 py-3 rounded-lg border-2 border-pyro-500 text-pyro-600 dark:text-pyro-400 font-medium text-lg hover:bg-pyro-50 dark:hover:bg-pyro-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pyro-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
        >
          View Lectures
        </a>
      </div>
    </div>
  );
}

