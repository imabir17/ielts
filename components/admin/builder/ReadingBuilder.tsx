'use client';

import React, { useState } from 'react';
import { Passage, QuestionSection, Question, QuestionType, DiagramPin, TableCell, FlowStep } from '@/lib/mock-data';
import { ImageUploader } from './ImageUploader';
import { DiagramPinTool } from './DiagramPinTool';
import { ReadingQuestionEditor } from './ReadingQuestionEditor';
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
  const safePassages = Array.isArray(passages) ? passages : [];
  const currentPassages: Passage[] = [
    safePassages[0] || { id: 'pas-1', passageNumber: 1, title: 'Passage 1: Title', content: '', questions: [] },
    safePassages[1] || { id: 'pas-2', passageNumber: 2, title: 'Passage 2: Title', content: '', questions: [] },
    safePassages[2] || { id: 'pas-3', passageNumber: 3, title: 'Passage 3: Title', content: '', questions: [] },
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
                  <div className="p-5 md:p-6 bg-white space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">Section Rubric / Instructions (Student-facing)</label>
                        <span className="text-[10px] font-bold text-slate-400">Supports Markdown</span>
                      </div>
                      <textarea
                        rows={3}
                        value={sec.instructions}
                        onChange={(e) => updateSection(secIdx, { instructions: e.target.value })}
                        placeholder="e.g. Choose NO MORE THAN TWO WORDS from the passage for each answer."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                      />
                    </div>
                    <div className="border-t border-slate-100 pt-6">
                      <ReadingQuestionEditor section={sec} onChange={(updated) => updateSection(secIdx, updated)} />
                    </div>
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
