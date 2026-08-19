'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { getTestById } from '@/lib/test-store';
import { WritingGradingForm } from '@/components/exam/WritingGradingForm';
import { WritingAssessment } from '@/lib/mock-data';
import { CheckCircle2, FileText, ChevronRight, MessageSquare, ArrowLeft } from 'lucide-react';

export default function SuperadminGradingPage() {
  const { examLogs, updateExamLog, currentUser } = useStore();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filter logs to find those that took Writing and are not yet graded
  const ungradedLogs = examLogs.filter(log => log.modulesTaken?.includes('writing') && log.status !== 'Graded');
  
  const selectedLog = examLogs.find(l => l.id === selectedLogId);
  const selectedTest = selectedLog ? getTestById(selectedLog.testId) : null;

  const handleAssessmentSave = (assessment: WritingAssessment) => {
    if (!selectedLog) return;
    
    const wScore = assessment.overallWritingBand || 6.0;
    const newScores = {
      ...selectedLog.scores,
      writing: wScore
    };
    
    const rScore = selectedLog.scores?.reading;
    const lScore = selectedLog.scores?.listening;
    const sScore = selectedLog.scores?.speaking;
    
    const parts = [wScore];
    if (rScore !== undefined) parts.push(rScore);
    if (lScore !== undefined) parts.push(lScore);
    if (sScore !== undefined) parts.push(sScore);
    
    const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
    const overall = Math.round(avg * 2) / 2;

    const summaryFeedback = [
      assessment.generalNotes ? `Overall Feedback: ${assessment.generalNotes}` : '',
      assessment.task1 ? `Task 1 (Band ${assessment.task1.overallTaskBand?.toFixed(1)}): TA ${assessment.task1.taskAchievementScore}, CC ${assessment.task1.coherenceScore}, LR ${assessment.task1.lexicalScore}, GRA ${assessment.task1.grammarScore}` : '',
      assessment.task2 ? `Task 2 (Band ${assessment.task2.overallTaskBand?.toFixed(1)}): TR ${assessment.task2.taskAchievementScore}, CC ${assessment.task2.coherenceScore}, LR ${assessment.task2.lexicalScore}, GRA ${assessment.task2.grammarScore}` : ''
    ].filter(Boolean).join('\n\n');

    updateExamLog(selectedLog.id, {
      status: 'Graded',
      writingAssessment: assessment,
      writingFeedback: summaryFeedback,
      scores: newScores,
      overallBand: overall
    });

    setSelectedLogId(null);
  };

  return (
    <>
      <div className="topbar mb-6">
        <div>
          <div className="eyebrow"><span className="dot"></span>Superadmin Portal</div>
          <h1 className="text-[28px]">Writing Assessment Center</h1>
          <p className="page-sub">Comprehensive 4-criteria IELTS evaluation for pending essays.</p>
        </div>
      </div>

      {selectedLog && selectedTest ? (
        <div className="space-y-6">
          <div className="panel p-4 flex items-center justify-between bg-white border border-slate-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedLogId(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedLog.studentName}</h3>
                <div className="text-xs text-slate-500 font-mono">
                  Test: {selectedLog.testTitle} • Submitted: {new Date(selectedLog.completedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <WritingGradingForm
            tasks={selectedTest.writing}
            studentAnswers={selectedLog.answers?.writing || {}}
            initialAssessment={selectedLog.writingAssessment}
            onSave={handleAssessmentSave}
            onCancel={() => setSelectedLogId(null)}
            evaluatorRole="Superadmin Examiner"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="panel p-0 overflow-hidden">
            <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex items-center justify-between">
              <h3 className="font-medium text-[16px] text-[var(--ink)]">Pending Submissions</h3>
              <span className="text-xs font-mono text-[var(--ink-faint)]">{ungradedLogs.length} Pending</span>
            </div>

            <div className="overflow-x-auto">
              <table className="audit-table w-full">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Test Title</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ungradedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-[var(--ink-faint)]">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                        <p className="text-sm font-medium">All writing submissions have been assessed and graded!</p>
                      </td>
                    </tr>
                  ) : (
                    ungradedLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="font-bold text-slate-900">{log.studentName}</td>
                        <td className="text-xs text-slate-700 font-medium">{log.testTitle}</td>
                        <td className="text-xs text-slate-500 font-mono">{new Date(log.completedAt).toLocaleString()}</td>
                        <td>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                            Pending Evaluation
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedLogId(log.id)}
                            className="px-4 py-1.5 rounded-xl bg-[#005C53] hover:bg-[#004740] text-white text-xs font-bold transition-all shadow-sm"
                          >
                            Assess & Grade
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

