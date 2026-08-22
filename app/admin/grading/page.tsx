'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { getTestById } from '@/lib/test-store';
import { CheckCircle2, FileText, ChevronRight, MessageSquare } from 'lucide-react';

export default function SuperadminGradingPage() {
  const { examLogs, updateExamLog, currentUser } = useStore();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Form State
  const [bandScore, setBandScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  // Filter logs to find those that took Writing and are not yet graded

  const ungradedLogs = examLogs.filter(log => log.modulesTaken?.includes('writing') && log.status !== 'Graded');
  
  const selectedLog = examLogs.find(l => l.id === selectedLogId);
  const selectedTest = selectedLog ? getTestById(selectedLog.testId) : null;

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;
    
    // We assume reading/listening scores might already exist from auto-grading
    // For this mockup, we just calculate an average overall band or set it directly
    const rScore = selectedLog.scores?.reading || 0;
    const lScore = selectedLog.scores?.listening || 0;
    const wScore = parseFloat(bandScore);
    
    let parts = 1;
    let total = wScore;
    if (rScore > 0) { parts++; total += rScore; }
    if (lScore > 0) { parts++; total += lScore; }
    
    const overall = (total / parts).toFixed(1);

    updateExamLog(selectedLog.id, {
      status: 'Graded',
      writingFeedback: feedback,
      scores: {
        ...selectedLog.scores,
        writing: wScore
      },
      overallBand: parseFloat(overall)
    });

    setSelectedLogId(null);
    setBandScore('');
    setFeedback('');
  };

  return (
    <>
      <div className="topbar mb-6">
        <div>
          <h1>Writing Assessment Center</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: List of ungraded writing submissions */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <h2 className="font-medium text-[16px] text-[var(--ink)]">Pending Submissions</h2>
          
          <div className="space-y-3">
            {ungradedLogs.length === 0 ? (
              <div className="panel p-6 text-center text-[var(--ink-faint)] text-[14px]">
                No pending writing assessments.
              </div>
            ) : (
              ungradedLogs.map(log => (
                <div
                  key={log.id}
                  onClick={() => {
                    setSelectedLogId(log.id);
                    setBandScore('');
                    setFeedback('');
                  }}
                  className={`panel p-4 cursor-pointer transition-colors ${
                    selectedLogId === log.id ? 'border-[var(--ink)] ring-1 ring-[var(--ink)] bg-[var(--paper)]' : 'hover:border-[var(--ink-soft)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-[15px] text-[var(--ink)] truncate pr-2">{log.studentName}</div>
                    <span className="text-[11px] text-[var(--ink-soft)] bg-[var(--line-soft)] px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                      Writing
                    </span>
                  </div>
                  <div className="text-[13px] text-[var(--ink-soft)] truncate mb-1">
                    {log.testTitle}
                  </div>
                  <div className="text-[11px] text-[var(--ink-faint)]">
                    Submitted: {new Date(log.completedAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Grading Interface */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {selectedLog && selectedTest ? (
            <div className="panel p-0 flex flex-col h-[800px] overflow-hidden">
              <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[18px] text-[var(--ink)]">{selectedLog.studentName}'s Submission</h3>
                  <div className="text-[13px] text-[var(--ink-soft)] mt-1">{selectedLog.testTitle}</div>
                </div>
                <div className="flex items-center space-x-2 text-[12px] text-[var(--ink-soft)] bg-white px-3 py-1 rounded border border-[var(--line)] shadow-sm">
                  <FileText className="w-4 h-4 text-[var(--ink)]" />
                  <span>View Prompts Below</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
                {selectedTest.writing.map((task, idx) => {
                  const studentAns = selectedLog.answers?.writing?.[task.id];
                  return (
                    <div key={task.id} className="space-y-4 pb-6 border-b border-[var(--line-soft)] last:border-0">
                      {/* Task Prompt Area */}
                      <div className="bg-slate-50 p-5 rounded-[3px] border border-[var(--line-soft)]">
                        <div className="text-[12px] font-bold text-[var(--ink-soft)] uppercase tracking-wider mb-2">
                          Task {task.taskNumber} Prompt
                        </div>
                        <div className="text-[14px] text-[var(--ink)] whitespace-pre-wrap font-medium">
                          {task.prompt}
                        </div>
                      </div>

                      {/* Student Response Area */}
                      <div>
                        <div className="text-[12px] font-bold text-[var(--ink-soft)] uppercase tracking-wider mb-2 flex justify-between">
                          <span>Student's Response</span>
                          <span>Word Count: {studentAns ? studentAns.trim().split(/\s+/).length : 0}</span>
                        </div>
                        <div className="p-5 rounded-[3px] border border-[var(--line)] bg-[var(--paper)] text-[15px] font-serif leading-relaxed text-[var(--ink)] whitespace-pre-wrap min-h-[150px]">
                          {studentAns || <span className="text-[var(--ink-faint)] italic">No answer submitted.</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grading Form Footer */}
              <div className="p-5 border-t border-[var(--line)] bg-[var(--paper-card)] shrink-0">
                <form onSubmit={handleGradeSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[12px] font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Examiner Feedback</label>
                    <textarea
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide detailed feedback on Task Response, Coherence, Lexical Resource, and Grammatical Range..."
                      className="w-full p-3 bg-white border border-[var(--line-soft)] rounded-[3px] text-[14px] focus:outline-none focus:border-[var(--ink)] resize-none h-20 shadow-inner"
                    />
                  </div>
                  
                  <div className="w-full md:w-32 shrink-0">
                    <label className="block text-[12px] font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Band Score</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      required
                      value={bandScore}
                      onChange={(e) => setBandScore(e.target.value)}
                      placeholder="e.g. 6.5"
                      className="w-full p-3 bg-white border border-[var(--line-soft)] rounded-[3px] text-[16px] font-bold text-center focus:outline-none focus:border-[var(--ink)] shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-fill w-full md:w-auto h-[46px] px-6"
                  >
                    Submit Grade
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="panel p-10 flex-1 flex flex-col items-center justify-center text-center text-[var(--ink-soft)] bg-white/50 border-dashed h-[400px]">
              <MessageSquare className="w-12 h-12 text-[var(--line)] mb-4" />
              <h3 className="font-medium text-[18px] text-[var(--ink)] mb-2">No Submission Selected</h3>
              <p className="text-[14px] max-w-sm">Select a pending writing submission from the left panel to review the student's work and assign a band score.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
