import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { TranscriptionProvider } from './contexts/TranscriptionContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { SignUp } from './features/auth/SignUp';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TranscriptionProvider>
          <LibraryProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <Header />
                      <Landing />
                    </>
                  }
                />
                <Route path="/auth/signup" element={<SignUp />} />
              </Routes>
            </div>
          </LibraryProvider>
        </TranscriptionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
