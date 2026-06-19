import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle, MinusCircle, Lightbulb, ArrowCounterClockwise, Sparkle } from '@phosphor-icons/react';

const EASE = [0.23, 1, 0.32, 1];

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const band = (score) =>
  score >= 80
    ? { tone: 'var(--color-signal)', label: 'Strong match', text: 'text-signal' }
    : score >= 60
      ? { tone: 'var(--color-amber-soft)', label: 'Partial match', text: 'text-amber-soft' }
      : { tone: 'var(--color-rose-soft)', label: 'Weak match', text: 'text-rose-soft' };

const importanceTone = (imp) => {
  const v = (imp || '').toLowerCase();
  if (v === 'high') return 'text-rose-soft border-rose-soft/30 bg-rose-soft/10';
  if (v === 'medium') return 'text-amber-soft border-amber-soft/30 bg-amber-soft/10';
  return 'text-ink-400 border-ink-700 bg-ink-800/40';
};

function ScoreRing({ score }) {
  const reduce = useReducedMotion();
  const display = useCountUp(score);
  const { tone, label } = band(score);
  const R = 78;
  const C = 2 * Math.PI * R;
  const offset = C - (Math.min(100, Math.max(0, score)) / 100) * C;

  return (
    <div className="relative flex h-[200px] w-[200px] items-center justify-center">
      <motion.span
        aria-hidden
        className="absolute h-[155px] w-[155px] rounded-full"
        style={{ background: `radial-gradient(circle, ${tone}, transparent 68%)`, opacity: 0.18 }}
        animate={reduce ? {} : { scale: [1, 1.1, 1], opacity: [0.14, 0.26, 0.14] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <svg className="relative h-full w-full -rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={R} fill="none" stroke="var(--color-ink-800)" strokeWidth="10" />
        <motion.circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke={tone}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 10px ${tone})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="tnum font-mono text-[3.5rem] font-semibold leading-none text-ink-100">{display}</span>
        <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">/ 100</span>
        <span
          className="mt-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ color: tone, backgroundColor: `color-mix(in oklch, ${tone} 14%, transparent)` }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function ResultsDisplay({ data, onReset }) {
  if (!data) return null;
  const { tone } = band(data.ats_score);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.09 } } }}
      className="flex w-full flex-col gap-10"
    >
      {/* Header row */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col items-start justify-between gap-8 border-b border-ink-800 pb-10 md:flex-row md:items-center"
      >
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-ink-800 bg-ink-900/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
            <Sparkle size={12} weight="fill" className="text-signal" /> Analysis complete
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
            Here's how the candidate stacks up.
          </h2>
          <p className="max-w-[52ch] text-[15px] leading-relaxed text-ink-400">
            The ATS score weighs matched skills, gaps, and keyword coverage against the job
            description. Use the breakdown below to decide and to coach.
          </p>
        </div>
        <div className="shrink-0">
          <ScoreRing score={data.ats_score} />
        </div>
      </motion.div>

      {/* Skills — two columns, grouped by border not boxed cards */}
      <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: EASE }} className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink-800 bg-ink-800 md:grid-cols-2">
        <div className="flex flex-col gap-4 bg-ink-950 p-6">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} weight="fill" className="text-signal" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-200">Matching skills</h3>
            <span className="tnum ml-auto font-mono text-xs text-ink-500">{data.matching_skills?.length || 0}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.matching_skills?.length ? (
              data.matching_skills.map((skill, i) => (
                <motion.span
                  key={skill + i}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, ease: EASE, delay: 0.3 + i * 0.03 }}
                  className="rounded-lg border border-signal/25 bg-signal/10 px-2.5 py-1 text-[13px] font-medium text-signal transition-[transform,background-color,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-signal/50 hover:bg-signal/20"
                >
                  {skill}
                </motion.span>
              ))
            ) : (
              <p className="text-sm text-ink-500">No explicit matches detected.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-ink-950 p-6">
          <div className="flex items-center gap-2">
            <MinusCircle size={18} weight="fill" className="text-rose-soft" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-200">Missing skills</h3>
            <span className="tnum ml-auto font-mono text-xs text-ink-500">{data.missing_skills?.length || 0}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.missing_skills?.length ? (
              data.missing_skills.map((skill, i) => (
                <motion.span
                  key={skill + i}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, ease: EASE, delay: 0.3 + i * 0.03 }}
                  className="rounded-lg border border-rose-soft/25 bg-rose-soft/10 px-2.5 py-1 text-[13px] font-medium text-rose-soft transition-[transform,background-color,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-rose-soft/50 hover:bg-rose-soft/20"
                >
                  {skill}
                </motion.span>
              ))
            ) : (
              <p className="text-sm text-ink-500">No major gaps — strong coverage.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Gap analysis — divided rows */}
      {data.skill_gaps?.length > 0 && (
        <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col gap-5">
          <h3 className="flex items-baseline gap-3 text-sm font-semibold uppercase tracking-wide text-ink-200">
            Skill gap analysis
            <span className="h-px flex-1 bg-ink-800" />
          </h3>
          <div className="divide-y divide-ink-800 border-y border-ink-800">
            {data.skill_gaps.map((gap, i) => (
              <div key={gap.skill + i} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex min-w-[180px] flex-col gap-1.5">
                  <span className="font-medium text-ink-100">{gap.skill}</span>
                  <span
                    className={`w-fit rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${importanceTone(
                      gap.importance
                    )}`}
                  >
                    {gap.importance} priority
                  </span>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-ink-400">{gap.reason}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggestions */}
      {data.improvement_suggestions?.length > 0 && (
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative overflow-hidden rounded-2xl border border-signal/20 bg-signal/[0.04] p-7"
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-signal/10 blur-3xl"
            aria-hidden
          />
          <div className="relative flex items-center gap-2.5">
            <Lightbulb size={20} weight="fill" className="text-signal" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-100">Improvement suggestions</h3>
          </div>
          <ul className="relative mt-5 flex flex-col gap-4">
            {data.improvement_suggestions.map((s, i) => (
              <li key={i} className="flex gap-3.5 text-[15px] leading-relaxed text-ink-300">
                <span className="tnum mt-0.5 font-mono text-xs font-semibold text-signal">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Reset */}
      <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: EASE }} className="flex justify-center border-t border-ink-800 pt-10">
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900 px-5 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:border-ink-600 hover:bg-ink-850 hover:text-ink-100"
        >
          <ArrowCounterClockwise size={16} weight="bold" />
          Analyze another resume
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
