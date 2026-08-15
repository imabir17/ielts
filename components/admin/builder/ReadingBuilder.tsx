'use client';

import React, { useState } from 'react';
import { Passage, QuestionSection, Question, QuestionType, DiagramPin, TableCell, FlowStep } from '@/lib/mock-data';
import { ImageUploader } from './ImageUploader';
import { DiagramPinTool } from './DiagramPinTool';
import {
  BookOpen, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle, AlertCircle, HelpCircle,
  X, Info, FileCode, Upload, Sparkles, Move, Table, Layers, Sliders, Type, ListPlus, CheckSquare, ChevronUp, ChevronDown
} from 'lucide-react';

interface ReadingBuilderProps {
  passages: Passage[];
  onChange: (passages: Passage[]) => void;
}

const QUESTION_TYPE_SPECS: { type: QuestionType; label: string; mechanism: string; category: string }[] = [
  { type: 'multiple_choice_single', label: '1. Multiple Choice (Single Answer)', mechanism: 'Radio buttons for single answer selection.', category: 'Choice' },
  { type: 'multiple_choice_multi', label: '2. Multiple Choice (Multiple Answers)', mechanism: 'Checkboxes for multi-answer selection with limit restriction.', category: 'Choice' },
  { type: 'true_false_ng', label: '3. Identifying Information (True/False/Not Given)', mechanism: '3-button toggle (TRUE, FALSE, NOT GIVEN) for factual statements.', category: 'Identification' },
  { type: 'yes_no_ng', label: '4. Identifying Writer Views (Yes/No/Not Given)', mechanism: '3-button toggle (YES, NO, NOT GIVEN) for writer claims.', category: 'Identification' },
  { type: 'sentence_completion', label: '5. Sentence Completion', mechanism: 'Inline text input or dropdown at [[GAP]] positions in sentence.', category: 'Completion' },
  { type: 'summary_completion', label: '6. Summary Completion', mechanism: 'Flowing paragraph text with inline inputs/dropdowns at [[GAP]] positions.', category: 'Completion' },
  { type: 'note_completion', label: '7. Note Completion', mechanism: 'Indented bullet notes with inline text inputs + word limit hint.', category: 'Completion' },
  { type: 'table_completion', label: '8. Table Completion', mechanism: 'HTML <table> grid where gap cells render as inline text inputs.', category: 'Completion' },
  { type: 'flow_chart_completion', label: '9. Flow-chart Completion', mechanism: 'Sequential connected step boxes with inline inputs/dropdowns at gaps.', category: 'Completion' },
  { type: 'short_answer', label: '10. Short-Answer Questions', mechanism: 'Text input below/beside prompt with section word limit validation.', category: 'Completion' },
  { type: 'diagram_labeling', label: '11. Diagram Label Completion', mechanism: 'Interactive image pins + numbered text inputs list corresponding to pins.', category: 'Diagram' },
  { type: 'matching_information', label: '12. Matching Information', mechanism: 'Statements matched to passage paragraph letters (A, B, C...).', category: 'Matching' },
  { type: 'matching_headings', label: '13. Matching Headings', mechanism: 'Paragraphs matched to a section-level shared pool of headings (i, ii, iii...).', category: 'Matching' },
  { type: 'matching_features', label: '14. Matching Features', mechanism: 'Statements matched to a section-level shared pool of features (names/dates).', category: 'Matching' },
  { type: 'matching_sentence_endings', label: '15. Matching Sentence Endings', mechanism: 'Sentence stems matched to a section-level shared pool of sentence endings.', category: 'Matching' },
];

/**
 * Renumber all questions sequentially across all sections in all 3 passages (1 to 40)
 */
function renumberPassages(passagesList: Passage[]): Passage[] {
  let globalQNum = 1;

  return passagesList.map((p) => {
    const rawSections = p.sections || [];
    const renumberedSections = rawSections.map((sec, secIdx) => {
      const updatedQuestions = sec.questions.map((q) => {
        const qNum = globalQNum++;
        return { ...q, questionNumber: qNum };
      });

      // Renumber diagram pins if present
      let updatedPins: DiagramPin[] | undefined = undefined;
      if (sec.diagramPins) {
        updatedPins = sec.diagramPins.map((pin, pIdx) => ({
          ...pin,
          pinNumber: globalQNum - sec.questions.length + pIdx,
        }));
      }

      return {
        ...sec,
        orderIndex: secIdx,
        diagramPins: updatedPins,
        questions: updatedQuestions,
      };
    });

    // Also sync flat questions array for backwards compatibility
    const allFlatQuestions = renumberedSections.flatMap((s) => s.questions);

    return {
      ...p,
      sections: renumberedSections,
      questions: allFlatQuestions,
    };
  });
}

