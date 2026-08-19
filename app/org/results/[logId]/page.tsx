'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { DetailedResultsView } from '@/components/exam/DetailedResultsView';
import { ArrowLeft } from 'lucide-react';
import { OrgSidebar } from '@/components/layout/OrgSidebar';

export default function OrgDetailedResultsPage() {
  const params = useParams();
  const router = useRouter();
  const logId = typeof params?.logId === 'string' ? params.logId : '';
  const { examLogs, tests, currentUser, updateExamLog } = useStore();

  if (!currentUser) return null;

  // Verify access (must be same org)
  const log = examLogs.find(l => l.id === logId && (l.orgId === currentUser.id || currentUser.role === 'tenant'));
  const test = log ? tests.find(t => t.id === log.testId) : null;

  const handleUpdateWriting = (assessment: any) => {
    if (!log) return;

    const newScore = assessment.overallWritingBand || 6.0;
    const newScores = { ...log.scores, writing: newScore };
    
    // Recalculate overall band if reading/listening exist
    let newOverallBand = log.overallBand;
    const scoresArray = [];
    if (newScores.reading !== undefined) scoresArray.push(newScores.reading);
    if (newScores.listening !== undefined) scoresArray.push(newScores.listening);
    if (newScores.speaking !== undefined) scoresArray.push(newScores.speaking);
    scoresArray.push(newScore);

    if (scoresArray.length > 0) {
      const sum = scoresArray.reduce((a, b) => a + b, 0);
      const avg = sum / scoresArray.length;
      // Round to nearest 0.5
      newOverallBand = Math.round(avg * 2) / 2;
    }

    const summaryFeedback = [
      assessment.generalNotes ? `Overall Feedback: ${assessment.generalNotes}` : '',
      assessment.task1 ? `Task 1 (Band ${assessment.task1.overallTaskBand?.toFixed(1)}): TA ${assessment.task1.taskAchievementScore}, CC ${assessment.task1.coherenceScore}, LR ${assessment.task1.lexicalScore}, GRA ${assessment.task1.grammarScore}` : '',
      assessment.task2 ? `Task 2 (Band ${assessment.task2.overallTaskBand?.toFixed(1)}): TR ${assessment.task2.taskAchievementScore}, CC ${assessment.task2.coherenceScore}, LR ${assessment.task2.lexicalScore}, GRA ${assessment.task2.grammarScore}` : ''
    ].filter(Boolean).join('\n\n');

    updateExamLog(log.id, {
      status: 'Graded',
      scores: newScores,
      writingAssessment: assessment,
      writingFeedback: summaryFeedback,
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

      <DetailedResultsView log={log} test={test} isOrg={true} onUpdateWriting={handleUpdateWriting} />
    </>
  );
}
