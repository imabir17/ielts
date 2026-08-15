'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Test } from '@/lib/mock-data';
import { getStoredTests } from '@/lib/test-store';
import { BookOpen, Clock, Play, ShieldAlert } from 'lucide-react';

export default function StudentDashboardPage() {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    setTests(getStoredTests());
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>Apex IELTS Academy</div>
          <h1>Welcome back, Student!</h1>
          <p className="page-sub">You have {tests.length} official IELTS computer-based mock tests assigned by your institution.</p>
        </div>
      </div>

      <hr className="rule" />

      <div className="panel mb-6 border-none bg-transparent">
        <div className="flex items-center gap-2 font-display text-[22px] text-[var(--ink)] mb-4">
          <BookOpen className="w-5 h-5 text-[var(--brick)]" /> Assigned Mock Examinations ({tests.length})
        </div>

        {tests.map((t) => (
          <div key={t.id} className="panel mb-6 overflow-hidden">
            <div className="panel-body p-6 md:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line-soft)] pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.05em] bg-[var(--forest)]/10 text-[var(--forest)] px-2 py-0.5 rounded-[2px] font-medium">
                      {t.category}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.05em] bg-[var(--brick)]/10 text-[var(--brick)] px-2 py-0.5 rounded-[2px] font-medium">
                      Official Computer-Delivered Format
                    </span>
                  </div>
                  <h3 className="font-display text-[26px] text-[var(--ink)] m-0">{t.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-[var(--ink-soft)] bg-[var(--paper-alt)] px-4 py-2 rounded-[3px] border border-[var(--line)] text-[13px] font-medium">
                  <Clock className="w-4 h-4 text-[var(--ink)]" />
                  <span>{t.totalDurationMinutes} mins total</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-[var(--paper-card)] rounded-[3px] border border-[var(--line)]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--forest)] font-medium">Module 1</div>
                  <div className="text-[15px] font-medium text-[var(--ink)] mt-1">Reading</div>
                  <div className="text-[12px] text-[var(--ink-faint)] mt-0.5">Split-Screen UI</div>
                </div>
                <div className="p-4 bg-[var(--paper-card)] rounded-[3px] border border-[var(--line)]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--forest)] font-medium">Module 2</div>
                  <div className="text-[15px] font-medium text-[var(--ink)] mt-1">Listening</div>
                  <div className="text-[12px] text-[var(--ink-faint)] mt-0.5">Locked Audio Scrubber</div>
                </div>
                <div className="p-4 bg-[var(--paper-card)] rounded-[3px] border border-[var(--line)]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--forest)] font-medium">Module 3</div>
                  <div className="text-[15px] font-medium text-[var(--ink)] mt-1">Writing</div>
                  <div className="text-[12px] text-[var(--ink-faint)] mt-0.5">Real-time Word Counter</div>
                </div>
                <div className="p-4 bg-[var(--paper-card)] rounded-[3px] border border-[var(--line)]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--forest)] font-medium">Module 4</div>
                  <div className="text-[15px] font-medium text-[var(--ink)] mt-1">Speaking</div>
                  <div className="text-[12px] text-[var(--ink-faint)] mt-0.5">Waveform Recorder</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-[12.5px] text-[var(--gold)] bg-[rgba(180,135,43,0.1)] p-3 rounded-[3px] border border-[rgba(180,135,43,0.2)] flex-1">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Once started, the exam interface will enter strict distraction-free mode with zero navigation controls.</span>
                </div>

                <Link
                  href={`/student/exam/${t.id}`}
                  className="btn btn-fill w-full sm:w-auto flex justify-center py-3.5"
                  style={{ backgroundColor: 'var(--brick)', borderColor: 'var(--brick)' }}
                >
                  <Play className="w-4 h-4 fill-white" /> Launch Mock Exam
                </Link>
              </div>

            </div>
          </div>
        ))}
      </div>
    </>
  );
}
