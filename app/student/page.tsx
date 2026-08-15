'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Test } from '@/lib/mock-data';
import { getStoredTests } from '@/lib/test-store';
import { BookOpen, Clock, Play, Award, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function StudentDashboardPage() {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    setTests(getStoredTests());
  }, []);

  const activeTest = tests[0];

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#003831] via-[#005C53] to-[#042A25] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/50">
            Apex IELTS Academy Student
          </span>
          <h1 className="text-3xl font-extrabold text-white">Welcome back, Student!</h1>
          <p className="text-sm text-emerald-100/80 max-w-xl">
            You have {tests.length} official IELTS computer-based mock tests assigned by your institution.
          </p>
        </div>
      </div>

      {/* Assigned Tests Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#005C53]" />
          <span>Assigned Mock Examinations ({tests.length})</span>
        </h2>

        {tests.map((t) => (
          <div key={t.id} className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm overflow-hidden hover:border-[#005C53] transition-all mb-4">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-emerald-100 text-[#005C53] text-xs font-bold px-2.5 py-1 rounded-md">
                      {t.category}
                    </span>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md">
                      Official Computer-Delivered Format
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{t.title}</h3>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-sm font-semibold">
                  <Clock className="w-4 h-4 text-[#005C53]" />
                  <span>{t.totalDurationMinutes} mins total</span>
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="text-xs font-bold text-[#005C53] uppercase">Module 1</div>
                  <div className="text-base font-bold text-slate-900 mt-1">Reading</div>
                  <div className="text-xs text-slate-500 mt-0.5">Split-Screen UI</div>
                </div>
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="text-xs font-bold text-[#005C53] uppercase">Module 2</div>
                <div className="text-base font-bold text-slate-900 mt-1">Listening</div>
                <div className="text-xs text-slate-500 mt-0.5">Locked Audio Scrubber</div>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="text-xs font-bold text-[#005C53] uppercase">Module 3</div>
                <div className="text-base font-bold text-slate-900 mt-1">Writing</div>
                <div className="text-xs text-slate-500 mt-0.5">Real-time Word Counter</div>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="text-xs font-bold text-[#005C53] uppercase">Module 4</div>
                <div className="text-base font-bold text-slate-900 mt-1">Speaking</div>
                <div className="text-xs text-slate-500 mt-0.5">Waveform Recorder</div>
              </div>
            </div>

            {/* Warning & Start Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Once started, the exam interface will enter strict distraction-free mode with zero navigation controls.
                </span>
              </div>

              <Link
                href={`/student/exam/${t.id}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Mock Exam</span>
              </Link>
            </div>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}
