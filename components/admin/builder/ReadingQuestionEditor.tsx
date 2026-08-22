'use client';

import React, { useState } from 'react';
import { QuestionSection, Question, QuestionType, DiagramPin, TableCell, FlowStep } from '@/lib/mock-data';
import { ImageUploader } from './ImageUploader';
import { DiagramPinTool } from './DiagramPinTool';
import {
  Plus, Trash2, ArrowUp, ArrowDown, CheckCircle, AlertCircle, HelpCircle,
  X, Info, FileCode, Upload, Sparkles, Move, Table, Layers, Sliders, Type, ListPlus, CheckSquare, ChevronUp, ChevronDown, AlignLeft, Headphones, BookOpen
} from 'lucide-react';

interface ReadingQuestionEditorProps {
  section: QuestionSection;
  onChange: (updated: QuestionSection) => void;
}

const READING_QUESTION_TYPE_SPECS: { type: QuestionType; label: string; mechanism: string; category: string }[] = [
  { type: 'multiple_choice_single', label: '1. Multiple Choice (Single)', mechanism: 'Radio buttons for single answer selection.', category: 'Choice' },
  { type: 'multiple_choice_multi', label: '1. Multiple Choice (Multiple)', mechanism: 'Checkboxes for multi-answer selection with limit restriction.', category: 'Choice' },
  { type: 'true_false_ng', label: '2. True/False/Not Given', mechanism: 'Evaluates facts/information from the passage.', category: 'Boolean' },
  { type: 'yes_no_ng', label: '3. Yes/No/Not Given', mechanism: 'Evaluates writer claims/views from the passage.', category: 'Boolean' },
  { type: 'matching_information', label: '4. Matching Information', mechanism: 'Locate which paragraph contains specific information.', category: 'Matching' },
  { type: 'matching_headings', label: '5. Matching Headings', mechanism: 'Select the correct heading for paragraphs.', category: 'Matching' },
  { type: 'matching_features', label: '6. Matching Features', mechanism: 'Match statements to features (e.g., researchers/dates).', category: 'Matching' },
  { type: 'matching_sentence_endings', label: '7. Matching Sentence Endings', mechanism: 'Complete a sentence by matching its ending.', category: 'Matching' },
  { type: 'sentence_completion', label: '8. Sentence Completion', mechanism: 'Fill in gaps in sentences.', category: 'Completion' },
  { type: 'summary_completion', label: '9. Summary Completion', mechanism: 'Fill in gaps in a summary paragraph.', category: 'Completion' },
  { type: 'note_completion', label: '10. Note Completion', mechanism: 'Fill in gaps in indented notes.', category: 'Completion' },
  { type: 'table_completion', label: '11. Table Completion', mechanism: 'Fill in gaps within a table grid.', category: 'Completion' },
  { type: 'flow_chart_completion', label: '12. Flow-chart Completion', mechanism: 'Fill in gaps in a sequence of steps.', category: 'Completion' },
  { type: 'diagram_labeling', label: '13. Diagram Labelling', mechanism: 'Label parts of a diagram or map.', category: 'Diagram' },
  { type: 'short_answer', label: '14. Short-Answer Questions', mechanism: 'Provide a direct short text answer to a prompt.', category: 'Completion' },
];

