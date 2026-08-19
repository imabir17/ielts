'use client';

import React, { useState, useRef } from 'react';
import { WritingTask } from '@/lib/mock-data';
import { Edit3, CheckCircle2, AlertTriangle, FileText, Copy, Scissors, Clipboard, Trash2, StickyNote, X } from 'lucide-react';

interface WritingModuleProps {
  allTasks: WritingTask[];
  onAnswerChange?: (answers: Record<string, any>) => void;
}

export function WritingModule({ allTasks, onAnswerChange }: WritingModuleProps) {
  const [activeTaskIdx, setActiveTaskIdx] = useState(0);
  const task = allTasks[activeTaskIdx];
  
  const [essayTexts, setEssayTexts] = useState<Record<string, string>>({});
  const [showOutliner, setShowOutliner] = useState(false);
  const [outlines, setOutlines] = useState<Record<string, string>>({});

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const essayText = essayTexts[task?.id] || '';
  const outlineText = outlines[task?.id] || '';

  React.useEffect(() => {
    if (onAnswerChange) onAnswerChange(essayTexts);
  }, [essayTexts, onAnswerChange]);

  if (!task) return <div className="p-10 text-center text-slate-500 font-sans">No writing tasks available.</div>;

  // Calculate real-time word count
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).filter(Boolean).length : 0;
  const isTargetMet = wordCount >= task.minWords;
  const isClose = wordCount >= task.minWords * 0.85;
  const charCount = essayText.length;

  const handleTextChange = (text: string) => {
    setEssayTexts((prev) => ({ ...prev, [task.id]: text }));
  };

  const handleOutlineChange = (text: string) => {
    setOutlines((prev) => ({ ...prev, [task.id]: text }));
  };

  // Text Editing Affordance Helpers
  const handleCopy = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const selected = essayText.substring(textarea.selectionStart, textarea.selectionEnd);
    if (selected) {
      await navigator.clipboard.writeText(selected);
    } else {
      await navigator.clipboard.writeText(essayText);
    }
  };

  const handleCut = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      const selected = essayText.substring(start, end);
      await navigator.clipboard.writeText(selected);
      const newText = essayText.substring(0, start) + essayText.substring(end);
      handleTextChange(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start;
          textareaRef.current.selectionEnd = start;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText) return;
      const textarea = textareaRef.current;
      if (!textarea) {
        handleTextChange(essayText + clipText);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = essayText.substring(0, start) + clipText + essayText.substring(end);
      handleTextChange(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + clipText.length;
          textareaRef.current.selectionEnd = start + clipText.length;
          textareaRef.current.focus();
        }
      }, 0);
    } catch {
      // Browser clipboard permission fallback
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 bg-slate-100 font-sans overflow-hidden relative">
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
            <li>Minimum requirement: <strong>{task.minWords} words</strong></li>
            <li>Suggested time: {task.recommendedTime} minutes</li>
            <li>Write in a formal academic register</li>
          </ul>
        </div>
      </div>

      {/* Right Column: Distraction-Free Rich Text Editor & Live Word Counter */}
      <div className="lg:col-span-7 bg-slate-50 p-6 md:p-8 flex flex-col h-full overflow-hidden relative">
        {/* Top Control Bar with Text Affordances & Live Word Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          {/* Text Editing Affordance Buttons */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleCut}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
              title="Cut selected text (Ctrl+X)"
            >
              <Scissors className="w-3.5 h-3.5 text-slate-500" />
              <span>Cut</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
              title="Copy text (Ctrl+C)"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy</span>
            </button>
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
              title="Paste text (Ctrl+V)"
            >
              <Clipboard className="w-3.5 h-3.5 text-slate-500" />
              <span>Paste</span>
            </button>
            <button
              type="button"
              onClick={() => setShowOutliner(!showOutliner)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                showOutliner ? 'bg-[#005C53] text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Brainstorming & Outline Plan"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-500" />
              <span>Outline</span>
            </button>
          </div>

          {/* Prominent Live Word Counter Indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold border transition-colors ${
                isTargetMet
                  ? 'bg-emerald-100 text-[#005C53] border-emerald-300'
                  : isClose
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {isTargetMet ? (
                <CheckCircle2 className="w-4 h-4 text-[#005C53]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {wordCount} / {task.minWords} words
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              ({charCount} chars)
            </span>
          </div>
        </div>

        {/* Text Area Input */}
        <textarea
          ref={textareaRef}
          value={essayText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Start typing your response here. Word count is updated automatically in real time..."
          className="w-full flex-1 p-6 rounded-2xl border border-slate-300 text-slate-900 font-sans text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#005C53] bg-white resize-none shadow-inner"
        />
        
        {/* Extra spacing to account for bottom navigation */}
        <div className="h-16"></div>

        {/* Slide-out Essay Outline / Scratchpad Drawer */}
        {showOutliner && (
          <div className="absolute right-0 top-0 bottom-16 w-full sm:w-80 bg-white border-l border-slate-300 shadow-2xl z-30 p-4 flex flex-col space-y-3 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <StickyNote className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs text-slate-900">Task {task.taskNumber} Essay Outline</h3>
              </div>
              <button
                onClick={() => setShowOutliner(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Jot down your essay structure, main ideas, or vocabulary before writing:
            </p>
            <textarea
              value={outlineText}
              onChange={(e) => handleOutlineChange(e.target.value)}
              placeholder="• Intro: Paraphrase + Overview&#10;• Body 1: Key feature 1...&#10;• Body 2: Key feature 2...&#10;• Conclusion/Summary..."
              className="w-full flex-1 p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005C53] resize-none"
            />
          </div>
        )}
      </div>
      
      {/* BOTTOM TASK NAVIGATION BAR */}
      <div className="absolute bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-3 shadow-2xl z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xs text-slate-300 font-extrabold hidden sm:inline">
            Writing Tasks
          </div>
          <div className="flex items-center space-x-2 mx-auto sm:mx-0">
            {allTasks.map((t, idx) => {
              const count = (essayTexts[t.id] || '').trim().split(/\s+/).filter(Boolean).length;
              const met = count >= t.minWords;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTaskIdx(idx)}
                  className={`px-5 py-2 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
                    activeTaskIdx === idx
                      ? 'bg-[#005C53] text-white shadow-sm ring-2 ring-emerald-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span>Task {t.taskNumber}</span>
                  <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                    met ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {count}w
                  </span>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-slate-400 font-mono hidden md:inline">
            Suggested: Task 1 (20m), Task 2 (40m)
          </div>
        </div>
      </div>
    </div>
  );
}

