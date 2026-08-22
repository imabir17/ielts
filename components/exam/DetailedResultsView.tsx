'use client';

import React, { useState, useMemo } from 'react';
import { ExamLog, Test, Question } from '@/lib/mock-data';
import { rawToBandScore, calculateOverallBand, evaluateAnswerCorrectness } from '@/lib/ielts-grading';
import { extractResolvedQuestions, formatCorrectAnswerDisplay } from '@/lib/test-normalizer';
import { 
  CheckCircle2, XCircle, AlertCircle, Award, Check, RotateCcw, 
  Send, FileText, Edit3, MessageSquare, Clock, ShieldCheck, Image as ImageIcon 
} from 'lucide-react';


interface DetailedResultsViewProps {
  log: ExamLog;
  test: Test;
  isOrg?: boolean;
  onSaveEvaluation?: (updatedLog: Partial<ExamLog>) => void;
  onUpdateWriting?: (newScore: number, feedback: string) => void;
}

export function DetailedResultsView({ log, test, isOrg, onSaveEvaluation, onUpdateWriting }: DetailedResultsViewProps) {
  // Overrides state for Reading and Listening: { [qId]: boolean }
  const [manualOverrides, setManualOverrides] = useState<{
    reading: Record<string, boolean>;
    listening: Record<string, boolean>;
  }>(() => ({
    reading: log.manualOverrides?.reading || {},
    listening: log.manualOverrides?.listening || {}
  }));

  // Writing evaluation state
  const [task1Score, setTask1Score] = useState<string>(log.scores?.writingTask1?.toString() || '');
  const [task2Score, setTask2Score] = useState<string>(log.scores?.writingTask2?.toString() || '');
  const [writingScore, setWritingScore] = useState<string>(log.scores?.writing?.toString() || '');
  const [writingFeedback, setWritingFeedback] = useState<string>(log.writingFeedback || '');
  const [task1Feedback, setTask1Feedback] = useState<string>(log.task1Feedback || '');
  const [task2Feedback, setTask2Feedback] = useState<string>(log.task2Feedback || '');

  // Speaking evaluation state
  const [speakingScore, setSpeakingScore] = useState<string>(log.scores?.speaking?.toString() || '');
  const [speakingFeedback, setSpeakingFeedback] = useState<string>(log.speakingFeedback || '');

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Extract all Reading questions flat with guaranteed resolved answer keys
  const readingQuestions = useMemo(() => {
    return extractResolvedQuestions(test, 'reading');
  }, [test]);

  // Extract all Listening questions flat with guaranteed resolved answer keys
  const listeningQuestions = useMemo(() => {
    return extractResolvedQuestions(test, 'listening');
  }, [test]);

  // Helper to compute question correctness with manual override support
  const getQuestionStatus = (module: 'reading' | 'listening', q: Question) => {
    let userAnswer = log.answers?.[module]?.[q.id];
    if (userAnswer === undefined && q.questionNumber) {
      userAnswer = log.answers?.[module]?.[`q-${q.questionNumber}`] || log.answers?.[module]?.[String(q.questionNumber)];
    }
    const isAutoCorrect = evaluateAnswerCorrectness(userAnswer, q.correctAnswer);
    
    // Check if examiner explicitly marked this question
    const override = manualOverrides[module]?.[q.id];
    const isEffectiveCorrect = override !== undefined ? override : isAutoCorrect;
    const isOverridden = override !== undefined && override !== isAutoCorrect;

    return {

      userAnswer,
      isAutoCorrect,
      isEffectiveCorrect,
      isOverridden,
      overrideValue: override
    };
  };

  // Live recalculate Reading raw score and band score
  const liveReading = useMemo(() => {
    if (!log.modulesTaken.includes('reading')) return { raw: 0, band: undefined };
    let correctCount = 0;
    readingQuestions.forEach(q => {
      const { isEffectiveCorrect } = getQuestionStatus('reading', q);
      if (isEffectiveCorrect) correctCount++;
    });
    const band = rawToBandScore(correctCount, 'reading', test.category || 'Academic');
    return { raw: correctCount, band };
  }, [log, readingQuestions, manualOverrides.reading, test.category]);

  // Live recalculate Listening raw score and band score
  const liveListening = useMemo(() => {
    if (!log.modulesTaken.includes('listening')) return { raw: 0, band: undefined };
    let correctCount = 0;
    listeningQuestions.forEach(q => {
      const { isEffectiveCorrect } = getQuestionStatus('listening', q);
      if (isEffectiveCorrect) correctCount++;
    });
    const band = rawToBandScore(correctCount, 'listening', test.category || 'Academic');
    return { raw: correctCount, band };
  }, [log, listeningQuestions, manualOverrides.listening, test.category]);

  // Combined Writing band score (Task 1 is 1/3, Task 2 is 2/3)
  const calculatedWritingBand = useMemo(() => {
    const t1 = parseFloat(task1Score);
    const t2 = parseFloat(task2Score);
    if (!isNaN(t1) && !isNaN(t2)) {
      const weighted = (t1 * 1/3) + (t2 * 2/3);
      // Round to nearest 0.5
      return Math.round(weighted * 2) / 2;
    }
    const direct = parseFloat(writingScore);
    return !isNaN(direct) ? direct : undefined;
  }, [task1Score, task2Score, writingScore]);

  // Live Overall Band calculation
  const liveOverallBand = useMemo(() => {
    return calculateOverallBand({
      reading: liveReading.band,
      listening: liveListening.band,
      writing: calculatedWritingBand,
      speaking: parseFloat(speakingScore) || undefined
    });
  }, [liveReading.band, liveListening.band, calculatedWritingBand, speakingScore]);

  // Handle toggling manual override for Reading/Listening
  const handleToggleOverride = (module: 'reading' | 'listening', qId: string, markCorrect: boolean) => {
    setManualOverrides(prev => {
      const modOverrides = { ...prev[module] };
      const currentVal = modOverrides[qId];

      if (currentVal === markCorrect) {
        // If clicking same override again, reset to auto-mark
        delete modOverrides[qId];
      } else {
        modOverrides[qId] = markCorrect;
      }

      return {
        ...prev,
        [module]: modOverrides
      };
    });
  };

  const handleResetOverride = (module: 'reading' | 'listening', qId: string) => {
    setManualOverrides(prev => {
      const modOverrides = { ...prev[module] };
      delete modOverrides[qId];
      return { ...prev, [module]: modOverrides };
    });
  };

  // Examiner action: Save Moderation / Release Results
  const handleSaveModeration = (publishToStudent: boolean = false) => {
    const updatedScores = {
      reading: liveReading.band,
      listening: liveListening.band,
      writing: calculatedWritingBand,
      writingTask1: parseFloat(task1Score) || undefined,
      writingTask2: parseFloat(task2Score) || undefined,
      speaking: parseFloat(speakingScore) || undefined
    };

    const combinedWritingFeedback = [
      task1Feedback ? `[Task 1 Feedback]\n${task1Feedback}` : '',
      task2Feedback ? `[Task 2 Feedback]\n${task2Feedback}` : '',
      writingFeedback ? `[General Examiner Comments]\n${writingFeedback}` : ''
    ].filter(Boolean).join('\n\n');

    const updatePayload: Partial<ExamLog> = {
      scores: updatedScores,
      rawScores: {
        reading: liveReading.raw,
        listening: liveListening.raw
      },
      overallBand: liveOverallBand,
      manualOverrides,
      writingFeedback: combinedWritingFeedback,
      task1Feedback,
      task2Feedback,
      speakingFeedback,
      status: publishToStudent ? 'Graded' : 'Completed',
      isPublished: publishToStudent,
      gradedAt: new Date().toISOString()
    };

    if (onSaveEvaluation) {
      onSaveEvaluation(updatePayload);
    } else if (onUpdateWriting && calculatedWritingBand !== undefined) {
      onUpdateWriting(calculatedWritingBand, combinedWritingFeedback);
    }

    setSaveSuccess(publishToStudent ? 'Official Results Released to Candidate!' : 'Evaluations and Overrides Saved Successfully!');
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const isPublished = log.isPublished || log.status === 'Graded';

  // Candidate Access Guard: If not published and student is viewing
  if (!isOrg && !isPublished) {
    return (
      <div className="panel p-10 max-w-xl mx-auto text-center space-y-6 my-12">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="font-display text-[26px] text-[var(--ink)] m-0">Evaluation in Progress</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-[3px] p-5 text-xs text-amber-950 text-left space-y-3">
          <div className="font-bold text-[13px] text-amber-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Center Examiner Review Active</span>
          </div>
          <p className="leading-relaxed text-amber-800">
            Your examination was submitted on <strong>{new Date(log.completedAt).toLocaleDateString()}</strong>. 
            The center examiners are currently evaluating your writing responses and reviewing all answers.
          </p>
          <p className="text-amber-800 font-medium">
            Your verified official band score, detailed question breakdown, and examiner feedback will appear here once released by your center.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 font-sans">
      
      {/* EXAMINER ACTION HEADER & NOTIFICATION */}
      {isOrg && (
        <div className="panel bg-[#002A25] text-white p-6 border-2 border-emerald-700 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-[2px]">
                  Examiner Grading & Moderation Console
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-[2px] ${isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'}`}>
                  {isPublished ? 'Status: Released to Candidate' : 'Status: Under Center Review'}
                </span>
              </div>
              <h2 className="text-lg font-bold mt-1 text-white">
                Candidate: {log.studentName} ({log.studentId})
              </h2>
              <p className="text-xs text-emerald-200">
                You can review student answers, override automated Reading/Listening marks, grade Writing tasks with full prompts, and release the official result.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => handleSaveModeration(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-[3px] border border-slate-600 transition-colors shadow-sm"
              >
                Save Evaluation Draft
              </button>
              <button
                onClick={() => handleSaveModeration(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-[3px] transition-colors shadow-lg flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{isPublished ? 'Update & Re-Publish Results' : 'Approve & Release Official Results'}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-400 text-slate-950 rounded-[3px] text-xs font-bold flex items-center space-x-2 shadow-md animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-950" />
              <span>{saveSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* SCORES SUMMARY PANEL */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--line-soft)] pb-3">
          <div>
            <h2 className="font-display text-[20px] text-[var(--ink)] m-0">IELTS Official Band Summary</h2>
            <p className="text-xs text-[var(--ink-soft)] mt-0.5">
              {isOrg ? 'Live computed band scores reflecting all examiner overrides & writing evaluation.' : 'Official released scores verified by your test center.'}
            </p>
          </div>
          {isPublished && (
            <span className="px-2.5 py-1 bg-[var(--forest)]/10 text-[var(--forest)] text-xs font-bold rounded-[2px] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Verified & Released
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Reading */}
          <div className="bg-[var(--paper-card)] p-4 rounded-[3px] border border-[var(--line)] text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1">Reading Band</div>
            <div className="text-[26px] font-display text-[var(--ink)]">
              {liveReading.band !== undefined ? liveReading.band.toFixed(1) : '-'}
            </div>
            {log.modulesTaken.includes('reading') && (
              <div className="text-[11px] font-mono text-[var(--ink-soft)] mt-1">
                Raw: {liveReading.raw} / {readingQuestions.length || 40}
              </div>
            )}
          </div>

          {/* Listening */}
          <div className="bg-[var(--paper-card)] p-4 rounded-[3px] border border-[var(--line)] text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1">Listening Band</div>
            <div className="text-[26px] font-display text-[var(--ink)]">
              {liveListening.band !== undefined ? liveListening.band.toFixed(1) : '-'}
            </div>
            {log.modulesTaken.includes('listening') && (
              <div className="text-[11px] font-mono text-[var(--ink-soft)] mt-1">
                Raw: {liveListening.raw} / {listeningQuestions.length || 40}
              </div>
            )}
          </div>

          {/* Writing */}
          <div className="bg-[var(--paper-card)] p-4 rounded-[3px] border border-[var(--line)] text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1">Writing Band</div>
            <div className="text-[26px] font-display text-[var(--ink)]">
              {calculatedWritingBand !== undefined ? calculatedWritingBand.toFixed(1) : (
                <span className="text-sm font-sans text-amber-700 font-bold">Pending</span>
              )}
            </div>
            {task1Score && task2Score && (
              <div className="text-[11px] font-mono text-[var(--ink-soft)] mt-1">
                T1: {task1Score} | T2: {task2Score}
              </div>
            )}
          </div>

          {/* Overall */}
          <div className="bg-[var(--forest)]/5 p-4 rounded-[3px] border-2 border-[var(--forest)]/30 text-center">
            <div className="text-[11px] font-bold uppercase text-[var(--forest)] mb-1">Overall Band</div>
            <div className="text-[28px] font-display text-[var(--forest)] font-bold">
              {liveOverallBand > 0 ? liveOverallBand.toFixed(1) : '-'}
            </div>
            <div className="text-[10px] font-bold uppercase text-[var(--forest)]/70 mt-1">
              Official IELTS Scale
            </div>
          </div>
        </div>
      </div>

      {/* 1. READING RESULTS WITH EXAMINER OVERRIDE */}
      {log.modulesTaken.includes('reading') && (
        <div className="panel p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex items-center justify-between">
            <div>
              <h3 className="font-display text-[18px] text-[var(--ink)] m-0">Reading Module Evaluation</h3>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                {isOrg ? 'Review student answers. Click "Mark Correct" or "Mark Incorrect" to overwrite automated scoring.' : 'Question breakdown and answer review.'}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--forest)] bg-[var(--forest)]/10 px-2.5 py-1 rounded-[2px]">
              Raw Score: {liveReading.raw} / {readingQuestions.length || 40} ({liveReading.band !== undefined ? `Band ${liveReading.band.toFixed(1)}` : ''})
            </span>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="audit-table w-full">
              <thead>
                <tr>
                  <th className="w-12 text-center">Q#</th>
                  <th>Question Prompt / Type</th>
                  <th>Student Answer</th>
                  <th>Correct Answer Key</th>
                  <th className="w-24 text-center">Judgement</th>
                  {isOrg && <th className="w-44 text-right">Examiner Action</th>}
                </tr>
              </thead>
              <tbody>
                {readingQuestions.map((q) => {
                  const { userAnswer, isEffectiveCorrect, isOverridden } = getQuestionStatus('reading', q);

                  return (
                    <tr key={q.id} className={isOverridden ? 'bg-amber-50/50' : undefined}>
                      <td className="font-mono text-xs font-bold text-center">{q.questionNumber}</td>
                      <td>
                        <div className="font-medium text-xs text-[var(--ink)]">{q.prompt || `Question ${q.questionNumber}`}</div>
                        <div className="text-[11px] text-[var(--ink-soft)] uppercase font-mono">{q.type.replace(/_/g, ' ')}</div>
                      </td>
                      <td>
                        <span className={`font-mono text-xs font-bold ${
                          isEffectiveCorrect ? 'text-emerald-700' : userAnswer ? 'text-red-700' : 'text-slate-400 italic'
                        }`}>
                          {userAnswer ? (Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer) : '(Blank)'}
                        </span>
                      </td>
                      <td className="font-mono text-xs font-medium text-[var(--forest)]">
                        {formatCorrectAnswerDisplay(q.correctAnswer)}
                      </td>

                      <td className="text-center">
                        <div className="inline-flex items-center space-x-1">
                          {isEffectiveCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 inline" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 inline" />
                          )}
                          {isOverridden && (
                            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1 rounded" title="Overridden by Examiner">
                              Edit
                            </span>
                          )}
                        </div>
                      </td>
                      {isOrg && (
                        <td className="text-right">
                          <div className="inline-flex items-center space-x-1">
                            {!isEffectiveCorrect ? (
                              <button
                                type="button"
                                onClick={() => handleToggleOverride('reading', q.id, true)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-[2px] text-[11px] font-bold transition-colors"
                                title="Override and mark candidate answer as Correct"
                              >
                                ✓ Mark Correct
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleOverride('reading', q.id, false)}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 rounded-[2px] text-[11px] font-bold transition-colors"
                                title="Override and mark candidate answer as Incorrect"
                              >
                                ✗ Mark Wrong
                              </button>
                            )}
                            {isOverridden && (
                              <button
                                type="button"
                                onClick={() => handleResetOverride('reading', q.id)}
                                className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-[2px]"
                                title="Reset to automated marking"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. LISTENING RESULTS WITH EXAMINER OVERRIDE */}
      {log.modulesTaken.includes('listening') && (
        <div className="panel p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex items-center justify-between">
            <div>
              <h3 className="font-display text-[18px] text-[var(--ink)] m-0">Listening Module Evaluation</h3>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                {isOrg ? 'Review listening answers and override mark correctness where appropriate.' : 'Question breakdown and answer review.'}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--forest)] bg-[var(--forest)]/10 px-2.5 py-1 rounded-[2px]">
              Raw Score: {liveListening.raw} / {listeningQuestions.length || 40} ({liveListening.band !== undefined ? `Band ${liveListening.band.toFixed(1)}` : ''})
            </span>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="audit-table w-full">
              <thead>
                <tr>
                  <th className="w-12 text-center">Q#</th>
                  <th>Question Prompt / Type</th>
                  <th>Student Answer</th>
                  <th>Correct Answer Key</th>
                  <th className="w-24 text-center">Judgement</th>
                  {isOrg && <th className="w-44 text-right">Examiner Action</th>}
                </tr>
              </thead>
              <tbody>
                {listeningQuestions.map((q) => {
                  const { userAnswer, isEffectiveCorrect, isOverridden } = getQuestionStatus('listening', q);

                  return (
                    <tr key={q.id} className={isOverridden ? 'bg-amber-50/50' : undefined}>
                      <td className="font-mono text-xs font-bold text-center">{q.questionNumber}</td>
                      <td>
                        <div className="font-medium text-xs text-[var(--ink)]">{q.prompt || `Question ${q.questionNumber}`}</div>
                        <div className="text-[11px] text-[var(--ink-soft)] uppercase font-mono">{q.type.replace(/_/g, ' ')}</div>
                      </td>
                      <td>
                        <span className={`font-mono text-xs font-bold ${
                          isEffectiveCorrect ? 'text-emerald-700' : userAnswer ? 'text-red-700' : 'text-slate-400 italic'
                        }`}>
                          {userAnswer ? (Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer) : '(Blank)'}
                        </span>
                      </td>
                      <td className="font-mono text-xs font-medium text-[var(--forest)]">
                        {formatCorrectAnswerDisplay(q.correctAnswer)}
                      </td>

                      <td className="text-center">
                        <div className="inline-flex items-center space-x-1">
                          {isEffectiveCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 inline" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 inline" />
                          )}
                          {isOverridden && (
                            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1 rounded" title="Overridden by Examiner">
                              Edit
                            </span>
                          )}
                        </div>
                      </td>
                      {isOrg && (
                        <td className="text-right">
                          <div className="inline-flex items-center space-x-1">
                            {!isEffectiveCorrect ? (
                              <button
                                type="button"
                                onClick={() => handleToggleOverride('listening', q.id, true)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-[2px] text-[11px] font-bold transition-colors"
                                title="Override and mark candidate answer as Correct"
                              >
                                ✓ Mark Correct
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleOverride('listening', q.id, false)}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 rounded-[2px] text-[11px] font-bold transition-colors"
                                title="Override and mark candidate answer as Incorrect"
                              >
                                ✗ Mark Wrong
                              </button>
                            )}
                            {isOverridden && (
                              <button
                                type="button"
                                onClick={() => handleResetOverride('listening', q.id)}
                                className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-[2px]"
                                title="Reset to automated marking"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. WRITING MODULE EVALUATION (QUESTIONS + RESPONSES + SCORING + FEEDBACK) */}
      {log.modulesTaken.includes('writing') && (
        <div className="panel p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex items-center justify-between">
            <div>
              <h3 className="font-display text-[18px] text-[var(--ink)] m-0">Writing Module Evaluation & Feedback</h3>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                Examiners review both prompts and candidate submissions to provide detailed band evaluation.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-[2px]">
                Writing Band: {calculatedWritingBand !== undefined ? calculatedWritingBand.toFixed(1) : 'Pending'}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-8">
            
            {/* Task 1 Section */}
            {test.writing?.map((task) => {
              const responseText = log.answers?.writing?.[task.id] || '';
              const wordCount = responseText.trim() ? responseText.trim().split(/\s+/).length : 0;
              const isTask1 = task.taskNumber === 1;

              return (
                <div key={task.id} className="border border-slate-300 rounded-[3px] bg-slate-50/40 p-5 space-y-4">
                  {/* Task Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                    <div>
                      <span className="text-[11px] uppercase font-mono font-bold text-[var(--brick)] bg-[var(--brick)]/10 px-2 py-0.5 rounded">
                        Task {task.taskNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{task.title}</h4>
                    </div>
                    <div className="text-xs font-mono text-slate-600">
                      Requirement: Minimum <strong>{task.minWords || (isTask1 ? 150 : 250)} words</strong> | Rec. Time: <strong>{task.recommendedTime || (isTask1 ? 20 : 40)} mins</strong>
                    </div>
                  </div>

                  {/* Task Prompt & Question Context */}
                  <div className="bg-white p-4 rounded-[2px] border border-slate-200 space-y-3">
                    <div className="text-[11px] uppercase font-bold text-slate-500 font-mono flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Task Question Prompt</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
                      {task.prompt}
                    </p>

                    {task.diagramUrl && (
                      <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded text-center">
                        <img src={task.diagramUrl} alt="Writing Reference" className="max-h-64 mx-auto object-contain rounded" />
                      </div>
                    )}
                  </div>

                  {/* Student Response */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-700">Candidate Submitted Text:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        wordCount >= (task.minWords || (isTask1 ? 150 : 250))
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {wordCount} words ({wordCount >= (task.minWords || (isTask1 ? 150 : 250)) ? 'Meets Requirement' : 'Under Minimum Words'})
                      </span>
                    </div>

                    <div className="bg-white p-4 border border-slate-300 rounded-[2px] text-xs font-mono leading-relaxed whitespace-pre-wrap text-slate-900 shadow-2xs">
                      {responseText || <span className="text-slate-400 italic">No response submitted by candidate for this task.</span>}
                    </div>
                  </div>

                  {/* Task-Specific Feedback & Score Input for Examiner */}
                  {isOrg && (
                    <div className="bg-emerald-50/50 p-4 border border-emerald-200 rounded-[2px] space-y-3 mt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <label className="text-xs font-bold text-emerald-950 flex items-center space-x-1">
                          <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Task {task.taskNumber} Band Score (0.0 – 9.0)</span>
                        </label>
                        <select
                          value={isTask1 ? task1Score : task2Score}
                          onChange={(e) => isTask1 ? setTask1Score(e.target.value) : setTask2Score(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-emerald-400 rounded text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="">Select Band Score...</option>
                          {[9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.0].map(s => (
                            <option key={s} value={s.toFixed(1)}>Band {s.toFixed(1)}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                          Task {task.taskNumber} Examiner Feedback & Improvement Notes
                        </label>
                        <textarea
                          rows={3}
                          value={isTask1 ? task1Feedback : task2Feedback}
                          onChange={(e) => isTask1 ? setTask1Feedback(e.target.value) : setTask2Feedback(e.target.value)}
                          placeholder={`Write specific commentary on Task ${task.taskNumber} (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy)...`}
                          className="w-full p-2.5 bg-white border border-emerald-300 rounded text-xs text-slate-900 focus:outline-none focus:border-emerald-600 leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* Student View of Task-Specific Feedback */}
                  {!isOrg && (isTask1 ? log.task1Feedback : log.task2Feedback) && (
                    <div className="bg-emerald-50/60 p-4 border border-emerald-200 rounded-[2px] space-y-1">
                      <div className="text-xs font-bold text-emerald-900">Examiner Feedback for Task {task.taskNumber}:</div>
                      <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-wrap">
                        {isTask1 ? log.task1Feedback : log.task2Feedback}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* General Examiner Feedback */}
            {isOrg ? (
              <div className="bg-slate-100 p-5 border border-slate-300 rounded-[2px] space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>General Examiner Summary & Overall Band Feedback</span>
                </div>
                <textarea
                  rows={4}
                  value={writingFeedback}
                  onChange={(e) => setWritingFeedback(e.target.value)}
                  placeholder="Provide overall summary comments for the candidate across their writing performance..."
                  className="w-full p-3 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-800 leading-relaxed font-sans"
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveModeration(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded transition-colors shadow-sm"
                  >
                    Save All Writing Scores & Feedback
                  </button>
                </div>
              </div>
            ) : log.writingFeedback ? (
              <div className="bg-[var(--paper-card)] p-5 border border-[var(--line)] rounded-[2px] space-y-2">
                <h4 className="font-bold text-xs text-[var(--ink)] uppercase tracking-wider font-mono">
                  General Examiner Assessment
                </h4>
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed whitespace-pre-wrap font-serif">
                  {log.writingFeedback}
                </p>
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* FINAL SAVE / RELEASE BAR FOR EXAMINERS */}
      {isOrg && (
        <div className="p-6 bg-slate-900 text-white rounded-[3px] flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700 shadow-xl">
          <div>
            <div className="text-sm font-bold text-white">Final Evaluation Summary</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Reading: {liveReading.band !== undefined ? liveReading.band.toFixed(1) : '-'} | 
              Listening: {liveListening.band !== undefined ? liveListening.band.toFixed(1) : '-'} | 
              Writing: {calculatedWritingBand !== undefined ? calculatedWritingBand.toFixed(1) : 'Pending'} | 
              Overall Band: <strong>{liveOverallBand > 0 ? liveOverallBand.toFixed(1) : '-'}</strong>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => handleSaveModeration(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded border border-slate-600 transition-colors"
            >
              Save Evaluation Draft
            </button>
            <button
              onClick={() => handleSaveModeration(true)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded transition-colors shadow-lg flex items-center justify-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{isPublished ? 'Update & Re-Publish Results' : 'Approve & Release Official Results'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
