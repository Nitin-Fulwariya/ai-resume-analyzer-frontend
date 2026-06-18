import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Lightbulb } from '@phosphor-icons/react';

export default function ResultsDisplay({ data, onReset }) {
  if (!data) return null;

  const scoreColor = data.ats_score >= 80 ? 'text-green-400' : data.ats_score >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto flex flex-col gap-12"
    >
      {/* Header / Score */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-800">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Analysis Complete</h2>
          <p className="text-zinc-400">Here is the detailed breakdown of the candidate's fit.</p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-800">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">ATS Score</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold tracking-tighter ${scoreColor}`}>{data.ats_score}</span>
              <span className="text-zinc-600 font-medium">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Matching Skills */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} weight="fill" className="text-green-500" />
            <h3 className="text-lg font-medium text-white">Matching Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.matching_skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md text-sm font-medium">
                {skill}
              </span>
            ))}
            {data.matching_skills.length === 0 && <p className="text-sm text-zinc-500">No explicit matching skills found.</p>}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <XCircle size={20} weight="fill" className="text-red-500" />
            <h3 className="text-lg font-medium text-white">Missing Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.missing_skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm font-medium">
                {skill}
              </span>
            ))}
            {data.missing_skills.length === 0 && <p className="text-sm text-zinc-500">No major missing skills found.</p>}
          </div>
        </div>
      </div>

      {/* Gap Analysis */}
      {data.skill_gaps && data.skill_gaps.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">Skill Gap Analysis</h3>
          <div className="grid grid-cols-1 gap-3">
            {data.skill_gaps.map((gap, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="min-w-[120px]">
                  <span className="block font-medium text-zinc-200">{gap.skill}</span>
                  <span className={`text-xs uppercase tracking-wide font-medium mt-1 inline-block ${
                    gap.importance.toLowerCase() === 'high' ? 'text-red-400' :
                    gap.importance.toLowerCase() === 'medium' ? 'text-yellow-400' : 'text-zinc-500'
                  }`}>
                    {gap.importance} Priority
                  </span>
                </div>
                <div className="w-px h-10 bg-zinc-800 hidden sm:block"></div>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">{gap.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {data.improvement_suggestions && data.improvement_suggestions.length > 0 && (
        <div className="flex flex-col gap-4 bg-brand-500/5 border border-brand-500/10 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={24} weight="fill" className="text-brand-500" />
            <h3 className="text-lg font-medium text-white">Improvement Suggestions</h3>
          </div>
          <ul className="flex flex-col gap-3">
            {data.improvement_suggestions.map((suggestion, i) => (
              <li key={i} className="text-sm text-zinc-300 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-1.5 before:h-1.5 before:bg-brand-500/50 before:rounded-full">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-8 flex justify-center border-t border-zinc-800">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
        >
          Analyze Another Resume
        </motion.button>
      </div>
    </motion.div>
  );
}
