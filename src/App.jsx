import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Lightning, ShieldCheck, Target, Warning } from '@phosphor-icons/react';
import UploadForm from './components/UploadForm';
import ResultsDisplay from './components/ResultsDisplay';
import { analyzeResume } from './lib/api';

const EASE = [0.23, 1, 0.32, 1];

const ROTATING = ['interview', 'shortlist', 'first call', 'offer'];

function RotatingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((p) => (p + 1) % ROTATING.length), 2400);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <span className="relative inline-grid whitespace-nowrap align-baseline text-signal">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={ROTATING[i]}
          initial={{ y: '0.55em', opacity: 0, filter: 'blur(5px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-0.55em', opacity: 0, filter: 'blur(5px)' }}
          transition={{ duration: 0.42, ease: EASE }}
          className="[grid-area:1/1]"
        >
          {ROTATING[i]}
        </motion.span>
      </AnimatePresence>
      <svg
        className="pointer-events-none absolute -bottom-2 left-0 w-full text-signal"
        viewBox="0 0 200 9"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d="M2 6.5C40 2.5 160 1.5 198 5.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
        />
      </svg>
    </span>
  );
}

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
      setError(
        err.response?.data?.detail ||
          "Couldn't reach the analysis engine. Check that VITE_API_URL points at a running backend, then try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="grain relative min-h-[100dvh] overflow-x-hidden bg-ink-950 text-ink-100">
      {/* Ambient background — aurora glow + grid wash */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="aurora absolute -top-[20%] -left-[10%] h-[55vh] w-[55vh] rounded-full bg-signal/20 blur-[120px]" />
        <div
          className="aurora absolute top-[30%] -right-[10%] h-[45vh] w-[45vh] rounded-full bg-signal-deep/15 blur-[130px]"
          style={{ animationDelay: '-6s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-ink-100) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-100) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex h-20 w-full max-w-[1180px] items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-signal text-ink-950">
            <Lightning size={18} weight="fill" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-ink-100">Resume Analyzer</span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">ATS Fit Engine</span>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-ink-800 bg-ink-900/60 px-3.5 py-1.5 backdrop-blur sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">Engine online</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto w-full max-w-[1180px] px-6 pb-28">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: EASE }}
              className="grid grid-cols-1 items-center gap-12 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20"
            >
              {/* Left — pitch */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
                className="flex flex-col"
              >
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-ink-800 bg-ink-900/50 px-3 py-1"
                >
                  <Target size={13} weight="bold" className="text-signal" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
                    Resume × Job description
                  </span>
                </motion.div>

                <motion.h1
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="text-balance text-[2.6rem] font-semibold leading-[0.98] tracking-tight text-ink-100 sm:text-6xl"
                >
                  Score the fit
                  <br />
                  <span className="text-ink-500">before the</span>{' '}
                  <RotatingWord />.
                </motion.h1>

                <motion.p
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="mt-7 max-w-[48ch] text-[15px] leading-relaxed text-ink-400"
                >
                  Drop in a resume and the target job description. The engine returns an ATS
                  score, the skills that match, the gaps that don't, and precise edits to close
                  the distance.
                </motion.p>

                {/* Stats — grouped by rule, not boxed in cards */}
                <motion.dl
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="mt-10 grid max-w-md grid-cols-3 divide-x divide-ink-800 border-y border-ink-800"
                >
                  {[
                    { icon: Lightning, k: '~8s', v: 'per analysis' },
                    { icon: ShieldCheck, k: 'PDF', v: 'parsed for you' },
                    { icon: Target, k: '0–100', v: 'ATS score' },
                  ].map(({ icon: Icon, k, v }) => (
                    <motion.div
                      key={v}
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className="group flex flex-col gap-1 px-4 py-4 first:pl-0"
                    >
                      <Icon
                        size={15}
                        className="text-signal transition-transform duration-200 ease-out group-hover:scale-110"
                      />
                      <dd className="tnum font-mono text-lg font-medium text-ink-100">{k}</dd>
                      <dt className="text-[11px] uppercase tracking-wide text-ink-500">{v}</dt>
                    </motion.div>
                  ))}
                </motion.dl>
              </motion.div>

              {/* Right — form */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              >
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="flex items-start gap-3 overflow-hidden rounded-xl border border-rose-soft/25 bg-rose-soft/10 px-4 py-3 text-sm"
                    >
                      <Warning size={18} weight="fill" className="mt-0.5 shrink-0 text-rose-soft" />
                      <span className="leading-relaxed text-ink-300">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <UploadForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="pt-10 lg:pt-14"
            >
              <ResultsDisplay data={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-[1180px] px-6 pb-10">
        <div className="border-t border-ink-800 pt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-600">
            Resume Analyzer — built for hiring teams
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
