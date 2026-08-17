'use client';

import React, { useState } from 'react';
import { QuestionSection, Question, QuestionType, DiagramPin, TableCell, FlowStep } from '@/lib/mock-data';
import { ImageUploader } from './ImageUploader';
import { DiagramPinTool } from './DiagramPinTool';
import {
  Plus, Trash2, ArrowUp, ArrowDown, CheckCircle, AlertCircle, HelpCircle,
  X, Info, FileCode, Upload, Sparkles, Move, Table, Layers, Sliders, Type, ListPlus, CheckSquare, ChevronUp, ChevronDown, AlignLeft, Headphones
} from 'lucide-react';

interface ListeningQuestionEditorProps {
  section: QuestionSection;
  onChange: (updated: QuestionSection) => void;
}

const LISTENING_QUESTION_TYPE_SPECS: { type: QuestionType; label: string; mechanism: string; category: string }[] = [
  { type: 'multiple_choice_single', label: '1. Multiple Choice (Single)', mechanism: 'Radio buttons for single answer selection.', category: 'Choice' },
  { type: 'multiple_choice_multi', label: '1. Multiple Choice (Multiple)', mechanism: 'Checkboxes for multi-answer selection with limit restriction.', category: 'Choice' },
  { type: 'matching', label: '2. Matching', mechanism: 'Dropdown from shared option pool.', category: 'Matching' },
  { type: 'diagram_labeling', label: '3. Plan/Map/Diagram Labelling', mechanism: 'Interactive image pins + options or free text.', category: 'Diagram' },
  { type: 'form_completion', label: '4. Form Completion', mechanism: 'Form fields (label + gap pairs).', category: 'Completion' },
  { type: 'note_completion', label: '5. Note Completion', mechanism: 'Indented bullet notes with inline text inputs + word limit hint.', category: 'Completion' },
  { type: 'table_completion', label: '6. Table Completion', mechanism: 'HTML <table> grid where gap cells render as inline text inputs.', category: 'Completion' },
  { type: 'flow_chart_completion', label: '7. Flow-chart Completion', mechanism: 'Sequential connected step boxes with inline inputs/dropdowns at gaps.', category: 'Completion' },
  { type: 'summary_completion', label: '8. Summary Completion', mechanism: 'Flowing paragraph text with inline inputs/dropdowns at [[GAP]] positions.', category: 'Completion' },
  { type: 'sentence_completion', label: '9. Sentence Completion', mechanism: 'Inline text input or dropdown at [[GAP]] positions in sentence.', category: 'Completion' },
  { type: 'short_answer', label: '10. Short-Answer Questions', mechanism: 'Text input below/beside prompt with section word limit validation.', category: 'Completion' },
];