export function ReadingBuilder({ passages, onChange }: ReadingBuilderProps) {
  const [activePassageIdx, setActivePassageIdx] = useState<number>(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [jsonString, setJsonString] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Ensure 3 passages exist with structured sections
  const currentPassages: Passage[] = [
    passages[0] || { id: 'pas-1', passageNumber: 1, title: 'Passage 1: Title', content: '', questions: [] },
    passages[1] || { id: 'pas-2', passageNumber: 2, title: 'Passage 2: Title', content: '', questions: [] },
    passages[2] || { id: 'pas-3', passageNumber: 3, title: 'Passage 3: Title', content: '', questions: [] },
  ].map((p, idx) => {
    let sections = p.sections || [];
    // If no sections exist, create an initial default section
    if (sections.length === 0) {
      sections = [
        {
          id: `sec-${p.id}-1`,
          sectionNumber: 1,
          type: 'multiple_choice_single',
          title: 'Section 1: Questions',
          instructions: 'Choose the correct letter A, B, C or D.',
          orderIndex: 0,
          questions: p.questions || [],
        },
      ];
    }
    return {
      ...p,
      content: p.content || '',
      sections,
      questions: p.questions || [],
    };
  });

  const passage = currentPassages[activePassageIdx];

  const updatePassage = (updatedFields: Partial<Passage>) => {
    const newPassages = [...currentPassages];
    newPassages[activePassageIdx] = { ...passage, ...updatedFields };
    const renumbered = renumberPassages(newPassages);
    onChange(renumbered);
  };

  // Section Management Actions
  const addSection = (type: QuestionType = 'multiple_choice_single') => {
    const secId = `sec-${passage.id}-${Date.now()}`;
    const newSec: QuestionSection = {
      id: secId,
      sectionNumber: (passage.sections?.length || 0) + 1,
      type,
      title: `Section ${(passage.sections?.length || 0) + 1}`,
      instructions: 'Follow the instructions below to answer the questions.',
      orderIndex: passage.sections?.length || 0,
      questions: [],
    };

    updatePassage({
      sections: [...(passage.sections || []), newSec],
    });
  };

  const updateSection = (secIdx: number, updatedFields: Partial<QuestionSection>) => {
    const updatedSections = [...(passage.sections || [])];
    updatedSections[secIdx] = { ...updatedSections[secIdx], ...updatedFields };
    updatePassage({ sections: updatedSections });
  };

  const deleteSection = (secIdx: number) => {
    const updatedSections = (passage.sections || []).filter((_, idx) => idx !== secIdx);
    updatePassage({ sections: updatedSections });
  };

  const moveSection = (secIdx: number, direction: 'up' | 'down') => {
    const sections = [...(passage.sections || [])];
    const targetIdx = direction === 'up' ? secIdx - 1 : secIdx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const temp = sections[secIdx];
    sections[secIdx] = sections[targetIdx];
    sections[targetIdx] = temp;

    updatePassage({ sections });
  };

  // Add question inside specific section
  const addQuestionToSection = (secIdx: number) => {
    const sections = [...(passage.sections || [])];
    const sec = sections[secIdx];

    const newQ: Question = {
      id: `q-${sec.id}-${Date.now()}`,
      sectionId: sec.id,
      type: sec.type,
      prompt: 'Enter question prompt...',
      options: sec.type.startsWith('multiple_choice') ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: sec.type === 'true_false_ng' || sec.type === 'yes_no_ng' ? 'TRUE' : 'Answer Key',
      instruction: sec.instructions,
    };

    sec.questions = [...sec.questions, newQ];
    updatePassage({ sections });
  };

  const updateQuestionInSection = (secIdx: number, qIdx: number, updatedFields: Partial<Question>) => {
    const sections = [...(passage.sections || [])];
    const sec = sections[secIdx];
    sec.questions[qIdx] = { ...sec.questions[qIdx], ...updatedFields };
    updatePassage({ sections });
  };

  const deleteQuestionFromSection = (secIdx: number, qIdx: number) => {
    const sections = [...(passage.sections || [])];
    const sec = sections[secIdx];
    sec.questions = sec.questions.filter((_, idx) => idx !== qIdx);
    updatePassage({ sections });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Passage Tab Selectors */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-3">
          {[0, 1, 2].map((index) => {
            const p = currentPassages[index];
            const hasContent = (p?.content || '').trim().length > 0 && (p?.sections || []).length > 0;
            return (
              <button
                key={index}
                onClick={() => setActivePassageIdx(index)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                  activePassageIdx === index
                    ? 'bg-[#005C53] text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Passage {index + 1}</span>
                {hasContent ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300 ml-1" />
                ) : (
                  <span title="Incomplete passage">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 ml-1" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => addSection('multiple_choice_single')}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-100 text-[#005C53] border border-emerald-300 hover:bg-emerald-200 text-xs font-extrabold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Section</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Passage Content Editor */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base">Passage {activePassageIdx + 1} Text</h3>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Passage {activePassageIdx + 1} of 3
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Passage Title</label>
            <input
              type="text"
              value={passage.title}
              onChange={(e) => updatePassage({ title: e.target.value })}
              placeholder="e.g. Passage 1: Attitudes to Language"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Passage Body Text (Use [Paragraph A] tags)</label>
            <textarea
              rows={16}
              value={passage.content}
              onChange={(e) => updatePassage({ content: e.target.value })}
              placeholder="[Paragraph A] Passage paragraph text...\n\n[Paragraph B] Next paragraph text..."
              className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 font-serif text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#005C53] resize-y"
            />
          </div>

          {/* Passage Header Image Uploader */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <ImageUploader
              label="Passage Image / Diagram"
              value={passage.diagramUrl}
              onChange={(url) => updatePassage({ diagramUrl: url })}
              helperText="Upload an image file (PNG, JPG, SVG) or paste a URL to render alongside this passage."
            />
            {passage.diagramUrl && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Image Position</label>
                <select
                  value={passage.imagePosition || 'top'}
                  onChange={(e) => updatePassage({ imagePosition: e.target.value as 'top' | 'bottom' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                >
                  <option value="top">Above Passage</option>
                  <option value="bottom">Below Passage</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 14 Section Builders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Passage {activePassageIdx + 1} Section Builder</h3>
              <p className="text-xs text-slate-500">
                {(passage.sections || []).length} Sections | Global Running Questions Count Saved
              </p>
            </div>
            <button
              onClick={() => addSection('multiple_choice_single')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#005C53] hover:bg-[#003831] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>

          {/* Render All Sections in Passage */}
          {(passage.sections || []).map((sec, secIdx) => {
            const spec = QUESTION_TYPE_SPECS.find((s) => s.type === sec.type) || QUESTION_TYPE_SPECS[0];
            const isFirst = secIdx === 0;
            const isLast = secIdx === (passage.sections || []).length - 1;
            const isCollapsed = collapsedSections[sec.id] || false;

            return (
              <div
                key={sec.id}
                className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all ${!isCollapsed ? 'hover:border-[#005C53] space-y-5' : 'hover:bg-slate-50'}`}
              >
                {/* Section Header Controls */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                      Sec {secIdx + 1}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-red-100 text-red-700 px-2.5 py-1 rounded">
                      {spec.category}
                    </span>
                  </div>

                  {/* Section Reorder & Delete Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={isFirst}
                      onClick={() => moveSection(secIdx, 'up')}
                      className={`p-1.5 rounded-lg border ${
                        isFirst ? 'text-slate-300 border-slate-200 cursor-not-allowed' : 'text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                      title="Move Section Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={isLast}
                      onClick={() => moveSection(secIdx, 'down')}
                      className={`p-1.5 rounded-lg border ${
                        isLast ? 'text-slate-300 border-slate-200 cursor-not-allowed' : 'text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                      title="Move Section Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Select Section Type */}
                    <select
                      value={sec.type}
                      onChange={(e) => updateSection(secIdx, { type: e.target.value as QuestionType })}
                      className="text-xs font-bold bg-slate-50 text-[#005C53] border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                    >
                      {QUESTION_TYPE_SPECS.map((s) => (
                        <option key={s.type} value={s.type}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-1.5 opacity-50 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleSectionCollapse(sec.id)}
                      className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg"
                      title={isCollapsed ? "Expand Section" : "Collapse Section"}
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => moveSection(secIdx, 'up')}
                      disabled={isFirst}
                      className={`p-1.5 rounded-lg ${isFirst ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(secIdx, 'down')}
                      disabled={isLast}
                      className={`p-1.5 rounded-lg ${isLast ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSection(secIdx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-5 pt-2 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Section Mechanism Guidance Box */}
                      <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/90 text-xs text-[#005C53] space-y-1">
                        <div className="font-bold flex items-center space-x-1.5">
                          <Info className="w-4 h-4 text-[#005C53] shrink-0" />
                          <span>Section Type ({spec.label}):</span>
                        </div>
                        <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                          {spec.mechanism}
                        </p>
                      </div>
                    </div>

                    {/* Section Instructions Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Rubric / Instructions</label>
                      <input
                        type="text"
                        value={sec.instructions}
                        onChange={(e) => updateSection(secIdx, { instructions: e.target.value })}
                        placeholder="e.g. Choose NO MORE THAN TWO WORDS from the passage for each answer."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                      />
                    </div>

                    {/* TYPE 1: MULTIPLE CHOICE (Single vs Multi Toggles) */}
                    {(sec.type === 'multiple_choice_single' || sec.type === 'multiple_choice_multi') && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Selection Mode Toggle</label>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => updateSection(secIdx, { type: 'multiple_choice_single', isMultiSelect: false })}
                              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                sec.type === 'multiple_choice_single' ? 'bg-[#005C53] text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              Single Answer (Radio)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSection(secIdx, { type: 'multiple_choice_multi', isMultiSelect: true })}
                              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                sec.type === 'multiple_choice_multi' ? 'bg-[#005C53] text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              Multiple Answers (Checkboxes)
                            </button>
                          </div>
                        </div>

                        {sec.type === 'multiple_choice_multi' && (
                          <div className="space-y-4 mt-3 border-t border-slate-200 pt-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Required Selection Count (e.g. Choose 5)</label>
                              <input
                                type="number"
                                value={sec.requiredSelectionCount || 2}
                                onChange={(e) => updateSection(secIdx, { requiredSelectionCount: Number(e.target.value) })}
                                className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                Options Pool (One per line)
                              </label>
                              <textarea
                                rows={4}
                                placeholder="e.g. It is a more reliable source of energy than wind power.\nIt would replace all other forms of energy in Britain."
                                value={(sec.wordBankOptions || []).join('\n')}
                                onChange={(e) =>
                                  updateSection(secIdx, {
                                    wordBankOptions: e.target.value.split('\n').filter(Boolean),
                                  })
                                }
                                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                              />
                            </div>
                            {sec.wordBankOptions && sec.wordBankOptions.length > 0 && sec.questions.length > 0 && (
                              <div>
                                <label className="block text-[11px] font-bold text-slate-500 mb-2">Select Correct Answers (Applies to all questions in this section)</label>
                                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                                  {sec.wordBankOptions.map((opt, optIdx) => {
                                    const cArr = Array.isArray(sec.questions[0]?.correctAnswer) ? sec.questions[0].correctAnswer : [];
                                    const isChecked = cArr.includes(opt);
                                    return (
                                      <label key={optIdx} className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {
                                            const newArr = isChecked ? cArr.filter((c: string) => c !== opt) : [...cArr, opt];
                                            const updatedQuestions = sec.questions.map(q => ({ ...q, correctAnswer: newArr }));
                                            updateSection(secIdx, { questions: updatedQuestions });
                                          }}
                                          className="w-4 h-4 text-[#005C53] rounded"
                                        />
                                        <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TYPE 5: SUMMARY & NOTE COMPLETION BUILDER */}
                    {(sec.type === 'summary_completion' || sec.type === 'note_completion') && (
                      <div className="p-5 bg-emerald-50/60 rounded-3xl border border-emerald-200 space-y-4 font-sans">
                        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                          <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                            <Layers className="w-4 h-4 text-[#005C53]" />
                            <span>{sec.type === 'summary_completion' ? 'Summary' : 'Note'} Completion Header & Word Bank</span>
                          </h4>
                          <span className="text-xs font-bold text-[#005C53] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            Official IELTS Format
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{sec.type === 'summary_completion' ? 'Summary' : 'Note'} Heading / Title</label>
                          <input
                            type="text"
                            value={sec.summaryTitle || ''}
                            onChange={(e) => updateSection(secIdx, { summaryTitle: e.target.value })}
                            placeholder="e.g. The language debate"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700">{sec.type === 'summary_completion' ? 'Summary' : 'Note'} Paragraph (Use [[GAP]] or [[GAP:1]] for multi-gap)</label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentText = sec.summaryText || '';
                                const updatedText = `${currentText} [[GAP]] `;
                                updateSection(secIdx, { summaryText: updatedText });
                                addQuestionToSection(secIdx);
                              }}
                              className="px-3 py-1 bg-[#005C53] text-white text-xs font-bold rounded-lg hover:bg-[#003831] flex items-center space-x-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Insert Gap [[GAP]]</span>
                            </button>
                          </div>
                          <textarea
                            rows={5}
                            value={sec.summaryText || ''}
                            onChange={(e) => updateSection(secIdx, { summaryText: e.target.value })}
                            placeholder="According to [[GAP]] there is only one correct form of language. Linguists who take this approach to language place great importance on grammatical [[GAP]]..."
                            className="w-full p-3.5 rounded-xl border border-slate-300 text-xs leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                          />
                        </div>

                        {/* Word Bank A-I Options List */}
                        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                          <label className="block text-xs font-bold text-slate-900">
                            Word Bank Options Pool (Labeled A, B, C, D, E, F, G, H, I...)
                          </label>
                          <textarea
                            rows={5}
                            placeholder="Enter options (one per line)...\ndescriptivists\nlanguage expert\npopular speech\nformal language\nevaluation\nrules\nmodern linguists\nprescriptivists\nchange"
                            value={(sec.wordBankOptions || []).join('\n')}
                            onChange={(e) => {
                              const lines = e.target.value.split('\n').filter(Boolean);
                              updateSection(secIdx, { wordBankOptions: lines, provideWordBank: true });
                            }}
                            className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                          />

                          {/* Render Option Preview Badges */}
                          {sec.wordBankOptions && sec.wordBankOptions.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-sans">
                              {sec.wordBankOptions.map((opt, idx) => (
                                <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold flex items-center space-x-2">
                                  <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span className="truncate text-slate-800">{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TYPE 4 & 8: SECTION-LEVEL SHARED WORD BANK TOGGLE */}
                    {(sec.type === 'sentence_completion' || sec.type === 'flow_chart_completion') && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                            <ListPlus className="w-4 h-4 text-[#005C53]" />
                            <span>Provide Shared Word Bank / Options Pool?</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => updateSection(secIdx, { provideWordBank: !sec.provideWordBank })}
                            className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                              sec.provideWordBank ? 'bg-[#005C53] text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {sec.provideWordBank ? 'Word Bank ON' : 'Word Bank OFF'}
                          </button>
                        </div>

                        {sec.provideWordBank && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">
                              Shared Word Bank Options (One per line)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="e.g.\nA. descriptivists\nB. language expert\nC. popular speech"
                              value={(sec.wordBankOptions || []).join('\n')}
                              onChange={(e) =>
                                updateSection(secIdx, {
                                  wordBankOptions: e.target.value.split('\n').filter(Boolean),
                                })
                              }
                              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* TYPE 6 & 10: WORD LIMIT SETTING */}
                    {(sec.type === 'note_completion' || 
                      sec.type === 'short_answer' ||
                      sec.type === 'sentence_completion' ||
                      sec.type === 'summary_completion' ||
                      sec.type === 'table_completion' ||
                      sec.type === 'flow_chart_completion' ||
                      sec.type === 'diagram_labeling') && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Section Word Limit (Shown to student & validated in scoring)
                        </label>
                        <input
                          type="text"
                          value={sec.wordLimit || 'NO MORE THAN TWO WORDS'}
                          onChange={(e) => updateSection(secIdx, { wordLimit: e.target.value })}
                          placeholder="e.g. NO MORE THAN THREE WORDS"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#005C53]"
                        />
                      </div>
                    )}

                    {/* TYPE 12: MATCHING HEADINGS SHARED POOL & TOGGLE */}
                    {sec.type === 'matching_headings' && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">Shared Headings Pool (i, ii, iii...)</label>
                          <button
                            type="button"
                            onClick={() => updateSection(secIdx, { usedOnceOnly: !sec.usedOnceOnly })}
                            className={`px-3 py-1 rounded-xl text-xs font-bold ${
                              sec.usedOnceOnly ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {sec.usedOnceOnly ? 'Used Once Only ON' : 'Used Once Only OFF'}
                          </button>
                        </div>

                        <textarea
                          rows={4}
                          placeholder="Enter Headings (one per line)...\ni. The architecture of reefs\nii. Thermal stress factors\niii. Economic impacts"
                          value={(sec.headingsPool || []).map((h) => `${h.label}. ${h.text}`).join('\n')}
                          onChange={(e) => {
                            const lines = e.target.value.split('\n').filter(Boolean);
                            const pool = lines.map((line, idx) => {
                              const parts = line.split('.');
                              const label = parts.length > 1 ? parts[0].trim() : `heading-${idx + 1}`;
                              const text = parts.length > 1 ? parts.slice(1).join('.').trim() : line.trim();
                              return { id: `h-${idx}`, label, text };
                            });
                            updateSection(secIdx, { headingsPool: pool });
                          }}
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                        />
                      </div>
                    )}

                    {/* TYPE 13: MATCHING FEATURES SHARED POOL */}
                    {sec.type === 'matching_features' && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">Shared Features Pool (Researchers / Dates)</label>
                          <button
                            type="button"
                            onClick={() => updateSection(secIdx, { usedOnceOnly: !sec.usedOnceOnly })}
                            className={`px-3 py-1 rounded-xl text-xs font-bold ${
                              sec.usedOnceOnly ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {sec.usedOnceOnly ? 'Used Once Only ON' : 'Used Once Only OFF'}
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Enter features (one per line)...\nA. Joseph Priestley\nB. Claude Shannon\nC. AbuBakr Bahaj"
                          value={(sec.featuresPool || []).map((f) => f.text).join('\n')}
                          onChange={(e) => {
                            const lines = e.target.value.split('\n').filter(Boolean);
                            const pool = lines.map((text, idx) => ({ id: `f-${idx}`, text }));
                            updateSection(secIdx, { featuresPool: pool });
                          }}
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                        />
                      </div>
                    )}

                    {/* TYPE 14: MATCHING SENTENCE ENDINGS SHARED POOL */}
                    {sec.type === 'matching_sentence_endings' && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <label className="text-xs font-bold text-slate-800 block">Shared Sentence Endings Pool</label>
                        <textarea
                          rows={3}
                          placeholder="Enter sentence endings (one per line)...\nA. are unpredictable and seasonal\nB. harbor roughly 25% of all marine species"
                          value={(sec.sentenceEndingsPool || []).map((e) => e.text).join('\n')}
                          onChange={(e) => {
                            const lines = e.target.value.split('\n').filter(Boolean);
                            const pool = lines.map((text, idx) => ({ id: `end-${idx}`, text }));
                            updateSection(secIdx, { sentenceEndingsPool: pool });
                          }}
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                        />
                      </div>
                    )}

                    {/* TYPE 11: DIAGRAM LABELING CLICK-TO-PLACE PIN TOOL */}
                    {sec.type === 'diagram_labeling' && (
                      <DiagramPinTool
                        diagramUrl={sec.diagramUrl}
                        onDiagramUrlChange={(url) => updateSection(secIdx, { diagramUrl: url })}
                        pins={sec.diagramPins || []}
                        onPinsChange={(pins) => {
                          // Map pins to questions for consistency
                          const pinQuestions: Question[] = pins.map((p) => ({
                            id: p.id,
                            questionNumber: p.pinNumber,
                            type: 'diagram_labeling',
                            prompt: `Label for Marker #${p.pinNumber}`,
                            correctAnswer: p.correctAnswer,
                            acceptedAlternates: p.acceptedAlternates,
                            pinNumber: p.pinNumber,
                          }));
                          updateSection(secIdx, { diagramPins: pins, questions: pinQuestions });
                        }}
                        startingQuestionNumber={sec.questions[0]?.questionNumber || 1}
                      />
                    )}

                    {/* Render Questions List Inside Section */}
                    {sec.type !== 'diagram_labeling' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            Questions ({sec.questions.length})
                          </h4>
                          <button
                            onClick={() => addQuestionToSection(secIdx)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#005C53] hover:bg-[#003831] text-white text-xs font-bold rounded-xl transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Question</span>
                          </button>
                        </div>

                        {sec.questions.map((q, qIdx) => (
                          <div
                            key={q.id}
                            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 hover:border-[#005C53]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                                Q{q.questionNumber || qIdx + 1}
                              </span>
                              <button
                                onClick={() => deleteQuestionFromSection(secIdx, qIdx)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">Question Prompt / Statement</label>
                              <input
                                type="text"
                                value={q.prompt}
                                onChange={(e) => updateQuestionInSection(secIdx, qIdx, { prompt: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                              />
                            </div>

                            {/* Options for Multiple Choice Single */}
                            {sec.type === 'multiple_choice_single' && (
                              <div className="space-y-2 pt-1">
                                <label className="block text-[11px] font-bold text-slate-500">Options & Correct Key</label>
                                {(q.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center space-x-2">
                                    <input
                                      type={sec.type === 'multiple_choice_single' ? 'radio' : 'checkbox'}
                                      name={`correct-${q.id}`}
                                      checked={
                                        Array.isArray(q.correctAnswer)
                                          ? q.correctAnswer.includes(opt)
                                          : q.correctAnswer === opt
                                      }
                                      onChange={() => updateQuestionInSection(secIdx, qIdx, { correctAnswer: opt })}
                                      className="w-4 h-4 text-[#005C53]"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOpts = [...(q.options || [])];
                                        newOpts[optIdx] = e.target.value;
                                        updateQuestionInSection(secIdx, qIdx, { options: newOpts });
                                      }}
                                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* True/False/Not Given & Yes/No/Not Given */}
                            {(sec.type === 'true_false_ng' || sec.type === 'yes_no_ng') && (
                              <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-500">Correct Key</label>
                                <div className="flex space-x-2">
                                  {(sec.type === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => updateQuestionInSection(secIdx, qIdx, { correctAnswer: val })}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                        q.correctAnswer === val ? 'bg-[#005C53] text-white' : 'bg-white border border-slate-300 text-slate-700'
                                      }`}
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Free-text Key & Accepted Alternates Input */}
                            {(sec.type === 'sentence_completion' ||
                              sec.type === 'summary_completion' ||
                              sec.type === 'note_completion' ||
                              sec.type === 'table_completion' ||
                              sec.type === 'flow_chart_completion' ||
                              sec.type === 'matching_information' ||
                              sec.type === 'short_answer') && (
                              <div className="pt-1">
                                {Array.from({ 
                                  length: (() => {
                                    if (!sec.summaryText) return 1;
                                    const matches = [...sec.summaryText.matchAll(/\[\[GAP(?::(\d+))?\]\]/g)];
                                    let autoIndex = 0;
                                    let count = 0;
                                    for (const match of matches) {
                                      if (match[1]) {
                                        if (parseInt(match[1]) === qIdx + 1) count++;
                                      } else {
                                        if (autoIndex === qIdx) count++;
                                        autoIndex++;
                                      }
                                    }
                                    return Math.max(1, count);
                                  })()
                                }).map((_, gIdx, arr) => (
                                  <div key={gIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500">Correct Answer Key {arr.length > 1 ? `(Gap ${gIdx + 1})` : ''}</label>
                                      <input
                                        type="text"
                                        value={Array.isArray(q.correctAnswer) ? (q.correctAnswer[gIdx] || '') : (gIdx === 0 ? String(q.correctAnswer || '') : '')}
                                        onChange={(e) => {
                                           const newAns = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [String(q.correctAnswer || '')];
                                           newAns[gIdx] = e.target.value;
                                           updateQuestionInSection(secIdx, qIdx, { correctAnswer: arr.length > 1 ? newAns : newAns[0] });
                                        }}
                                        placeholder="Primary answer key"
                                        className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-bold text-[#005C53] bg-white focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-400">Accepted Alternates (Comma Separated)</label>
                                      <input
                                        type="text"
                                        value={(q.acceptedAlternates || []).join(', ')}
                                        onChange={(e) =>
                                          updateQuestionInSection(secIdx, qIdx, {
                                            acceptedAlternates: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                                          })
                                        }
                                        placeholder="e.g. oxygen species, ROS"
                                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
