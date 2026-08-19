'use client';

import React, { useState } from 'react';
import { WritingTask } from '@/lib/mock-data';
import { Edit3, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface WritingModuleProps {
  allTasks: WritingTask[];
  onAnswerChange?: (answers: Record<string, any>) => void;
}

export function WritingModule({ allTasks, onAnswerChange }: WritingModuleProps) {
  const [activeTaskIdx, setActiveTaskIdx] = useState(0);
  const task = allTasks[activeTaskIdx];
  
  const [essayTexts, setEssayTexts] = useState<Record<string, string>>({});
  const essayText = essayTexts[task?.id] || '';

  React.useEffect(() => {
    if (onAnswerChange) onAnswerChange(essayTexts);
  }, [essayTexts, onAnswerChange]);

  if (!task) return <div className="p-10 text-center text-slate-500">No writing tasks available.</div>;

  // Calculate real-time word count
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const isTargetMet = wordCount >= task.minWords;
  const isClose = wordCount >= task.minWords * 0.85;

  const handleTextChange = (text: string) => {
    setEssayTexts((prev) => ({ ...prev, [task.id]: text }));
  };

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 bg-slate-100 font-sans overflow-hidden">
      {/* Left Column: Task Prompt */}
      <div className="lg:col-span-5 bg-white border-r border-slate-300 p-6 md:p-8 flex flex-col h-full overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#005C53]" />
            <h2 className="font-bold text-slate-900 text-lg">{task.title}</h2>
          </div>
          <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-md">
            Task {task.taskNumber}
          </span>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Official Prompt
          </div>
          {task.prompt.split('\n\n').map((p, idx) => (
            <p key={idx} className="font-medium text-slate-900">
              {p}
            </p>
          ))}
          {task.diagramUrl && (
            <div className="mt-4 flex justify-center">
              <img src={task.diagramUrl} alt="Writing Task Diagram" className="max-w-full h-auto rounded-lg shadow-sm border border-slate-200" />
            </div>
          )}
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2 text-xs text-[#005C53]">
          <div className="font-bold">Instructions for Task {task.taskNumber}:</div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
            <li>Minimum requirement: {task.minWords} words</li>
            <li>Suggested time: {task.recommendedTime} minutes</li>
            <li>Write in a formal academic register</li>
          </ul>
        </div>
      </div>

      {/* Right Column: Distraction-Free Rich Text Editor & Live Word Counter */}
      <div className="lg:col-span-7 bg-slate-50 p-6 md:p-8 flex flex-col h-full overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-700">
            <Edit3 className="w-4 h-4 text-[#005C53]" />
            <span className="text-xs font-bold uppercase tracking-wider">Response Workspace</span>
          </div>

          {/* Real-time Word Counter Indicator */}
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border transition-colors ${
              isTargetMet
                ? 'bg-emerald-100 text-[#005C53] border-emerald-300'
                : isClose
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {isTargetMet ? (
              <CheckCircle2 className="w-5 h-5 text-[#005C53]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
            <span>
              {wordCount} / {task.minWords} words
            </span>
          </div>
        </div>

        {/* Text Area Input */}
        <textarea
          value={essayText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Start typing your response here. Word count is updated automatically..."
          className="w-full flex-1 p-6 rounded-2xl border border-slate-300 text-slate-900 font-sans text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#005C53] bg-white resize-none shadow-inner"
        />
        
        {/* Extra spacing to account for bottom navigation */}
        <div className="h-16"></div>
      </div>
      
      {/* BOTTOM NAVIGATION BARS */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2">
          {allTasks.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveTaskIdx(idx)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                activeTaskIdx === idx
                  ? 'bg-[#005C53] text-white border border-[#005C53]'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              Task {t.taskNumber}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