export function ReadingQuestionEditor({ section, onChange }: ReadingQuestionEditorProps) {
  const spec = READING_QUESTION_TYPE_SPECS.find(s => s.type === section.type) || READING_QUESTION_TYPE_SPECS[0];

  const updateSection = (updates: Partial<QuestionSection>) => onChange({ ...section, ...updates });

  const updateQuestion = (qIdx: number, updates: Partial<Question>) => {
    const q = [...section.questions];
    q[qIdx] = { ...q[qIdx], ...updates };
    updateSection({ questions: q });
  };

  const addQuestion = (defaultValues: Partial<Question> = {}) => {
    const newQ: Question = {
      id: `q-${section.id}-${Date.now()}`,
      sectionId: section.id,
      type: section.type,
      prompt: '',
      correctAnswer: '',
      ...defaultValues
    };
    updateSection({ questions: [...section.questions, newQ] });
  };

  const removeQuestion = (qIdx: number) => {
    updateSection({ questions: section.questions.filter((_, idx) => idx !== qIdx) });
  };

  const renderSectionWordLimit = () => (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 mb-4">
      <label className="block text-xs font-bold text-slate-800">
        Section Word Limit
      </label>
      <input
        type="text"
        value={section.wordLimit || ''}
        onChange={(e) => updateSection({ wordLimit: e.target.value })}
        placeholder="e.g. NO MORE THAN TWO WORDS"
        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#005C53]"
      />
    </div>
  );

  const renderSpecifics = () => {
    switch (section.type) {
      case 'multiple_choice_single': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Selection Mode</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-[#005C53] text-white"
                  >
                    Single Answer
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSection({
                      type: 'multiple_choice_multi',
                      isMultiSelect: true,
                      requiredSelectionCount: 2,
                      questions: Array.from({ length: 2 }, (_, i) => ({
                        id: `q-${section.id}-${Date.now()}-${i}`,
                        sectionId: section.id,
                        type: 'multiple_choice_multi' as const,
                        prompt: '',
                        correctAnswer: ''
                      })),
                      wordBankOptions: section.wordBankOptions?.length ? section.wordBankOptions : ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']
                    })}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700"
                  >
                    Multiple Answers
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Questions ({section.questions.length})</h4>
                <button
                  onClick={() => addQuestion({ options: ['Option A', 'Option B'] })}
                  className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Question
                </button>
              </div>
              
              {section.questions.map((q, qIdx) => {
                const qOptions = q.options || [];
                return (
                  <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-lg">Q{q.questionNumber || (qIdx + 1)}</span>
                      <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                      placeholder="Question text..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                    />
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500">Options</label>
                      {qOptions.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            checked={q.correctAnswer === opt}
                            onChange={() => updateQuestion(qIdx, { correctAnswer: opt })}
                            className="w-4 h-4 text-[#005C53]"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...qOptions];
                              const oldVal = newOpts[oIdx];
                              newOpts[oIdx] = e.target.value;
                              updateQuestion(qIdx, { options: newOpts, correctAnswer: q.correctAnswer === oldVal ? e.target.value : q.correctAnswer });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                          <button onClick={() => {
                            updateQuestion(qIdx, { options: qOptions.filter((_, idx) => idx !== oIdx) });
                          }} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => updateQuestion(qIdx, { options: [...qOptions, `Option ${qOptions.length + 1}`] })} className="text-xs font-bold text-[#005C53] hover:underline mt-1">+ Add Option</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'multiple_choice_multi': {
        const requiredCount = section.requiredSelectionCount ?? 2;
        const opts = section.wordBankOptions || [];
        const correctAnswers = section.questions.slice(0, requiredCount).map(q => q.correctAnswer).filter(Boolean) as string[];

        return (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Selection Mode</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => updateSection({ type: 'multiple_choice_single', isMultiSelect: false })}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700"
                  >
                    Single Answer
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-[#005C53] text-white"
                  >
                    Multiple Answers
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">How many options must the user choose?</label>
                <input
                  type="number"
                  min={1}
                  value={requiredCount}
                  onChange={(e) => {
                    const newCount = Math.max(1, Number(e.target.value));
                    // Build exactly newCount fresh placeholder questions,
                    // preserving existing correctAnswers where they fit.
                    const existingCorrect = section.questions.map(q => q.correctAnswer);
                    const newQuestions = Array.from({ length: newCount }, (_, i) => ({
                      id: section.questions[i]?.id ?? `q-${section.id}-${Date.now()}-${i}`,
                      sectionId: section.id,
                      type: section.type,
                      prompt: '',
                      correctAnswer: existingCorrect[i] ?? ''
                    }));
                    updateSection({ requiredSelectionCount: newCount, questions: newQuestions });
                  }}
                  className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">This will allocate {requiredCount} question numbers and {requiredCount} marks for this section.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Shared Options List</h4>
              <p className="text-xs text-slate-500">
                Add the available options here. Check up to <strong>{requiredCount}</strong> as correct answers.
              </p>

              {/* Correct answers badge */}
              {(section.multiCorrectAnswers || []).length > 0 && (
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  ✓ {(section.multiCorrectAnswers || []).length} of {requiredCount} correct answers selected
                </div>
              )}

              <div className="space-y-2">
                {opts.map((opt, oIdx) => {
                  const isCorrect = (section.multiCorrectAnswers || []).includes(opt);
                  const atLimit = (section.multiCorrectAnswers || []).length >= requiredCount && !isCorrect;
                  return (
                    <div key={oIdx} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isCorrect}
                        disabled={atLimit}
                        onChange={(e) => {
                          const current = section.multiCorrectAnswers || [];
                          const updated = e.target.checked
                            ? current.length < requiredCount ? [...current, opt] : current
                            : current.filter(a => a !== opt);
                          updateSection({ multiCorrectAnswers: updated });
                        }}
                        className="w-4 h-4 text-[#005C53] disabled:opacity-40"
                      />
                      <span className="font-bold text-xs text-slate-500 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...opts];
                          const oldVal = newOpts[oIdx];
                          newOpts[oIdx] = e.target.value;
                          // Keep multiCorrectAnswers in sync if this option was correct
                          const updatedCorrect = (section.multiCorrectAnswers || []).map(a => a === oldVal ? e.target.value : a);
                          updateSection({ wordBankOptions: newOpts, multiCorrectAnswers: updatedCorrect });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <button onClick={() => {
                        const newOpts = opts.filter((_, idx) => idx !== oIdx);
                        const updatedCorrect = (section.multiCorrectAnswers || []).filter(a => a !== opt);
                        updateSection({ wordBankOptions: newOpts, multiCorrectAnswers: updatedCorrect });
                      }} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  );
                })}
                <button onClick={() => updateSection({ wordBankOptions: [...opts, `Option ${opts.length + 1}`] })} className="text-xs font-bold text-[#005C53] hover:underline mt-1">+ Add Option</button>
              </div>
            </div>
          </div>
        );
      }

      case 'true_false_ng':
      case 'yes_no_ng': {
        const options = section.type === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Statements ({section.questions.length})</h4>
              <button
                onClick={() => addQuestion()}
                className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Statement
              </button>
            </div>
            {section.questions.map((q, qIdx) => (
              <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-lg">Q{q.questionNumber || (qIdx + 1)}</span>
                  <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
                <input
                  type="text"
                  value={q.prompt}
                  onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                  placeholder="Statement text..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                />
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Correct Key</label>
                  <div className="flex space-x-2">
                    {options.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateQuestion(qIdx, { correctAnswer: val })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          q.correctAnswer === val ? 'bg-[#005C53] text-white' : 'bg-slate-50 border border-slate-200 text-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'matching_headings': {
        const paragraphsPool: string[] = section.paragraphsPool || [];
        return (
          <div className="space-y-4">
            {/* Paragraphs Pool */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">List of Paragraphs (dropdown options)</label>
                <button
                  type="button"
                  onClick={() => updateSection({ usedOnceOnly: !section.usedOnceOnly })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${section.usedOnceOnly ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 text-slate-700'}`}
                >
                  {section.usedOnceOnly ? 'Each Paragraph Used Once' : 'Paragraphs Reusable'}
                </button>
              </div>
              <textarea
                rows={4}
                placeholder={"Enter paragraph labels (one per line)...\nParagraph A\nParagraph B\nParagraph C\nNot in passage"}
                value={paragraphsPool.join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  updateSection({ paragraphsPool: lines });
                }}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#005C53]"
              />
              <p className="text-[10px] text-slate-400">Students will see these as dropdown options for each heading.</p>
            </div>

            {/* Headings list – one question per heading */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Headings ({section.questions.length})</h4>
                <button onClick={() => addQuestion()} className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl">
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Heading
                </button>
              </div>
              {section.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex items-start space-x-3">
                  <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-lg mt-1">Q{q.questionNumber || (qIdx + 1)}</span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                      placeholder="Heading text (e.g. The rise of digital agriculture)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                    <select
                      value={q.correctAnswer as string}
                      onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                    >
                      <option value="">Select Correct Paragraph...</option>
                      {paragraphsPool.filter(Boolean).map((p, pIdx) => (
                        <option key={pIdx} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg mt-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'matching_features':
      case 'matching_sentence_endings': {
        const isFeatures = section.type === 'matching_features';
        const poolName = isFeatures ? 'featuresPool' : 'sentenceEndingsPool';
        const pool = (section as any)[poolName] || [];
        return (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Shared {isFeatures ? 'Features' : 'Sentence Endings'} Pool</label>
                <button
                  type="button"
                  onClick={() => updateSection({ usedOnceOnly: !section.usedOnceOnly })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${section.usedOnceOnly ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 text-slate-700'}`}
                >
                  {section.usedOnceOnly ? 'Used Once Only ON' : 'Used Once Only OFF'}
                </button>
              </div>
              <textarea
                rows={3}
                placeholder={isFeatures ? "Enter features (one per line)...&#10;A. Joseph Priestley&#10;B. Claude Shannon" : "Enter sentence endings (one per line)...&#10;A. are unpredictable&#10;B. harbor roughly 25% of all marine species"}
                value={pool.map((f: any) => f.text).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(Boolean);
                  const newPool = lines.map((text, idx) => ({ id: `p-${idx}`, text }));
                  updateSection({ [poolName]: newPool });
                }}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#005C53]"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Statements to Match ({section.questions.length})</h4>
                <button onClick={() => addQuestion()} className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl">
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Statement
                </button>
              </div>
              {section.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex items-start space-x-3">
                  <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-lg mt-1">Q{q.questionNumber || (qIdx + 1)}</span>
                  <div className="flex-1 space-y-2">
                    <input type="text" value={q.prompt} onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })} placeholder="Statement text..." className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                    <select value={q.correctAnswer as string} onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50">
                      <option value="">Select Correct Match...</option>
                      {pool.map((opt: any, oIdx: number) => (
                        <option key={oIdx} value={`${String.fromCharCode(65 + oIdx)}. ${opt.text}`}>{String.fromCharCode(65 + oIdx)}. {opt.text}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg mt-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'matching_information': {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Statements ({section.questions.length})</h4>
              <button onClick={() => addQuestion()} className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl">
                <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Statement
              </button>
            </div>
            {section.questions.map((q, qIdx) => (
              <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex items-start space-x-3">
                <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-lg mt-1">Q{q.questionNumber || (qIdx + 1)}</span>
                <div className="flex-1 space-y-2">
                  <input type="text" value={q.prompt} onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })} placeholder="Statement to match..." className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
                  <input type="text" value={q.correctAnswer as string} onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })} placeholder="Answer Key (e.g. A, B, C)" className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-sm font-semibold" />
                </div>
                <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg mt-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        );
      }
      
      case 'diagram_labeling': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Provide Labels as Options?</label>
                <button
                  type="button"
                  onClick={() => updateSection({ provideWordBank: !section.provideWordBank })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${section.provideWordBank ? 'bg-[#005C53] text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  {section.provideWordBank ? 'Yes (Options List)' : 'No (Free Text)'}
                </button>
              </div>
              {section.provideWordBank && (
                <textarea
                  rows={3}
                  value={(section.wordBankOptions || []).join('\n')}
                  onChange={(e) => updateSection({ wordBankOptions: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono"
                  placeholder="Enter labels (one per line)..."
                />
              )}
            </div>
            
            <DiagramPinTool
              diagramUrl={section.diagramUrl}
              onDiagramUrlChange={(url) => updateSection({ diagramUrl: url })}
              pins={section.diagramPins || []}
              onPinsChange={(pins) => {
                const pinQuestions: Question[] = pins.map(p => ({
                  id: p.id,
                  questionNumber: p.pinNumber,
                  type: 'diagram_labeling',
                  prompt: `Label for Marker #${p.pinNumber}`,
                  correctAnswer: p.correctAnswer,
                  acceptedAlternates: p.acceptedAlternates,
                  pinNumber: p.pinNumber,
                }));
                updateSection({ diagramPins: pins, questions: pinQuestions });
              }}
              startingQuestionNumber={section.questions[0]?.questionNumber || 1}
            />
          </div>
        );
      }
      
      case 'form_completion': {
        return (
          <div className="space-y-4">
            {renderSectionWordLimit()}
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Form Fields ({section.questions.length})</h4>
              <button
                onClick={() => addQuestion()}
                className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Field
              </button>
            </div>
            
            <div className="bg-white p-1 rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {section.questions.map((q, qIdx) => (
                <div key={q.id} className="p-3 flex items-center space-x-3">
                  <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-lg">Q{q.questionNumber || (qIdx + 1)}</span>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                      placeholder="Field Label (e.g. Name:)"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                    />
                    <input
                      type="text"
                      value={q.correctAnswer as string}
                      onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })}
                      placeholder="Correct Answer Key"
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-sm font-semibold"
                    />
                  </div>
                  <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {section.questions.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No fields added yet.</div>}
            </div>
          </div>
        );
      }
      
      case 'note_completion':
      case 'summary_completion': {
        return (
          <div className="space-y-4">
            {renderSectionWordLimit()}
            {section.type === 'summary_completion' && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Provide Word Bank?</label>
                  <button
                    type="button"
                    onClick={() => updateSection({ provideWordBank: !section.provideWordBank })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${section.provideWordBank ? 'bg-[#005C53] text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    {section.provideWordBank ? 'Yes' : 'No'}
                  </button>
                </div>
                {section.provideWordBank && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-500">Label Style</label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => updateSection({ wordBankLabelStyle: 'letters' })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${section.wordBankLabelStyle !== 'none' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
                        >
                          Letters (A, B, C...)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSection({ wordBankLabelStyle: 'none' })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${section.wordBankLabelStyle === 'none' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
                        >
                          Words Only
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={(section.wordBankOptions || []).join('\n')}
                      onChange={(e) => updateSection({ wordBankOptions: e.target.value.split('\n').filter(Boolean) })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono"
                      placeholder="Enter options (one per line)..."
                    />
                  </div>
                )}
              </div>
            )}

            <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-200 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Heading / Title</label>
                <input
                  type="text"
                  value={section.summaryTitle || ''}
                  onChange={(e) => updateSection({ summaryTitle: e.target.value })}
                  placeholder="e.g. Notes on the topic"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Text Content (Use [[GAP]] for missing words)</label>
                  <button
                    type="button"
                    onClick={() => {
                      updateSection({ summaryText: (section.summaryText || '') + ' [[GAP]] ' });
                      addQuestion();
                    }}
                    className="px-2.5 py-1 bg-[#005C53] text-white text-[10px] font-bold rounded flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Insert [[GAP]]
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={section.summaryText || ''}
                  onChange={(e) => updateSection({ summaryText: e.target.value })}
                  placeholder={section.type === 'note_completion' ? "- Point 1: [[GAP]]\n  - Subpoint: [[GAP]]" : "The text explains how [[GAP]] works..."}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm font-mono leading-relaxed"
                />
              </div>
            </div>
            
            {section.questions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">Gap Answer Keys ({section.questions.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.questions.map((q, qIdx) => (
                    <div key={q.id} className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-lg">Q{q.questionNumber || (qIdx + 1)}</span>
                      <input
                        type="text"
                        value={q.correctAnswer as string}
                        onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })}
                        placeholder="Answer Key"
                        className="flex-1 px-2 py-1 rounded border border-slate-300 text-sm font-semibold"
                      />
                      <button onClick={() => removeQuestion(qIdx)} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      case 'table_completion': {
        const table = section.tableGrid || { headers: ['Column 1', 'Column 2'], rows: [] };
        
        const updateTable = (updates: Partial<typeof table>, extraUpdates: Partial<typeof section> = {}) => {
          updateSection({ tableGrid: { ...table, ...updates }, ...extraUpdates });
        };
        
        const addRow = () => updateTable({ rows: [...table.rows, table.headers!.map(() => ({ isGap: false, text: '' }))] });
        const addCol = () => {
          updateTable({ 
            headers: [...table.headers!, `Column ${table.headers!.length + 1}`],
            rows: table.rows.map(row => [...row, { isGap: false, text: '' }])
          });
        };
        
        return (
          <div className="space-y-4">
            {renderSectionWordLimit()}
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Table Builder</h4>
              <div className="flex space-x-2">
                <button onClick={addCol} className="px-2 py-1 bg-slate-200 text-xs font-bold rounded-lg">+ Add Column</button>
                <button onClick={addRow} className="px-2 py-1 bg-[#005C53] text-white text-xs font-bold rounded-lg">+ Add Row</button>
              </div>
            </div>
            
            <div className="overflow-x-auto bg-white p-4 rounded-2xl border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 bg-slate-50 uppercase">
                  <tr>
                    {table.headers!.map((h, hIdx) => (
                      <th key={hIdx} className="px-4 py-2 border border-slate-200">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const hCopy = [...table.headers!];
                            hCopy[hIdx] = e.target.value;
                            updateTable({ headers: hCopy });
                          }}
                          className="w-full bg-transparent font-bold focus:outline-none"
                        />
                      </th>
                    ))}
                    <th className="px-2 py-2 border border-slate-200 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-2 py-2 border border-slate-200 relative">
                          <div className="flex flex-col space-y-1">
                            <label className="text-[10px] flex items-center space-x-1 cursor-pointer text-slate-500 font-bold">
                              <input
                                type="checkbox"
                                checked={cell.isGap}
                                onChange={(e) => {
                                  const rCopy = [...table.rows];
                                  const newQId = `q-${section.id}-${Date.now()}-${rIdx}-${cIdx}`;
                                  const isChecking = e.target.checked;
                                  const qId = isChecking ? (cell.questionId || newQId) : undefined;
                                  
                                  rCopy[rIdx][cIdx] = { 
                                    ...cell, 
                                    isGap: isChecking,
                                    questionId: qId 
                                  };
                                  
                                  if (isChecking && !cell.questionId) {
                                    const newQ = {
                                      id: newQId,
                                      type: 'table_completion' as QuestionType,
                                      prompt: cell.text || '',
                                      sectionId: section.id,
                                      correctAnswer: cell.correctAnswer || '',
                                      questionNumber: section.questions.length + 1
                                    };
                                    updateTable({ rows: rCopy }, { questions: [...section.questions, newQ] });
                                  } else if (!isChecking && cell.questionId) {
                                    // Remove the orphaned question
                                    updateTable({ rows: rCopy }, { 
                                      questions: section.questions.filter(q => q.id !== cell.questionId) 
                                    });
                                  } else {
                                    updateTable({ rows: rCopy });
                                  }
                                }}
                              />
                              <span>Is Gap?</span>
                            </label>
                            <textarea
                              rows={2}
                              placeholder={cell.isGap ? "e.g. Just ___ meters" : "Static text..."}
                              value={cell.text || ''}
                              onChange={(e) => {
                                const rCopy = [...table.rows];
                                rCopy[rIdx][cIdx] = { ...cell, text: e.target.value };
                                const updatedQuestions = cell.questionId 
                                  ? section.questions.map(q => q.id === cell.questionId ? { ...q, prompt: e.target.value } : q)
                                  : section.questions;
                                updateTable({ rows: rCopy }, { questions: updatedQuestions });
                              }}
                              className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-400 mb-1"
                            />
                            {cell.isGap && (
                              <input
                                type="text"
                                placeholder="Answer Key (e.g. 10,000)..."
                                value={cell.correctAnswer || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const rCopy = [...table.rows];
                                  rCopy[rIdx][cIdx] = { ...cell, correctAnswer: val };
                                  const updatedQuestions = cell.questionId 
                                    ? section.questions.map(q => q.id === cell.questionId ? { ...q, correctAnswer: val } : q)
                                    : section.questions;
                                  updateTable({ rows: rCopy }, { questions: updatedQuestions });
                                }}
                                className="w-full px-2 py-1 border border-emerald-300 bg-emerald-50 rounded text-xs font-semibold"
                              />
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-2 border border-slate-200 text-center">
                        <button 
                          onClick={() => {
                            const removedGaps = (table.rows[rIdx] || []).filter(c => c.isGap && c.questionId).map(c => c.questionId);
                            const updatedQuestions = section.questions.filter(q => !removedGaps.includes(q.id));
                            updateTable({ rows: table.rows.filter((_, idx) => idx !== rIdx) }, { questions: updatedQuestions });
                          }} 
                          className="text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {table.rows.length === 0 && <div className="text-center p-4 text-slate-500 text-sm">Add rows to build the table.</div>}
            </div>
          </div>
        );
      }
      
      case 'flow_chart_completion': {
        const steps = section.flowSteps || [];
        const addStep = () => updateSection({ flowSteps: [...steps, { id: Date.now().toString(), isGap: false, text: '' }] });
        
        return (
          <div className="space-y-4">
            {renderSectionWordLimit()}
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Flow-chart Steps</h4>
              <button
                onClick={addStep}
                className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Step
              </button>
            </div>
            
            <div className="space-y-2 relative">
              {steps.map((step, sIdx) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className="bg-white border-2 border-slate-300 rounded-xl p-3 w-full max-w-md flex items-start space-x-3 shadow-sm">
                    <div className="flex-1 flex flex-col space-y-2">
                      <label className="text-[10px] flex items-center space-x-1 cursor-pointer text-slate-500 font-bold">
                        <input
                          type="checkbox"
                          checked={step.isGap}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            const newQId = `q-${section.id}-${Date.now()}-${sIdx}`;
                            const isChecking = e.target.checked;
                            const qId = isChecking ? (step.questionId || newQId) : undefined;
                            
                            newSteps[sIdx] = { 
                              ...step, 
                              isGap: isChecking,
                              questionId: qId 
                            };
                            
                            if (isChecking && !step.questionId) {
                              const newQ = {
                                id: newQId,
                                type: 'flow_chart_completion' as QuestionType,
                                prompt: step.text || '',
                                sectionId: section.id,
                                correctAnswer: step.correctAnswer || '',
                                questionNumber: section.questions.length + 1
                              };
                              updateSection({ flowSteps: newSteps, questions: [...section.questions, newQ] });
                            } else if (!isChecking && step.questionId) {
                              updateSection({ 
                                flowSteps: newSteps,
                                questions: section.questions.filter(q => q.id !== step.questionId) 
                              });
                            } else {
                              updateSection({ flowSteps: newSteps });
                            }
                          }}
                        />
                        <span>Make this step a Gap</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder={step.isGap ? "e.g. Process ___ starting" : "Step text..."}
                        value={step.text || ''}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[sIdx] = { ...step, text: e.target.value };
                          const updatedQuestions = step.questionId 
                            ? section.questions.map(q => q.id === step.questionId ? { ...q, prompt: e.target.value } : q)
                            : section.questions;
                          updateSection({ flowSteps: newSteps, questions: updatedQuestions });
                        }}
                        className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-slate-400 mb-1"
                      />
                      {step.isGap && (
                        <input
                          type="text"
                          placeholder="Correct Answer Key..."
                          value={step.correctAnswer || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newSteps = [...steps];
                            newSteps[sIdx] = { ...step, correctAnswer: val };
                            const updatedQuestions = step.questionId 
                              ? section.questions.map(q => q.id === step.questionId ? { ...q, correctAnswer: val } : q)
                              : section.questions;
                            updateSection({ flowSteps: newSteps, questions: updatedQuestions });
                          }}
                          className="w-full px-2 py-1.5 border border-emerald-300 bg-emerald-50 rounded text-sm font-semibold"
                        />
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        const removedQId = step.questionId;
                        const updatedQuestions = removedQId 
                          ? section.questions.filter(q => q.id !== removedQId) 
                          : section.questions;
                        updateSection({ 
                          flowSteps: steps.filter((_, idx) => idx !== sIdx),
                          questions: updatedQuestions 
                        });
                      }} 
                      className="text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {sIdx < steps.length - 1 && <div className="h-6 w-0.5 bg-slate-300 my-1"></div>}
                </div>
              ))}
              {steps.length === 0 && <div className="text-center p-4 text-slate-500 text-sm bg-white rounded-xl border border-slate-200">No steps added.</div>}
            </div>
          </div>
        );
      }
      
      case 'sentence_completion': {
        return (
          <div className="space-y-4">
            {renderSectionWordLimit()}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Provide Word Bank?</label>
                <button
                  type="button"
                  onClick={() => updateSection({ provideWordBank: !section.provideWordBank })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${section.provideWordBank ? 'bg-[#005C53] text-white' : 'bg-slate-200 text-slate-700'}`}
                >
                  {section.provideWordBank ? 'Yes' : 'No'}
                </button>
              </div>
              {section.provideWordBank && (
                <textarea
                  rows={3}
                  value={(section.wordBankOptions || []).join('\n')}
                  onChange={(e) => updateSection({ wordBankOptions: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono"
                  placeholder="Enter options (one per line)..."
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Sentences ({section.questions.length})</h4>
                <button
                  onClick={() => addQuestion()}
                  className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Sentence
                </button>
              </div>
              
              {section.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-lg">Q{q.questionNumber || (qIdx + 1)}</span>
                    <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <input
                    type="text"
                    value={q.prompt}
                    onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                    placeholder="Sentence with [[GAP]]..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    value={q.correctAnswer as string}
                    onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })}
                    placeholder="Answer Key"
                    className="w-1/2 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-sm font-semibold self-end"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      case 'short_answer': {
        return (
          <div className="space-y-4">
            {renderSectionWordLimit()}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Short Answer Questions ({section.questions.length})</h4>
                <button
                  onClick={() => addQuestion()}
                  className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Question
                </button>
              </div>
              
              {section.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex items-start space-x-3">
                  <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-lg mt-1">Q{q.questionNumber || (qIdx + 1)}</span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                      placeholder="Question prompt..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                    <input
                      type="text"
                      value={q.correctAnswer as string}
                      onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })}
                      placeholder="Correct Answer Key"
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-sm font-semibold"
                    />
                  </div>
                  <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg mt-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
            Editor for {section.type} is not yet implemented.
          </div>
        );
    }
  };

  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
        <BookOpen className="w-5 h-5 text-[#005C53]" />
        <h4 className="font-extrabold text-slate-800 text-lg">Reading: {spec.label}</h4>
      </div>
      <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/90 text-xs text-[#005C53] flex space-x-2">
        <Info className="w-4 h-4 text-[#005C53] shrink-0" />
        <span className="font-medium">{spec.mechanism}</span>
      </div>

      {/* Section Image Uploader (Generic for all Listening types except Diagram Labeling) */}
      {section.type !== 'diagram_labeling' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200">
          <ImageUploader
            label="Section Reference Image (Optional)"
            value={section.diagramUrl}
            onChange={(url) => updateSection({ diagramUrl: url })}
            helperText="Upload an image to display alongside these questions."
          />
          {section.diagramUrl && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Image Position</label>
              <select
                value={section.imagePosition || 'top'}
                onChange={(e) => updateSection({ imagePosition: e.target.value as 'top' | 'bottom' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              >
                <option value="top">Above Questions</option>
                <option value="bottom">Below Questions</option>
              </select>
            </div>
          )}
        </div>
      )}

      {renderSpecifics()}
    </div>
  );
}
