'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { DetailedResultsView } from '@/components/exam/DetailedResultsView';
import { ArrowLeft } from 'lucide-react';

export default function StudentDetailedResultsPage() {
  const params = useParams();
  const router = useRouter();
  const logId = typeof params?.logId === 'string' ? params.logId : '';
  const { examLogs, tests, currentUser } = useStore();

  const log = examLogs.find(l => l.id === logId && (!currentUser || l.studentId === currentUser.id));
  const test = log ? tests.find(t => t.id === log.testId) : null;


  if (!log || !test) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pt-20">
        <h2 className="text-xl mb-4">Result not found or access denied.</h2>
        <button onClick={() => router.push('/student')} className="btn btn-ghost">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="topbar mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/student/tests/${log.testId}`)} className="w-8 h-8 rounded-full bg-[var(--paper-card)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="eyebrow"><span className="dot"></span>{log.testTitle}</div>
            <h1 className="text-[28px]">Detailed Results</h1>
          </div>
        </div>
      </div>

      <DetailedResultsView log={log} test={test} isOrg={false} />
    </>
  );
}
