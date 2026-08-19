import React, { useState } from 'react';
import { ExamLog, Test, WritingAssessment } from '@/lib/mock-data';
import { CheckCircle2, XCircle, AlertCircle, Award, BookOpen, FileText, Check, ChevronDown, ChevronUp, UserCheck, MessageSquare } from 'lucide-react';
import { WritingGradingForm } from './WritingGradingForm';

interface DetailedResultsViewProps {
  log: ExamLog;
  test: Test;
  isOrg?: boolean;
  onUpdateWriting?: (assessment: WritingAssessment) => void;
}

export function DetailedResultsView({ log, test, isOrg, onUpdateWriting }: DetailedResultsViewProps) {
  const [editingWriting, setEditingWriting] = useState(false);
  const [activeWritingTab, setActiveWritingTab] = useState<number>(0);

  const assessment = log.writingAssessment;
  const isWritingPending = log.scores?.writing === undefined || log.status !== 'Graded';

  const handleAssessmentSave = (newAssessment: WritingAssessment) => {
    if (onUpdateWriting) {
      onUpdateWriting(newAssessment);
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
    <div className="space-y-8 pb-16 font-sans">
      
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
            <div className={`text-[24px] font-display ${log.scores?.writing !== undefined ? 'text-[#005C53]' : 'text-amber-600'}`}>
              {log.scores?.writing !== undefined ? `Band ${log.scores.writing.toFixed(1)}` : (log.modulesTaken.includes('writing') ? 'Pending' : '-')}
            </div>
          </div>
          <div className="bg-[var(--forest)]/5 p-4 rounded-[3px] border border-[var(--forest)]/20 text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--forest)] mb-1">Overall Band</div>
            <div className="text-[24px] font-display text-[var(--forest)]">{log.overallBand ? `Band ${log.overallBand.toFixed(1)}` : '-'}</div>
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

      {/* WRITING RESULTS & COMPREHENSIVE 4-CRITERIA EVALUATION */}
      {(log.modulesTaken.includes('writing') || Boolean(log.answers.writing && Object.keys(log.answers.writing).length > 0)) && (
        <div className="panel p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#005C53]" />
                <h3 className="font-display text-[18px] text-[var(--ink)]">Writing Module Evaluation & Feedback</h3>
              </div>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                Official IELTS Assessment criteria breakdown and examiner commentary.
              </p>
            </div>
            
            {isOrg && (
              <button 
                onClick={() => setEditingWriting(!editingWriting)} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  editingWriting
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-[#005C53] hover:bg-[#004740] text-white'
                }`}
              >
                {editingWriting ? 'Close Grading Form' : (isWritingPending ? 'Assess & Grade Submission' : 'Edit Examiner Feedback')}
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* INLINE ORG GRADING FORM */}
            {editingWriting && isOrg ? (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <WritingGradingForm
                  tasks={test.writing}
                  studentAnswers={log.answers.writing || {}}
                  initialAssessment={log.writingAssessment}
                  onSave={handleAssessmentSave}
                  onCancel={() => setEditingWriting(false)}
                  evaluatorRole="Organization Examiner"
                />
              </div>
            ) : isWritingPending ? (
              /* PENDING WRITING EVALUATION BANNER */
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Writing Assessment Pending</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your writing submission has been delivered directly to your organization's examiners. They will evaluate your responses based on Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Accuracy.
                </p>
                {isOrg && (
                  <button
                    onClick={() => setEditingWriting(true)}
                    className="px-6 py-2.5 bg-[#005C53] text-white font-bold rounded-xl text-xs shadow-md hover:bg-[#004740] transition-all inline-flex items-center space-x-2"
                  >
                    <span>Begin Grading Now</span>
                  </button>
                )}
              </div>
            ) : (
              /* GRADED 4-CRITERIA BREAKDOWN */
              <div className="space-y-6">
                {/* Examiner General Summary Banner */}
                <div className="bg-gradient-to-r from-slate-900 to-[#005C53] text-white p-6 rounded-2xl shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-emerald-300 font-mono text-[11px] uppercase tracking-wider font-bold">
                        Evaluated by {assessment?.gradedBy || 'Examiner'}
                      </span>
                      <h4 className="text-xl font-bold text-white mt-0.5">Overall Writing Score: Band {log.scores?.writing?.toFixed(1) || '6.0'}</h4>
                      {assessment?.gradedAt && (
                        <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                          Graded on {new Date(assessment.gradedAt).toLocaleDateString([], { dateStyle: 'long' })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      {assessment?.task1?.overallTaskBand !== undefined && (
                        <div className="bg-black/30 px-3.5 py-2 rounded-xl border border-white/10 text-center">
                          <div className="text-[10px] uppercase font-mono text-slate-300">Task 1</div>
                          <div className="text-base font-bold text-amber-300 font-mono">Band {assessment.task1.overallTaskBand.toFixed(1)}</div>
                        </div>
                      )}
                      {assessment?.task2?.overallTaskBand !== undefined && (
                        <div className="bg-black/30 px-3.5 py-2 rounded-xl border border-white/10 text-center">
                          <div className="text-[10px] uppercase font-mono text-slate-300">Task 2 (Weight ×2)</div>
                          <div className="text-base font-bold text-amber-300 font-mono">Band {assessment.task2.overallTaskBand.toFixed(1)}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {assessment?.generalNotes && (
                    <div className="pt-4 space-y-1">
                      <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Examiner Commentary & Recommendations</span>
                      </div>
                      <p className="text-xs text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                        {assessment.generalNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Per-Task Feedback Breakdown Tabs */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                    {test.writing.map((task, idx) => (
                      <button
                        key={task.id}
                        onClick={() => setActiveWritingTab(idx)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                          activeWritingTab === idx
                            ? 'bg-[#005C53] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Task {task.taskNumber} ({task.taskNumber === 1 ? 'Report' : 'Essay'}) Breakdown
                      </button>
                    ))}
                  </div>

                  {test.writing[activeWritingTab] && (() => {
                    const t = test.writing[activeWritingTab];
                    const tFeedback = t.taskNumber === 1 ? assessment?.task1 : assessment?.task2;
                    const studentEssay = log.answers.writing?.[t.id] || '';
                    const wordCount = studentEssay.trim() ? studentEssay.trim().split(/\s+/).filter(Boolean).length : 0;

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Student Response on Left */}
                        <div className="lg:col-span-5 space-y-3">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                              <span>Student Submission</span>
                              <span className="font-mono text-[11px] text-slate-500">{wordCount} words (Min {t.minWords})</span>
                            </div>
                            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto font-sans bg-white p-3 rounded-lg border border-slate-200">
                              {studentEssay || <span className="text-slate-400 italic">No response submitted.</span>}
                            </div>
                          </div>
                        </div>

                        {/* 4 Criteria Cards on Right */}
                        <div className="lg:col-span-7 space-y-3">
                          {/* Criterion 1: TA / TR */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900">
                                1. {t.taskNumber === 1 ? 'Task Achievement' : 'Task Response'}
                              </span>
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-[#005C53] rounded-full font-mono text-xs font-bold">
                                Band {tFeedback?.taskAchievementScore?.toFixed(1) || '—'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 italic">
                              Did you answer all parts of the prompt? Did you write enough words and present clear main ideas?
                            </p>
                            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                              {tFeedback?.taskAchievementFeedback || 'Good coverage of requirements.'}
                            </p>
                          </div>

                          {/* Criterion 2: CC */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900">
                                2. Coherence and Cohesion
                              </span>
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-[#005C53] rounded-full font-mono text-xs font-bold">
                                Band {tFeedback?.coherenceScore?.toFixed(1) || '—'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 italic">
                              Are your ideas organized well into paragraphs? Did you use linking words correctly?
                            </p>
                            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                              {tFeedback?.coherenceFeedback || 'Logical paragraphing and transition flow.'}
                            </p>
                          </div>

                          {/* Criterion 3: LR */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900">
                                3. Lexical Resource (Vocabulary)
                              </span>
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-[#005C53] rounded-full font-mono text-xs font-bold">
                                Band {tFeedback?.lexicalScore?.toFixed(1) || '—'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 italic">
                              Did you use a wide range of vocabulary accurately with appropriate word choice and spelling?
                            </p>
                            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                              {tFeedback?.lexicalFeedback || 'Appropriate vocabulary range and academic register.'}
                            </p>
                          </div>

                          {/* Criterion 4: GRA */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900">
                                4. Grammatical Range and Accuracy
                              </span>
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-[#005C53] rounded-full font-mono text-xs font-bold">
                                Band {tFeedback?.grammarScore?.toFixed(1) || '—'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 italic">
                              Did you use a mix of simple and complex sentence structures? Are your grammar and punctuation correct?
                            </p>
                            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                              {tFeedback?.grammarFeedback || 'Grammar, sentence complexity, and punctuation are sound.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

