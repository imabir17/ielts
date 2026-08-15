'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { getStoredTests } from '@/lib/test-store';
import { BookOpen, Clock, Play, ShieldAlert, CheckCircle2, History, MessageSquare, Calendar } from 'lucide-react';

export default function StudentDashboardPage() {
  const { currentUser, examLogs, speakingRequests, tests, addSpeakingRequest } = useStore();

  if (!currentUser) return null;

  const myLogs = examLogs.filter(l => l.studentId === currentUser.id);
  const mySpeakingRequests = speakingRequests.filter(r => r.studentId === currentUser.id);

  const handleRequestSpeaking = (testId: string) => {
    addSpeakingRequest({
      id: `req-${Date.now()}`,
      studentId: currentUser.id,
      orgId: currentUser.orgId,
      testId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      type: 'Online',
    });
  };

  const completedTestIds = myLogs.map(l => l.testId);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>Apex IELTS Academy</div>
          <h1>Welcome back, {currentUser.name}!</h1>
          <p className="page-sub">You have {tests.length - completedTestIds.length} pending mock tests assigned by your institution.</p>
        </div>
      </div>

      <hr className="rule" />

      {/* COMPLETED EXAMS / SCORES SECTION */}
      {myLogs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 font-display text-[22px] text-[var(--ink)] mb-4">
            <History className="w-5 h-5 text-[var(--forest)]" /> Exam Results
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myLogs.map(log => {
              const test = tests.find(t => t.id === log.testId);
              return (
                <div key={log.id} className="panel p-6 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-display text-[18px] text-[var(--ink)]">{log.testTitle}</div>
                        <div className="text-[12px] text-[var(--ink-soft)] mt-1">Submitted on {new Date(log.completedAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'Graded' ? 'bg-[var(--forest)]/10 text-[var(--forest)]' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {log.status === 'Graded' ? 'Graded' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-[var(--paper-card)] p-3 rounded-[3px] border border-[var(--line)] text-center">
                        <div className="text-[10px] font-bold uppercase text-[var(--ink-soft)] mb-1">Reading</div>
                        <div className="text-[18px] font-medium text-[var(--ink)]">{log.scores?.reading || '-'}</div>
                      </div>
                      <div className="bg-[var(--paper-card)] p-3 rounded-[3px] border border-[var(--line)] text-center">
                        <div className="text-[10px] font-bold uppercase text-[var(--ink-soft)] mb-1">Listening</div>
                        <div className="text-[18px] font-medium text-[var(--ink)]">{log.scores?.listening || '-'}</div>
                      </div>
                      <div className="bg-[var(--paper-card)] p-3 rounded-[3px] border border-[var(--line)] text-center">
                        <div className="text-[10px] font-bold uppercase text-[var(--ink-soft)] mb-1">Writing</div>
                        <div className="text-[18px] font-medium text-[var(--ink)]">{log.scores?.writing || (log.status === 'Graded' ? '-' : 'Pending')}</div>
                      </div>
                    </div>
                  </div>
                  
                  {log.status === 'Graded' && log.overallBand && (
                    <div className="bg-[var(--forest)]/5 p-3 rounded-[3px] border border-[var(--forest)]/20 flex justify-between items-center mt-2">
                      <span className="font-bold text-[12px] text-[var(--forest)] uppercase tracking-wider">Overall Band Score</span>
                      <span className="font-display text-[20px] text-[var(--forest)]">{log.overallBand}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--line-soft)]">
                    <Link href={`/student/results/${log.id}`} className="btn bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] px-3 py-1.5 text-[12px]">
                      View Detailed Results
                    </Link>
                    <Link href={`/student/exam/${log.testId}`} className="btn bg-[var(--paper-alt)] border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] px-3 py-1.5 text-[12px]">
                      Retake Exam
                    </Link>
                    {!mySpeakingRequests.some(r => r.testId === log.testId) && (
                      <button onClick={() => handleRequestSpeaking(log.testId)} className="btn bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1.5 text-[12px]">
                        Request Speaking Mock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SPEAKING REQUESTS SECTION */}
      {mySpeakingRequests.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 font-display text-[22px] text-[var(--ink)] mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Speaking Mock Sessions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySpeakingRequests.map(req => {
              const test = tests.find(t => t.id === req.testId);
              return (
                <div key={req.id} className="panel p-5 overflow-hidden flex flex-col justify-between border-l-4" style={{borderLeftColor: req.status === 'pending' ? '#d97706' : '#2F6E52'}}>
                  <div>
                    <div className="font-medium text-[15px] text-[var(--ink)]">{test?.title || 'Speaking Mock'}</div>
                    <div className="text-[12px] text-[var(--ink-soft)] mt-1">Requested {new Date(req.requestedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-4">
                    {req.status === 'pending' ? (
                      <span className="text-[12px] font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">Pending Schedule</span>
                    ) : req.status === 'scheduled' ? (
                      <div className="bg-blue-50 p-3 rounded border border-blue-100 text-[13px] text-blue-800 space-y-1">
                        <div className="font-bold flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600"/> Scheduled
                        </div>
                        <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5"/> {new Date(req.scheduledDate!).toLocaleString()}</div>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{req.type}:</span> 
                          {req.link ? <a href={req.link} target="_blank" rel="noreferrer" className="underline hover:text-blue-600 truncate">{req.link}</a> : 'In-center'}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[var(--forest)]/5 p-3 rounded border border-[var(--forest)]/20 text-[13px] space-y-2">
                        <div className="font-bold flex items-center text-[var(--forest)]">
                          <CheckCircle2 className="w-4 h-4 mr-1.5"/> Completed
                        </div>
                        {req.feedback && (
                          <div className="text-[var(--ink)] bg-white/60 p-2 rounded border border-[var(--line)] mt-2 whitespace-pre-wrap leading-relaxed relative">
                            <div className="text-[10px] font-bold uppercase text-[var(--ink-soft)] mb-1">Feedback</div>
                            {req.feedback}
                            {req.bandScore && (
                              <div className="absolute top-2 right-2 bg-[var(--forest)]/10 text-[var(--forest)] px-2 py-0.5 rounded-[3px] text-[11px] font-bold tracking-wider">
                                BAND {req.bandScore}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PENDING EXAMS SECTION */}
      <div className="panel mb-6 border-none bg-transparent p-0 shadow-none">
        <div className="flex items-center gap-2 font-display text-[22px] text-[var(--ink)] mb-4">
          <BookOpen className="w-5 h-5 text-[var(--brick)]" /> Pending Mock Examinations
        </div>

        {tests.filter(t => !completedTestIds.includes(t.id)).map((t) => (
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
                </div>
                <div className="p-4 bg-[var(--paper-card)] rounded-[3px] border border-[var(--line)]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--forest)] font-medium">Module 2</div>
                  <div className="text-[15px] font-medium text-[var(--ink)] mt-1">Listening</div>
                </div>
                <div className="p-4 bg-[var(--paper-card)] rounded-[3px] border border-[var(--line)]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--forest)] font-medium">Module 3</div>
                  <div className="text-[15px] font-medium text-[var(--ink)] mt-1">Writing</div>
                </div>
                <div className="p-4 bg-[var(--paper-card)] rounded-[3px] border border-[var(--line)]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--forest)] font-medium">Module 4</div>
                  <div className="text-[15px] font-medium text-[var(--ink)] mt-1">Speaking</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-[12.5px] text-[var(--gold)] bg-[rgba(180,135,43,0.1)] p-3 rounded-[3px] border border-[rgba(180,135,43,0.2)] flex-1">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Once started, the exam interface will enter strict distraction-free mode.</span>
                </div>

                <Link
                  href={`/student/exam/${t.id}`}
                  className="btn btn-fill w-full sm:w-auto flex justify-center py-3.5"
                  style={{ backgroundColor: 'var(--brick)', borderColor: 'var(--brick)' }}
                >
                  <Play className="w-4 h-4 fill-white mr-1.5" /> Launch Mock Exam
                </Link>
              </div>

            </div>
          </div>
        ))}

        {tests.filter(t => !completedTestIds.includes(t.id)).length === 0 && (
          <div className="panel p-10 text-center text-[var(--ink-soft)] bg-white/50 border-dashed">
            You have completed all assigned mock exams.
          </div>
        )}
      </div>
    </>
  );
}
