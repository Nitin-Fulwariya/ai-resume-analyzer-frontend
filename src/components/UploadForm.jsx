import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { UploadSimple, FilePdf, Spinner } from '@phosphor-icons/react';

export default function UploadForm({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !jd.trim()) {
      alert('Please provide both a resume PDF and a job description.');
      return;
    }
    onAnalyze(file, jd);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 w-full max-w-2xl mx-auto"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">1. Candidate Resume</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200
            ${isDragging ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900'}
            ${file ? 'border-green-500/50 bg-green-500/5' : ''}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf" 
            className="hidden" 
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FilePdf size={32} weight="fill" className="text-green-500" />
              <p className="text-zinc-200 font-medium">{file.name}</p>
              <p className="text-xs text-zinc-500">Click or drag to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <UploadSimple size={24} className="text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-zinc-200 font-medium">Click or drag PDF to upload</p>
                <p className="text-sm text-zinc-500 mt-1">Maximum file size 10MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="jd" className="text-sm font-medium text-zinc-400 uppercase tracking-wider">2. Target Job Description</label>
        <textarea 
          id="jd"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the target role's job description here..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 min-h-[160px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-y"
        />
      </div>

      <motion.button
        whileHover={!isLoading ? { scale: 1.01 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        disabled={isLoading || !file || !jd.trim()}
        type="submit"
        className="w-full h-12 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {isLoading ? (
          <>
            <Spinner size={20} className="animate-spin" />
            <span>Analyzing Candidate...</span>
          </>
        ) : (
          <span>Analyze Fit</span>
        )}
      </motion.button>
    </motion.form>
  );
}
