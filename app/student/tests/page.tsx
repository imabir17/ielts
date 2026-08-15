'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { BookOpen, Clock, Play, ShieldAlert, CheckCircle2, History, ChevronRight } from 'lucide-react';

export default function StudentTestsPage() {
  const { currentUser, examLogs, tests } = useStore();

  if (!currentUser) return null;

  const myLogs = examLogs.filter(l => l.studentId === currentUser.id);
  // A test is considered completed if the log has all 4 modules (or if it's graded/completed)
  // For simplicity, we just use the existing examLogs mapping. If they took ANY module, it's an existing log.
  const testsWithLogs = myLogs.map(l => l.testId);
  
  const pendingTests = tests.filter(t => !testsWithLogs.includes(t.id));
  const inProgressOrCompletedTests = myLogs;

  return (
    <>
      <div className="topbar mb-8">
        <div>
          <h1>Mock Tests</h1>
          <p className="page-sub">View and manage your assigned mock examinations.</p>
        </div>
      </div>

      {/* PENDING TESTS SECTION */}
      <div className="mb-10">
        <div className="flex items-center gap-2 font-display text-[22px] text-[var(--ink)] mb-4">
          <BookOpen className="w-5 h-5 text-[var(--brick)]" /> Pending Mock Examinations
        </div>

        {pendingTests.length === 0 ? (
          <div className="panel p-10 text-center text-[var(--ink-soft)] bg-white/50 border-dashed">
            You have no pending mock exams.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTests.map(t => (
              <div key={t.id} className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--ink-soft)] transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.05em] bg-[var(--forest)]/10 text-[var(--forest)] px-2 py-0.5 rounded-[2px] font-medium">
                      {t.category}
                    </span>
                  </div>
                  <h3 className="font-display text-[20px] text-[var(--ink)] m-0">{t.title}</h3>
                  <div className="text-[13px] text-[var(--ink-soft)] mt-1 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {t.totalDurationMinutes} mins total
                  </div>
                </div>
                
                <Link
                  href={`/student/tests/${t.id}`}
                  className="btn btn-fill shrink-0"
                  style={{ backgroundColor: 'var(--brick)', borderColor: 'var(--brick)' }}
                >
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED / IN PROGRESS SECTION */}
      <div>
        <div className="flex items-center gap-2 font-display text-[22px] text-[var(--ink)] mb-4">
          <History className="w-5 h-5 text-[var(--forest)]" /> Active & Completed Tests
        </div>

        {inProgressOrCompletedTests.length === 0 ? (
          <div className="panel p-10 text-center text-[var(--ink-soft)] bg-white/50 border-dashed">
            You haven't started any tests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {inProgressOrCompletedTests.map(log => {
              const t = tests.find(test => test.id === log.testId);
              if (!t) return null;

              const isFullyCompleted = log.modulesTaken?.length === 4;

              return (
                <div key={log.id} className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4" style={{borderLeftColor: isFullyCompleted ? 'var(--forest)' : '#d97706'}}>
                  <div>
                    <h3 className="font-display text-[20px] text-[var(--ink)] m-0">{t.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${
                        isFullyCompleted ? 'bg-[var(--forest)]/10 text-[var(--forest)]' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isFullyCompleted ? 'Completed' : 'In Progress'}
                      </span>
                      <span className="text-[12px] text-[var(--ink-soft)] font-medium">
                        {log.modulesTaken?.length || 0} / 4 Modules Taken
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {log.overallBand !== undefined && (
                      <div className="text-center mr-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">Overall Band</div>
                        <div className="font-display text-[24px] text-[var(--forest)] leading-none">{log.overallBand}</div>
                      </div>
                    )}
                    <Link
                      href={`/student/tests/${t.id}`}
                      className="btn bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink)]"
                    >
                      {isFullyCompleted ? 'View Results' : 'Continue Test'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
