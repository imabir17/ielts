'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { getTestById } from '@/lib/test-store';
import { MOCK_IELTS_TEST } from '@/lib/mock-data';
import { BookOpen, Headphones, Edit3, Mic, Play, ChevronLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = typeof params?.id === 'string' ? params.id : '';
  
  const { currentUser, setCurrentUser, examLogs, speakingRequests, addSpeakingRequest, tests } = useStore();
  const [test, setTest] = useState<any>(null);

  useEffect(() => {
    const found = tests.find((t: any) => t.id === testId) || getTestById(testId) || MOCK_IELTS_TEST;
    setTest(found);

    if (!currentUser) {
      setCurrentUser({ id: 'std-1', role: 'student', name: 'Candidate', studentId: 'STU-8821' });
    }
  }, [testId, tests, currentUser, setCurrentUser]);

  const activeTest = test || tests.find((t: any) => t.id === testId) || getTestById(testId) || MOCK_IELTS_TEST;

  const log = examLogs.find(l => l.studentId === currentUser?.id && l.testId === testId);
  const speakingReq = speakingRequests.find(r => r.studentId === currentUser?.id && r.testId === testId);
  
  const modulesTaken = log?.modulesTaken || [];
  const isFullyCompleted = modulesTaken.length === 4;

  const handleRequestSpeaking = () => {
    if (!currentUser) return;
    addSpeakingRequest({
      id: `req-${Date.now()}`,
      studentId: currentUser.id,
      orgId: currentUser.orgId || '',
      testId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      type: 'Online',
    });
  };


  return (
    <>
      <div className="mb-6">
        <Link href="/student/tests" className="inline-flex items-center text-[12px] font-bold uppercase tracking-wider text-[var(--ink-soft)] hover:text-[var(--ink)]">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tests
        </Link>
      </div>

      <div className="panel overflow-hidden mb-8">
        <div className="p-8 border-b border-[var(--line-soft)] bg-gradient-to-r from-[var(--paper-card)] to-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.05em] bg-[var(--forest)]/10 text-[var(--forest)] px-2 py-0.5 rounded-[2px] font-medium">
              {activeTest.category}
            </span>
            {isFullyCompleted && (
              <span className="font-mono text-[10px] uppercase tracking-[0.05em] bg-[var(--forest)]/10 text-[var(--forest)] px-2 py-0.5 rounded-[2px] font-medium flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
              </span>
            )}
          </div>
          <h1 className="font-display text-[28px] text-[var(--ink)] m-0">{activeTest.title}</h1>
          <p className="text-[14px] text-[var(--ink-soft)] mt-2 max-w-2xl">
            This test replicates the official IELTS computer-delivered format. You can take the modules all at once or one by one.
          </p>
        </div>

        <div className="p-8">
          <h3 className="font-medium text-[16px] text-[var(--ink)] mb-4">Test Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { id: 'reading', label: 'Reading', icon: BookOpen, time: '60 mins' },
              { id: 'listening', label: 'Listening', icon: Headphones, time: 'Audio + 10 mins' },
              { id: 'writing', label: 'Writing', icon: Edit3, time: '60 mins' },
              { id: 'speaking', label: 'Speaking', icon: Mic, time: '11-14 mins' },
            ].map(mod => {
              const isTaken = modulesTaken.includes(mod.id as any);
              const score = log?.scores?.[mod.id as keyof typeof log.scores];

              return (
                <div key={mod.id} className={`panel p-4 relative border-2 ${isTaken ? 'border-[var(--forest)] bg-[var(--forest)]/5' : 'border-[var(--line-soft)] bg-[var(--paper)]'}`}>
                  {isTaken && (
                    <div className="absolute top-2 right-2 text-[var(--forest)]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isTaken ? 'bg-[var(--forest)]/20 text-[var(--forest)]' : 'bg-[var(--line)] text-[var(--ink-soft)]'}`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div className="font-medium text-[var(--ink)] text-[15px] capitalize">{mod.label}</div>
                  <div className="text-[12px] text-[var(--ink-soft)] mt-1">{mod.time}</div>
                  
                  {isTaken && score !== undefined && (
                    <div className="mt-3 pt-3 border-t border-[var(--forest)]/20 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-[var(--forest)]">Score</span>
                      <span className="font-display text-[16px] text-[var(--forest)]">{score}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--line-soft)]">
            <div className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)] bg-[var(--paper-card)] p-3 rounded-[3px] flex-1">
              <ShieldAlert className="w-5 h-5 text-[var(--gold)] shrink-0" />
              <span>You can take any remaining modules now, or retake completed modules to overwrite your previous attempt.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {log && (
                <Link
                  href={`/student/results/${log.id}`}
                  className="btn bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink)] w-full sm:w-auto justify-center"
                >
                  View Detailed Results
                </Link>
              )}
              <Link
                href={`/student/exam/${activeTest.id}`}
                className="btn btn-fill w-full sm:w-auto justify-center"
                style={{ backgroundColor: 'var(--brick)', borderColor: 'var(--brick)' }}
              >
                <Play className="w-4 h-4 fill-white mr-1.5" /> 
                {modulesTaken.length > 0 ? 'Resume / Retake Exam' : 'Launch Mock Exam'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Speaking Request Status Widget */}
      {isFullyCompleted && (
        <div className="panel p-6 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-[16px] text-[var(--ink)]">Official Speaking Mock</h3>
            <p className="text-[13px] text-[var(--ink-soft)] mt-1">Request a live speaking session with an examiner.</p>
          </div>
          <div>
            {!speakingReq ? (
              <button onClick={handleRequestSpeaking} className="btn bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                Request Session
              </button>
            ) : (
              <div className="px-4 py-2 rounded bg-blue-50 border border-blue-100 text-blue-800 text-[13px] font-medium flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                Session Status: {speakingReq.status}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
