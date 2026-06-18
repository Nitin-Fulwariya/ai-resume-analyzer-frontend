import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import UploadForm from './components/UploadForm';
import ResultsDisplay from './components/ResultsDisplay';
import { analyzeResume } from './lib/api';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (file, jd) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeResume(file, jd);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred while analyzing the resume. Make sure your Render backend URL is correctly set and running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-[100dvh] bg-bg-base text-zinc-200 selection:bg-brand-500 selection:text-white pb-24">
      {/* Navigation / Header */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-white">AI Resume Analyzer</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-6 mt-16 md:mt-24">
        
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center w-full"
            >
              {/* Hero Copy */}
              <div className="text-center max-w-2xl mb-12">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-4">
                  Match talent to descriptions <br/> in seconds.
                </h1>
                <p className="text-base text-zinc-400 max-w-[65ch] mx-auto leading-relaxed">
                  Upload a candidate's resume and provide the job description. Our engine will calculate the ATS score, identify missing skills, and suggest improvements.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 w-full max-w-2xl bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Form Component */}
              <UploadForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResultsDisplay data={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default App;
