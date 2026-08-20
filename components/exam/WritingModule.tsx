'use client';

import React, { useState } from 'react';
import { WritingTask } from '@/lib/mock-data';
import { FileText } from 'lucide-react';

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

  if (!task) return <div className="p-10 text-center text-slate-500 font-medium">No writing tasks available.</div>;

  // Calculate real-time word count
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const isTargetMet = wordCount >= task.minWords;

  const handleTextChange = (text: string) => {
    setEssayTexts((prev) => ({ ...prev, [task.id]: text }));
  };

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 bg-slate-100 font-sans overflow-hidden">
      {/* Left Column: Task Prompt */}
      <div className="lg:col-span-5 bg-white border-r border-slate-300 p-5 md:p-6 flex flex-col h-full overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h2 className="font-bold text-slate-900 text-sm">{task.title}</h2>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-white px-2 py-0.5 rounded-[2px]">
            Task {task.taskNumber}
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-[2px] border border-slate-300 text-xs text-slate-800 leading-relaxed font-sans space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Task Instructions & Prompt
          </div>
          {task.prompt.split('\n\n').map((p, idx) => (
            <p key={idx} className="font-medium text-slate-900 leading-relaxed font-serif text-sm">
              {p}
            </p>
          ))}
          {task.diagramUrl && (
            <div className="mt-3 flex justify-center">
              <img src={task.diagramUrl} alt="Writing Task Diagram" className="max-w-full h-auto rounded-[2px] border border-slate-300" />
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 rounded-[2px] border border-slate-200 space-y-1.5 text-xs text-slate-700">
          <div className="font-bold font-mono text-[11px] uppercase tracking-wider text-slate-800">Requirements:</div>
          <ul className="list-disc list-inside space-y-1 font-medium">
            <li>Minimum requirement: <span className="font-bold">{task.minWords} words</span></li>
            <li>Suggested time: <span className="font-bold">{task.recommendedTime} minutes</span></li>
            <li>Write in a formal academic style</li>
          </ul>
        </div>
      </div>

      {/* Right Column: Distraction-Free Response Area */}
      <div className="lg:col-span-7 bg-slate-100 p-5 md:p-6 flex flex-col h-full overflow-hidden space-y-3">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-white px-4 py-2 rounded-[2px] border border-slate-300">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
            Response Box (Task {task.taskNumber})
          </div>

          {/* Real-time Word Counter Indicator */}
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-[2px] border border-slate-300">
            <span>Word count:</span>
            <span className={isTargetMet ? 'text-blue-700 font-bold' : 'text-slate-900 font-bold'}>
              {wordCount}
            </span>
            <span className="text-slate-400">/ min {task.minWords}</span>
          </div>
        </div>

        {/* Text Area Input */}
        <textarea
          value={essayText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Type your response here..."
          className="w-full flex-1 p-4 rounded-[2px] border border-slate-300 text-slate-900 font-serif text-sm leading-relaxed focus:outline-none focus:border-slate-800 bg-white resize-none"
        />
        
        {/* Extra spacing for bottom bar */}
        <div className="h-12"></div>
      </div>
      
      {/* BOTTOM TASK SWITCHER BAR */}
      <div className="absolute bottom-0 left-0 w-full bg-[#0F172A] border-t border-slate-800 py-2 px-4 z-20 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          {allTasks.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveTaskIdx(idx)}
              className={`px-4 py-1 rounded-[2px] font-mono font-semibold text-xs transition-colors border ${
                activeTaskIdx === idx
                  ? 'bg-slate-700 text-white border-slate-500 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
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
