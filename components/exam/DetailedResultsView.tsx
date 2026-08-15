'use client';

import React from 'react';
import { ExamLog, Test } from '@/lib/mock-data';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface DetailedResultsViewProps {
  log: ExamLog;
  test: Test;
  isOrg?: boolean;
  onUpdateWriting?: (newScore: number, feedback: string) => void;
}

export function DetailedResultsView({ log, test, isOrg, onUpdateWriting }: DetailedResultsViewProps) {
  const [editingWriting, setEditingWriting] = React.useState(false);
  const [overrideScore, setOverrideScore] = React.useState(log.scores?.writing?.toString() || '');
  const [overrideFeedback, setOverrideFeedback] = React.useState(log.writingFeedback || '');

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateWriting) {
      onUpdateWriting(parseFloat(overrideScore), overrideFeedback);
      setEditingWriting(false);
    }
  };

  // Helper to extract reading questions
  const readingQuestions = test.reading.flatMap(passage => passage.questions);
  
  // Helper to extract listening questions
  const listeningQuestions = test.listening.flatMap(section => 
    section.sections ? section.sections.flatMap(s => s.questions) : section.questions
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* SCORES SUMMARY */}
      <div className="panel p-6">
        <h2 className="font-display text-[20px] mb-4 text-[var(--ink)]">Scores Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--paper-card)] p-4 rounded-[3px] border border-[var(--line)] text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1">Reading</div>
            <div className="text-[24px] font-display text-[var(--ink)]">{log.scores?.reading || '-'}</div>
          </div>
          <div className="bg-[var(--paper-card)] p-4 rounded-[3px] border border-[var(--line)] text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1">Listening</div>
            <div className="text-[24px] font-display text-[var(--ink)]">{log.scores?.listening || '-'}</div>
          </div>
          <div className="bg-[var(--paper-card)] p-4 rounded-[3px] border border-[var(--line)] text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1">Writing</div>
            <div className="text-[24px] font-display text-[var(--ink)]">{log.scores?.writing !== undefined ? log.scores.writing : '-'}</div>
          </div>
          <div className="bg-[var(--forest)]/5 p-4 rounded-[3px] border border-[var(--forest)]/20 text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--forest)] mb-1">Overall Band</div>
            <div className="text-[24px] font-display text-[var(--forest)]">{log.overallBand || '-'}</div>
          </div>
        </div>
      </div>

      {/* READING RESULTS */}
      {log.modulesTaken.includes('reading') && (
        <div className="panel p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)]">
            <h3 className="font-display text-[18px] text-[var(--ink)]">Reading Module Details</h3>
          </div>
          <div className="p-5">
            <table className="audit-table w-full">
              <thead>
                <tr>
                  <th>Q#</th>
                  <th>Question Type</th>
                  <th>Your Answer</th>
                  <th>Correct Answer</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {readingQuestions.map(q => {
                  const userAnswer = log.answers.reading?.[q.id];
                  const isCorrect = Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.includes(userAnswer)
                    : userAnswer === q.correctAnswer;

                  return (
                    <tr key={q.id}>
                      <td className="font-mono text-[12px]">{q.questionNumber}</td>
                      <td className="text-[13px] text-[var(--ink-soft)]">{q.type.replace(/_/g, ' ')}</td>
                      <td className="text-[14px] font-medium">{userAnswer || <span className="text-[var(--ink-faint)] italic">Blank</span>}</td>
                      <td className="text-[14px] font-medium text-[var(--forest)]">
                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' OR ') : q.correctAnswer}
                      </td>
                      <td>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--forest)]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[var(--brick)]" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LISTENING RESULTS */}
      {log.modulesTaken.includes('listening') && listeningQuestions.length > 0 && (
        <div className="panel p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)]">
            <h3 className="font-display text-[18px] text-[var(--ink)]">Listening Module Details</h3>
          </div>
          <div className="p-5">
            <table className="audit-table w-full">
              <thead>
                <tr>
                  <th>Q#</th>
                  <th>Question Type</th>
                  <th>Your Answer</th>
                  <th>Correct Answer</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {listeningQuestions.map(q => {
                  const userAnswer = log.answers.listening?.[q.id];
                  const isCorrect = Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.includes(userAnswer)
                    : userAnswer === q.correctAnswer;

                  return (
                    <tr key={q.id}>
                      <td className="font-mono text-[12px]">{q.questionNumber}</td>
                      <td className="text-[13px] text-[var(--ink-soft)]">{q.type.replace(/_/g, ' ')}</td>
                      <td className="text-[14px] font-medium">{userAnswer || <span className="text-[var(--ink-faint)] italic">Blank</span>}</td>
                      <td className="text-[14px] font-medium text-[var(--forest)]">
                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' OR ') : q.correctAnswer}
                      </td>
                      <td>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--forest)]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[var(--brick)]" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WRITING RESULTS */}
      {log.modulesTaken.includes('writing') && (
        <div className="panel p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex justify-between items-center">
            <h3 className="font-display text-[18px] text-[var(--ink)]">Writing Module Details</h3>
            {isOrg && (
              <button 
                onClick={() => setEditingWriting(!editingWriting)} 
                className="text-[13px] text-[var(--forest)] font-medium hover:underline"
              >
                {editingWriting ? 'Cancel Override' : 'Override Judgement'}
              </button>
            )}
          </div>
          <div className="p-5 space-y-6">
            
            {editingWriting && isOrg ? (
              <form onSubmit={handleOverrideSubmit} className="bg-amber-50 p-4 border border-amber-200 rounded-[3px] space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-medium text-[14px]">
                  <AlertCircle className="w-4 h-4" /> Override Superadmin Judgement
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1">New Band Score</label>
                    <input 
                      type="number" step="0.5" min="0" max="9" required
                      value={overrideScore} onChange={e => setOverrideScore(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--line)] rounded-[3px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1">New Feedback</label>
                  <textarea 
                    rows={4} required
                    value={overrideFeedback} onChange={e => setOverrideFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--line)] rounded-[3px]"
                  />
                </div>
                <button type="submit" className="btn btn-fill">Save Override</button>
              </form>
            ) : (
              <div className="bg-[var(--paper-card)] p-4 border border-[var(--line)] rounded-[3px]">
                <h4 className="font-medium text-[14px] text-[var(--ink)] mb-2">Grading Feedback</h4>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 bg-[var(--forest)]/10 text-[var(--forest)] rounded-[3px] text-[12px] font-bold">
                    Band: {log.scores?.writing !== undefined ? log.scores.writing : 'Pending'}
                  </span>
                </div>
                <p className="text-[14px] text-[var(--ink-soft)] whitespace-pre-wrap leading-relaxed">
                  {log.writingFeedback || 'No feedback provided yet.'}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium text-[14px] text-[var(--ink)] border-b border-[var(--line-soft)] pb-2">Student Response</h4>
              {test.writing.map(task => {
                const response = log.answers.writing?.[task.id] || '';
                return (
                  <div key={task.id} className="space-y-2">
                    <div className="text-[13px] font-bold text-[var(--ink-soft)]">{task.title}</div>
                    <div className="bg-white p-4 border border-[var(--line)] rounded-[3px] text-[14px] leading-relaxed whitespace-pre-wrap">
                      {response || <span className="text-[var(--ink-faint)] italic">No response submitted.</span>}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