export function ListeningQuestionEditor({ section, onChange }: ListeningQuestionEditorProps) {
  const spec = LISTENING_QUESTION_TYPE_SPECS.find(s => s.type === section.type) || LISTENING_QUESTION_TYPE_SPECS[0];

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
      case 'multiple_choice_single':
      case 'multiple_choice_multi': {
        const isMulti = section.type === 'multiple_choice_multi';
        return (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Selection Mode</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => updateSection({ type: 'multiple_choice_single', isMultiSelect: false })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${!isMulti ? 'bg-[#005C53] text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Single Answer
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSection({ type: 'multiple_choice_multi', isMultiSelect: true })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${isMulti ? 'bg-[#005C53] text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Multiple Answers
                  </button>
                </div>
              </div>
              {isMulti && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Selection Count</label>
                  <input
                    type="number"
                    value={section.requiredSelectionCount || 2}
                    onChange={(e) => updateSection({ requiredSelectionCount: Number(e.target.value) })}
                    className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
              )}
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
                const cArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer].filter(Boolean);
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
                            type={isMulti ? "checkbox" : "radio"}
                            checked={cArr.includes(opt)}
                            onChange={() => {
                              if (isMulti) {
                                const newArr = cArr.includes(opt) ? cArr.filter(c => c !== opt) : [...cArr, opt];
                                updateQuestion(qIdx, { correctAnswer: newArr });
                              } else {
                                updateQuestion(qIdx, { correctAnswer: opt });
                              }
                            }}
                            className="w-4 h-4 text-[#005C53]"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...qOptions];
                              const oldVal = newOpts[oIdx];
                              newOpts[oIdx] = e.target.value;
                              const newCArr = cArr.map(c => c === oldVal ? e.target.value : c);
                              updateQuestion(qIdx, { options: newOpts, correctAnswer: isMulti ? newCArr : (q.correctAnswer === oldVal ? e.target.value : q.correctAnswer) });
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
      
      case 'matching': {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Shared Options Pool</label>
                <button
                  type="button"
                  onClick={() => updateSection({ usedOnceOnly: !section.usedOnceOnly })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${section.usedOnceOnly ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 text-slate-700'}`}
                >
                  {section.usedOnceOnly ? 'Used Once Only ON' : 'Used Once Only OFF'}
                </button>
              </div>
              <input
                type="text"
                value={section.wordBankTitle || ''}
                onChange={(e) => updateSection({ wordBankTitle: e.target.value })}
                placeholder="Options Title (e.g. Area of work) - Supports Markdown"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#005C53] mb-2"
              />
              <textarea
                rows={4}
                value={(section.wordBankOptions || []).join('\n')}
                onChange={(e) => updateSection({ wordBankOptions: e.target.value.split('\n').filter(Boolean) })}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono"
                placeholder="A. Option A\nB. Option B"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Statements to Match ({section.questions.length})</h4>
                <button
                  onClick={() => addQuestion()}
                  className="px-3 py-1.5 bg-[#005C53] text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Statement
                </button>
              </div>
              <input
                type="text"
                value={section.questionsTitle || ''}
                onChange={(e) => updateSection({ questionsTitle: e.target.value })}
                placeholder="Questions Title (e.g. People) - Supports Markdown"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
              
              {section.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex items-start space-x-3">
                  <span className="font-bold text-xs bg-slate-900 text-white w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-lg mt-1">Q{q.questionNumber || (qIdx + 1)}</span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                      placeholder="Statement text..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                    <select
                      value={q.correctAnswer as string}
                      onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                    >
                      <option value="">Select Correct Match...</option>
                      {(section.wordBankOptions || []).map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>{opt}</option>
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
                  <textarea
                    rows={3}
                    value={(section.wordBankOptions || []).join('\n')}
                    onChange={(e) => updateSection({ wordBankOptions: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono"
                    placeholder="Enter options (one per line)..."
                  />
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
        
        const updateTable = (updates: Partial<typeof table>) => {
          updateSection({ tableGrid: { ...table, ...updates } });
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
                                  rCopy[rIdx][cIdx] = { 
                                    ...cell, 
                                    isGap: e.target.checked,
                                    questionId: e.target.checked ? (cell.questionId || newQId) : undefined 
                                  };
                                  updateTable({ rows: rCopy });
                                  
                                  if (e.target.checked && !cell.questionId) {
                                    addQuestion({ id: newQId });
                                  } else if (!e.target.checked && cell.questionId) {
                                    // Remove the orphaned question
                                    updateSection({ 
                                      questions: section.questions.filter(q => q.id !== cell.questionId) 
                                    });
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
                                updateTable({ rows: rCopy });
                              }}
                              className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-400 mb-1"
                            />
                            {cell.isGap && (
                              <input
                                type="text"
                                placeholder="Answer Key..."
                                value={cell.correctAnswer || ''}
                                onChange={(e) => {
                                  const rCopy = [...table.rows];
                                  rCopy[rIdx][cIdx] = { ...cell, correctAnswer: e.target.value };
                                  updateTable({ rows: rCopy });
                                }}
                                className="w-full px-2 py-1 border border-emerald-300 bg-emerald-50 rounded text-xs"
                              />
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-2 border border-slate-200 text-center">
                        <button onClick={() => updateTable({ rows: table.rows.filter((_, idx) => idx !== rIdx) })} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
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
                            newSteps[sIdx] = { 
                              ...step, 
                              isGap: e.target.checked,
                              questionId: e.target.checked ? (step.questionId || newQId) : undefined 
                            };
                            updateSection({ flowSteps: newSteps });
                            if (e.target.checked && !step.questionId) {
                              addQuestion({ id: newQId });
                            } else if (!e.target.checked && step.questionId) {
                              // Remove the orphaned question
                              updateSection({ 
                                questions: section.questions.filter(q => q.id !== step.questionId) 
                              });
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
                          updateSection({ flowSteps: newSteps });
                        }}
                        className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-slate-400 mb-1"
                      />
                      {step.isGap && (
                        <input
                          type="text"
                          placeholder="Correct Answer Key..."
                          value={step.correctAnswer || ''}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[sIdx] = { ...step, correctAnswer: e.target.value };
                            updateSection({ flowSteps: newSteps });
                          }}
                          className="w-full px-2 py-1.5 border border-emerald-300 bg-emerald-50 rounded text-sm font-semibold"
                        />
                      )}
                    </div>
                    <button onClick={() => updateSection({ flowSteps: steps.filter((_, idx) => idx !== sIdx) })} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
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
        <Headphones className="w-5 h-5 text-[#005C53]" />
        <h4 className="font-extrabold text-slate-800 text-lg">Listening: {spec.label}</h4>
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
