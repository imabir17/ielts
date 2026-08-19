'use client';

import React, { useState } from 'react';
import { WritingTask, WritingAssessment, WritingTaskFeedback } from '@/lib/mock-data';
import { Award, CheckCircle2, FileText, AlertCircle, Sparkles, BookOpen, Layers, Check } from 'lucide-react';

interface WritingGradingFormProps {
  tasks: WritingTask[];
  studentAnswers: Record<string, string>;
  initialAssessment?: WritingAssessment;
  onSave: (assessment: WritingAssessment) => void;
  onCancel?: () => void;
  evaluatorRole?: string;
}

const BAND_OPTIONS = [
  '9.0', '8.5', '8.0', '7.5', '7.0', '6.5', '6.0', '5.5', '5.0', '4.5', '4.0', '3.5', '3.0', '2.5', '2.0', '1.0', '0.0'
];

export function WritingGradingForm({
  tasks,
  studentAnswers,
  initialAssessment,
  onSave,
  onCancel,
  evaluatorRole = 'Examiner'
}: WritingGradingFormProps) {
  const [activeTaskTab, setActiveTaskTab] = useState<number>(0);

  // Form State for Task 1
  const [t1TA, setT1TA] = useState<string>(initialAssessment?.task1?.taskAchievementScore?.toFixed(1) || '6.0');
  const [t1TAFeedback, setT1TAFeedback] = useState<string>(initialAssessment?.task1?.taskAchievementFeedback || '');
  const [t1CC, setT1CC] = useState<string>(initialAssessment?.task1?.coherenceScore?.toFixed(1) || '6.0');
  const [t1CCFeedback, setT1CCFeedback] = useState<string>(initialAssessment?.task1?.coherenceFeedback || '');
  const [t1LR, setT1LR] = useState<string>(initialAssessment?.task1?.lexicalScore?.toFixed(1) || '6.0');
  const [t1LRFeedback, setT1LRFeedback] = useState<string>(initialAssessment?.task1?.lexicalFeedback || '');
  const [t1GRA, setT1GRA] = useState<string>(initialAssessment?.task1?.grammarScore?.toFixed(1) || '6.0');
  const [t1GRAFeedback, setT1GRAFeedback] = useState<string>(initialAssessment?.task1?.grammarFeedback || '');

  // Form State for Task 2
  const [t2TR, setT2TR] = useState<string>(initialAssessment?.task2?.taskAchievementScore?.toFixed(1) || '6.0');
  const [t2TRFeedback, setT2TRFeedback] = useState<string>(initialAssessment?.task2?.taskAchievementFeedback || '');
  const [t2CC, setT2CC] = useState<string>(initialAssessment?.task2?.coherenceScore?.toFixed(1) || '6.0');
  const [t2CCFeedback, setT2CCFeedback] = useState<string>(initialAssessment?.task2?.coherenceFeedback || '');
  const [t2LR, setT2LR] = useState<string>(initialAssessment?.task2?.lexicalScore?.toFixed(1) || '6.0');
  const [t2LRFeedback, setT2LRFeedback] = useState<string>(initialAssessment?.task2?.lexicalFeedback || '');
  const [t2GRA, setT2GRA] = useState<string>(initialAssessment?.task2?.grammarScore?.toFixed(1) || '6.0');
  const [t2GRAFeedback, setT2GRAFeedback] = useState<string>(initialAssessment?.task2?.grammarFeedback || '');

  // General Examiner Notes
  const [generalNotes, setGeneralNotes] = useState<string>(initialAssessment?.generalNotes || '');

  const currentTask = tasks[activeTaskTab];
  const essay = currentTask ? studentAnswers[currentTask.id] || '' : '';
  const currentWordCount = essay.trim() ? essay.trim().split(/\s+/).filter(Boolean).length : 0;

  // Calculate task band averages
  const calcTask1Band = () => {
    const sum = parseFloat(t1TA) + parseFloat(t1CC) + parseFloat(t1LR) + parseFloat(t1GRA);
    return Math.round((sum / 4) * 2) / 2;
  };

  const calcTask2Band = () => {
    const sum = parseFloat(t2TR) + parseFloat(t2CC) + parseFloat(t2LR) + parseFloat(t2GRA);
    return Math.round((sum / 4) * 2) / 2;
  };

  // Official IELTS Writing overall weighting: Task 2 is double weighted (Task 1: 1/3, Task 2: 2/3)
  const calcOverallWritingBand = () => {
    const hasT1 = tasks.some(t => t.taskNumber === 1);
    const hasT2 = tasks.some(t => t.taskNumber === 2);

    if (hasT1 && hasT2) {
      const t1 = calcTask1Band();
      const t2 = calcTask2Band();
      const raw = (t1 + 2 * t2) / 3;
      return Math.round(raw * 2) / 2;
    } else if (hasT2) {
      return calcTask2Band();
    } else if (hasT1) {
      return calcTask1Band();
    }
    return 6.0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const t1Obj: WritingTaskFeedback = {
      taskNumber: 1,
      taskAchievementScore: parseFloat(t1TA),
      taskAchievementFeedback: t1TAFeedback,
      coherenceScore: parseFloat(t1CC),
      coherenceFeedback: t1CCFeedback,
      lexicalScore: parseFloat(t1LR),
      lexicalFeedback: t1LRFeedback,
      grammarScore: parseFloat(t1GRA),
      grammarFeedback: t1GRAFeedback,
      overallTaskBand: calcTask1Band(),
      wordCount: tasks.find(t => t.taskNumber === 1) ? (studentAnswers[tasks.find(t => t.taskNumber === 1)!.id] || '').trim().split(/\s+/).filter(Boolean).length : 0
    };

    const t2Obj: WritingTaskFeedback = {
      taskNumber: 2,
      taskAchievementScore: parseFloat(t2TR),
      taskAchievementFeedback: t2TRFeedback,
      coherenceScore: parseFloat(t2CC),
      coherenceFeedback: t2CCFeedback,
      lexicalScore: parseFloat(t2LR),
      lexicalFeedback: t2LRFeedback,
      grammarScore: parseFloat(t2GRA),
      grammarFeedback: t2GRAFeedback,
      overallTaskBand: calcTask2Band(),
      wordCount: tasks.find(t => t.taskNumber === 2) ? (studentAnswers[tasks.find(t => t.taskNumber === 2)!.id] || '').trim().split(/\s+/).filter(Boolean).length : 0
    };

    const finalAssessment: WritingAssessment = {
      task1: t1Obj,
      task2: t2Obj,
      overallWritingBand: calcOverallWritingBand(),
      generalNotes,
      gradedAt: new Date().toISOString(),
      gradedBy: evaluatorRole
    };

    onSave(finalAssessment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner: Calculated Overall Band Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-[#003B35] to-[#005C53] text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-mono uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Official IELTS 4-Criteria Rubric Assessment</span>
          </div>
          <h2 className="text-xl font-bold mt-1">Writing Module Evaluation</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Grade Task 1 and Task 2 with targeted feedback across all four band descriptors.
          </p>
        </div>

      </div>

      {/* Task Selector Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {tasks.map((t, idx) => {
          const taskEssay = studentAnswers[t.id] || '';
          const count = taskEssay.trim() ? taskEssay.trim().split(/\s+/).filter(Boolean).length : 0;
          const band = t.taskNumber === 1 ? calcTask1Band() : calcTask2Band();

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTaskTab(idx)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2.5 ${
                activeTaskTab === idx
                  ? 'bg-[#005C53] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>Task {t.taskNumber} ({t.taskNumber === 1 ? 'Report' : 'Essay'})</span>
              <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                activeTaskTab === idx ? 'bg-emerald-900/80 text-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {count} words
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Grid: Left = Student Submission & Prompt | Right = 4-Criteria Rubric Form */}
      {currentTask && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Student Response & Official Prompt */}
          <div className="lg:col-span-5 space-y-4">
            {/* Prompt Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#005C53]" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Task {currentTask.taskNumber} Prompt
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  Min {currentTask.minWords} words
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {currentTask.prompt}
              </p>
              {currentTask.diagramUrl && (
                <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <img src={currentTask.diagramUrl} alt="Task Diagram" className="max-w-full h-auto mx-auto rounded-lg" />
                </div>
              )}
            </div>

            {/* Student Response */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Student's Written Response
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  currentWordCount >= currentTask.minWords
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {currentWordCount} words {currentWordCount >= currentTask.minWords ? '✓' : `(Target: ${currentTask.minWords})`}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed whitespace-pre-wrap max-h-[480px] overflow-y-auto font-sans">
                {essay || <span className="text-slate-400 italic">No response submitted for this task.</span>}
              </div>
            </div>
          </div>

          {/* RIGHT: 4-Criteria Assessment Rubric */}
          <div className="lg:col-span-7 space-y-4">
            {/* Criteria 1: Task Achievement (Task 1) / Task Response (Task 2) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    1. {currentTask.taskNumber === 1 ? 'Task Achievement (TA)' : 'Task Response (TR)'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Did the student answer all parts of the prompt? Did they write enough words and present clear main ideas/overview?
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-bold text-slate-700">Band:</span>
                  <select
                    value={currentTask.taskNumber === 1 ? t1TA : t2TR}
                    onChange={(e) => currentTask.taskNumber === 1 ? setT1TA(e.target.value) : setT2TR(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white text-[#005C53] focus:ring-2 focus:ring-[#005C53]"
                  >
                    {BAND_OPTIONS.map(b => (
                      <option key={b} value={b}>Band {b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                rows={2}
                value={currentTask.taskNumber === 1 ? t1TAFeedback : t2TRFeedback}
                onChange={(e) => currentTask.taskNumber === 1 ? setT1TAFeedback(e.target.value) : setT2TRFeedback(e.target.value)}
                placeholder={`Provide specific feedback on ${currentTask.taskNumber === 1 ? 'Task Achievement' : 'Task Response'} (e.g. overview quality, key data coverage, position clarity)...`}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005C53] resize-none"
              />
            </div>

            {/* Criteria 2: Coherence and Cohesion */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    2. Coherence and Cohesion (CC)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Are ideas organized well into logical paragraphs? Did the student use linking words, referencing, and transition devices correctly?
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-bold text-slate-700">Band:</span>
                  <select
                    value={currentTask.taskNumber === 1 ? t1CC : t2CC}
                    onChange={(e) => currentTask.taskNumber === 1 ? setT1CC(e.target.value) : setT2CC(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white text-[#005C53] focus:ring-2 focus:ring-[#005C53]"
                  >
                    {BAND_OPTIONS.map(b => (
                      <option key={b} value={b}>Band {b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                rows={2}
                value={currentTask.taskNumber === 1 ? t1CCFeedback : t2CCFeedback}
                onChange={(e) => currentTask.taskNumber === 1 ? setT1CCFeedback(e.target.value) : setT2CCFeedback(e.target.value)}
                placeholder="Provide feedback on paragraph structure, flow, connectors, and cohesion..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005C53] resize-none"
              />
            </div>

            {/* Criteria 3: Lexical Resource */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    3. Lexical Resource (LR)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Did the student use a wide range of academic vocabulary with precise word choice, collocations, and correct spelling?
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-bold text-slate-700">Band:</span>
                  <select
                    value={currentTask.taskNumber === 1 ? t1LR : t2LR}
                    onChange={(e) => currentTask.taskNumber === 1 ? setT1LR(e.target.value) : setT2LR(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white text-[#005C53] focus:ring-2 focus:ring-[#005C53]"
                  >
                    {BAND_OPTIONS.map(b => (
                      <option key={b} value={b}>Band {b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                rows={2}
                value={currentTask.taskNumber === 1 ? t1LRFeedback : t2LRFeedback}
                onChange={(e) => currentTask.taskNumber === 1 ? setT1LRFeedback(e.target.value) : setT2LRFeedback(e.target.value)}
                placeholder="Provide feedback on vocabulary range, appropriateness, spelling, and collocations..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005C53] resize-none"
              />
            </div>

            {/* Criteria 4: Grammatical Range and Accuracy */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    4. Grammatical Range and Accuracy (GRA)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Did the student use a mix of simple and complex sentence structures? Are grammar, tenses, and punctuation accurate?
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-bold text-slate-700">Band:</span>
                  <select
                    value={currentTask.taskNumber === 1 ? t1GRA : t2GRA}
                    onChange={(e) => currentTask.taskNumber === 1 ? setT1GRA(e.target.value) : setT2GRA(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white text-[#005C53] focus:ring-2 focus:ring-[#005C53]"
                  >
                    {BAND_OPTIONS.map(b => (
                      <option key={b} value={b}>Band {b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                rows={2}
                value={currentTask.taskNumber === 1 ? t1GRAFeedback : t2GRAFeedback}
                onChange={(e) => currentTask.taskNumber === 1 ? setT1GRAFeedback(e.target.value) : setT2GRAFeedback(e.target.value)}
                placeholder="Provide feedback on sentence variety (complex/compound), tense accuracy, and punctuation..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005C53] resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* General Examiner Summary Notes */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h4 className="font-extrabold text-sm text-slate-900">
          General Examiner Summary & Next Steps for Candidate
        </h4>
        <textarea
          rows={3}
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Write actionable general advice, strengths, and areas of priority for the student to increase their writing band..."
          className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005C53] resize-none leading-relaxed"
        />
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-8 py-2.5 rounded-xl bg-[#005C53] hover:bg-[#004740] text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save & Publish Evaluation (Band {calcOverallWritingBand().toFixed(1)})</span>
        </button>
      </div>
    </form>
  );
}
