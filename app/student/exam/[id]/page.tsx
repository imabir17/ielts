'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTestById } from '@/lib/test-store';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { ReadingModule } from '@/components/exam/ReadingModule';
import { ListeningModule } from '@/components/exam/ListeningModule';
import { WritingModule } from '@/components/exam/WritingModule';
import { SpeakingModule } from '@/components/exam/SpeakingModule';
import { BookOpen, Headphones, Edit3, Mic, LogOut } from 'lucide-react';

export default function ExamPage() {
  const params = useParams();
  const testId = typeof params?.id === 'string' ? params.id : '';

  const [isMounted, setIsMounted] = useState(false);
  const [activeModule, setActiveModule] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="p-10 text-center text-slate-700">Loading test environment...</div>;
  }

  const test = getTestById(testId);

  if (!test) {
    return <div className="p-10 text-center text-slate-700">Loading test...</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 font-sans">
      {/* PERSISTENT TOP EXAM BAR */}
      <header className="h-16 bg-[#003831] text-white px-6 flex items-center justify-between shadow-md border-b border-emerald-950 shrink-0 select-none">
        {/* Left: Test Title & Candidate ID */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="font-extrabold text-sm md:text-base text-white leading-tight">
              {test.title}
            </h1>
            <span className="text-[10px] text-emerald-300 font-mono">
              Candidate: Sarah Jenkins (STU-8821)
            </span>
          </div>
        </div>

        {/* Center: Module Tabs */}
        <div className="hidden md:flex items-center space-x-1.5 bg-emerald-950/80 p-1 rounded-2xl border border-emerald-800">
          <button
            onClick={() => setActiveModule('reading')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'reading'
                ? 'bg-[#005C53] text-white shadow-sm border border-emerald-500/40'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span>Reading</span>
          </button>

          <button
            onClick={() => setActiveModule('listening')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'listening'
                ? 'bg-[#005C53] text-white shadow-sm border border-emerald-500/40'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-300" />
            <span>Listening</span>
          </button>

          <button
            onClick={() => setActiveModule('writing')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'writing'
                ? 'bg-[#005C53] text-white shadow-sm border border-emerald-500/40'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Writing</span>
          </button>

          <button
            onClick={() => setActiveModule('speaking')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'speaking'
                ? 'bg-[#005C53] text-white shadow-sm border border-emerald-500/40'
                : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-300" />
            <span>Speaking</span>
          </button>
        </div>

        {/* Right: Timer & Submit Button */}
        <div className="flex items-center space-x-4">
          <ExamTimer initialMinutes={test.totalDurationMinutes} />

          <Link
            href="/student"
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </Link>
        </div>
      </header>

      {/* MODULE VIEWPORT */}
      <div className="flex-1 overflow-hidden">
        {activeModule === 'reading' && <ReadingModule passage={test.reading[0]} allPassages={test.reading} />}
        {activeModule === 'listening' && <ListeningModule allSections={test.listening} audioUrl={test.listeningAudioUrl} />}
        {activeModule === 'writing' && <WritingModule allTasks={test.writing} />}
        {activeModule === 'speaking' && <SpeakingModule parts={test.speaking} />}
      </div>
    </div>
  );
}
