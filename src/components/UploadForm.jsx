import React, { useState, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from 'motion/react';
import { UploadSimple, FilePdf, CircleNotch, X, ArrowRight } from '@phosphor-icons/react';

const EASE = [0.23, 1, 0.32, 1];
const MAX_BYTES = 10 * 1024 * 1024;

/* Submit button that drifts toward the cursor with spring physics */
function MagneticSubmit({ ready, isLoading, file, jd }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 15, mass: 0.4 });

  const onMove = (e) => {
    if (reduce || !ready) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      type="submit"
      disabled={isLoading || !file || !jd.trim()}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileHover={ready ? { scale: 1.015 } : {}}
      whileTap={ready ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={`relative mt-1 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-semibold transition-colors duration-200
        ${
          isLoading
            ? 'cursor-wait bg-ink-800 text-ink-300'
            : 'bg-signal text-ink-950 hover:bg-signal-dim disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-ink-600'
        }`}
    >
      {isLoading ? (
        <span className="relative z-10 flex items-center gap-2">
          <CircleNotch size={18} weight="bold" className="animate-spin" />
          Analyzing fit…
        </span>
      ) : (
        <span className="flex items-center gap-2">
          Analyze fit
          <ArrowRight size={17} weight="bold" className="transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5" />
        </span>
      )}
      {isLoading && (
        <span className="pointer-events-none absolute inset-0">
          <span className="shimmer absolute inset-0" />
        </span>
      )}
    </motion.button>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadForm({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const fileInputRef = useRef(null);

  const acceptFile = (candidate) => {
    if (!candidate) return;
    if (candidate.type !== 'application/pdf') {
      setFieldError('That file isn\'t a PDF. Upload a .pdf resume to continue.');
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setFieldError('That PDF is over 10 MB. Compress it or upload a smaller file.');
      return;
    }
    setFieldError('');
    setFile(candidate);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setFieldError('Add a resume PDF to run the analysis.');
      return;
    }
    if (!jd.trim()) {
      setFieldError('Paste the job description so we can compare against it.');
      return;
    }
    onAnalyze(file, jd);
  };

  const ready = file && jd.trim() && !isLoading;

  // Cursor-tracking spotlight on the panel
  const reduce = useReducedMotion();
  const px = useMotionValue(-200);
  const py = useMotionValue(-200);
  const glow = useSpring(0, { stiffness: 200, damping: 25 });
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${px}px ${py}px, color-mix(in oklch, var(--color-signal) 14%, transparent), transparent 70%)`;

  const handlePanelMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onMouseMove={handlePanelMove}
      onMouseEnter={() => !reduce && glow.set(1)}
      onMouseLeave={() => glow.set(0)}
      className="group/btn relative overflow-hidden rounded-[1.75rem] border border-ink-800 bg-ink-900/70 p-2 backdrop-blur-xl"
      style={{ boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.06), 0 30px 60px -24px oklch(0 0 0 / 0.7)' }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: spotlight, opacity: glow }}
      />
      <div className="relative z-10 flex flex-col gap-5 rounded-[1.4rem] bg-ink-950/40 p-6 sm:p-7">
        {/* Resume dropzone */}
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">
            <span className="tnum font-mono text-signal">01</span> Candidate resume
          </label>

          <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isLoading) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`group relative flex min-h-[132px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-5 py-6 text-center transition-[border-color,background-color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 active:scale-[0.99]
              ${
                isDragging
                  ? 'border-signal bg-signal/10'
                  : file
                    ? 'border-signal/40 bg-signal/5'
                    : 'border-ink-700 bg-ink-900/40 hover:border-ink-600 hover:bg-ink-900/70'
              } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => acceptFile(e.target.files?.[0])}
              accept="application/pdf"
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="filled"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
                    <FilePdf size={22} weight="fill" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-100">{file.name}</p>
                    <p className="tnum mt-0.5 font-mono text-[11px] text-ink-500">
                      {formatSize(file.size)} · ready
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    aria-label="Remove file"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-800 hover:text-ink-100"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-700 bg-ink-900 text-ink-400 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:text-signal">
                    <UploadSimple size={20} weight="bold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-200">
                      Drop a PDF, or <span className="text-signal">browse</span>
                    </p>
                    <p className="mt-1 text-[12px] text-ink-500">PDF only · up to 10 MB</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Job description */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="jd"
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400"
            >
              <span className="tnum font-mono text-signal">02</span> Target job description
            </label>
            <span className="tnum font-mono text-[11px] text-ink-600">{jd.length}</span>
          </div>
          <textarea
            id="jd"
            value={jd}
            onChange={(e) => {
              setJd(e.target.value);
              if (fieldError) setFieldError('');
            }}
            disabled={isLoading}
            placeholder="Paste the full job description — responsibilities, required skills, tools…"
            className="min-h-[150px] w-full resize-y rounded-2xl border border-ink-700 bg-ink-900/40 p-4 text-sm leading-relaxed text-ink-100 placeholder:text-ink-600 transition-colors duration-200 focus:border-signal/60 focus:outline-none focus:ring-2 focus:ring-signal/20 disabled:opacity-60"
          />
        </div>

        {/* Inline field error */}
        <AnimatePresence>
          {fieldError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="-mt-1 text-[13px] text-rose-soft"
            >
              {fieldError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <MagneticSubmit ready={ready} isLoading={isLoading} file={file} jd={jd} />
      </div>
    </form>
  );
}
