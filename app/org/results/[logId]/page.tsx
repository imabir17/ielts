'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { DetailedResultsView } from '@/components/exam/DetailedResultsView';
import { ArrowLeft } from 'lucide-react';
import { MOCK_IELTS_TEST } from '@/lib/mock-data';

export default function OrgDetailedResultsPage() {
  const params = useParams();
  const router = useRouter();
  const logId = typeof params?.logId === 'string' ? params.logId : '';
  const { examLogs, tests, currentUser, updateExamLog } = useStore();

  // Find the exam log by ID
  const log = examLogs.find(l => l.id === logId);

  // Match test definition with safe fallbacks
  const test = log ? (tests.find(t => t.id === log.testId) || tests[0] || MOCK_IELTS_TEST) : null;


  const handleUpdateWriting = (newScore: number, feedback: string) => {
    if (!log) return;

    const newScores = { ...log.scores, writing: newScore };
    
    // Recalculate overall band if reading/listening exist
    let newOverallBand = log.overallBand;
    const scoresArray = [];
    if (newScores.reading !== undefined) scoresArray.push(newScores.reading);
    if (newScores.listening !== undefined) scoresArray.push(newScores.listening);
    scoresArray.push(newScore);

    if (scoresArray.length > 0) {
      const sum = scoresArray.reduce((a, b) => a + b, 0);
      const avg = sum / scoresArray.length;
      // Round to nearest 0.5
      newOverallBand = Math.round(avg * 2) / 2;
    }

    updateExamLog(log.id, {
      scores: newScores,
      writingFeedback: feedback,
      overallBand: newOverallBand
    });
  };

  if (!log || !test) {
    return (
      <>
        <div className="topbar mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/org/results')} className="w-8 h-8 rounded-full bg-[var(--paper-card)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[28px]">Result Not Found</h1>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/org/results')} className="w-8 h-8 rounded-full bg-[var(--paper-card)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="eyebrow"><span className="dot"></span>{log.studentName}</div>
            <h1 className="text-[28px]">{log.testTitle}</h1>
            <p className="page-sub">Submitted on {new Date(log.completedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <DetailedResultsView 
        log={log} 
        test={test} 
        isOrg={true} 
        onSaveEvaluation={(payload) => updateExamLog(log.id, payload)}
        onUpdateWriting={handleUpdateWriting} 
      />
    </>
  );
}

