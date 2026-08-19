'use client';

import React from 'react';
import { Flag, ChevronLeft, ChevronRight, CheckCircle2, Bookmark } from 'lucide-react';

export interface NavigatorQuestionItem {
  id: string;
  questionNumber: number;
  isAnswered: boolean;
  isFlagged: boolean;
  passageOrPartIndex?: number;
}

interface QuestionNavigatorProps {
  questions: NavigatorQuestionItem[];
  activeQuestionId?: string | null;
  onSelectQuestion: (question: NavigatorQuestionItem) => void;
  onToggleFlag?: (questionId: string) => void;
  title?: string;
  showPrevNext?: boolean;
}

export function QuestionNavigator({
  questions,
  activeQuestionId,
  onSelectQuestion,
  onToggleFlag,
  title = 'Questions Navigator',
  showPrevNext = true,
}: QuestionNavigatorProps) {
  if (questions.length === 0) return null;

  const currentIndex = questions.findIndex((q) => q.id === activeQuestionId);
  const activeQuestion = currentIndex !== -1 ? questions[currentIndex] : questions[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectQuestion(questions[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      onSelectQuestion(questions[currentIndex + 1]);
    }
  };

  const totalAnswered = questions.filter((q) => q.isAnswered).length;
  const totalFlagged = questions.filter((q) => q.isFlagged).length;

  return (
    <div className="bg-slate-900 text-white border-t border-slate-800 px-4 py-2.5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 shrink-0 select-none z-30">
      {/* Left: Summary and Flag button */}
      <div className="flex items-center space-x-3 text-xs w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-slate-200 hidden lg:inline">{title}</span>
          <span className="bg-slate-800 text-slate-300 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-700">
            {totalAnswered} / {questions.length} Answered
          </span>
          {totalFlagged > 0 && (
            <span className="bg-amber-500/20 text-amber-300 font-mono text-[11px] px-2 py-0.5 rounded border border-amber-500/40 flex items-center space-x-1">
              <Flag className="w-2.5 h-2.5 fill-amber-300" />
              <span>{totalFlagged} Review</span>
            </span>
          )}
        </div>

        {/* Flag Active Question Toggle */}
        {activeQuestion && onToggleFlag && (
          <button
            type="button"
            onClick={() => onToggleFlag(activeQuestion.id)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeQuestion.isFlagged
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Mark this question for review"
          >
            <Flag className={`w-3.5 h-3.5 ${activeQuestion.isFlagged ? 'fill-slate-950' : ''}`} />
            <span>{activeQuestion.isFlagged ? 'Review Flagged' : 'Review'}</span>
          </button>
        )}
      </div>

      {/* Middle: Scrollable Question Chips */}
      <div className="flex-1 w-full max-w-4xl flex items-center space-x-1.5 overflow-x-auto py-1 px-1 custom-scrollbar">
        {questions.map((q, idx) => {
          const isActive = q.id === activeQuestionId || (!activeQuestionId && idx === 0);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(q)}
              className={`relative min-w-[32px] h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-all shrink-0 px-2 ${
                isActive
                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 bg-white text-slate-900 shadow-md font-black scale-105'
                  : q.isAnswered
                  ? 'bg-[#005C53] hover:bg-[#007368] text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title={`Question ${q.questionNumber}: ${
                q.isAnswered ? 'Answered' : 'Unanswered'
              }${q.isFlagged ? ' (Marked for Review)' : ''}`}
            >
              <span>{q.questionNumber}</span>
              {q.isFlagged && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-slate-900 flex items-center justify-center shadow-xs">
                  <Flag className="w-1.5 h-1.5 text-slate-950 fill-slate-950" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right: Prev / Next Navigation Arrows */}
      {showPrevNext && (
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-lg text-slate-300 transition-colors border border-slate-700"
            title="Previous Question"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= questions.length - 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-lg text-slate-300 transition-colors border border-slate-700"
            title="Next Question"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
