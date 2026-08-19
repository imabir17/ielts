'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Passage, QuestionSection, Question, QuestionType } from '@/lib/mock-data';
import { calculateTestScore, ScoreResult } from '@/lib/scoring-engine';
import {
  BookOpen, Flag, HelpCircle, EyeOff, CheckCircle2, Copy, Highlighter, StickyNote, X, RefreshCw, MapPin, ListPlus, Underline, Trash2
} from 'lucide-react';
import { QuestionNavigator, NavigatorQuestionItem } from './QuestionNavigator';

interface ReadingModuleProps {
  passage: Passage;
  allPassages?: Passage[];
  onAnswerChange?: (answers: Record<string, any>) => void;
}

interface HighlightItem {
  id: string;
  text: string;
  style?: 'highlight' | 'underline';
  note?: string;
  createdAt?: string;
}

export function ReadingModule({ passage, allPassages, onAnswerChange }: ReadingModuleProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Tools State
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [showTextMenu, setShowTextMenu] = useState<boolean>(false);
  const [textMenuPos, setTextMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [showNotepad, setShowNotepad] = useState<boolean>(false);
  const [freeNotes, setFreeNotes] = useState<string>('');

  // Modals & Overlays
  const [isScreenHidden, setIsScreenHidden] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const passageContainerRef = useRef<HTMLDivElement>(null);

  const [activePassageIdx, setActivePassageIdx] = useState<number>(0);
  const defaultPassage: Passage = { id: 'passage-1', passageNumber: 1, title: 'Reading Passage 1', content: '', questions: [] };
  const passagesToRender = (allPassages && allPassages.length > 0) ? allPassages : (passage ? [passage] : [defaultPassage]);
  const currentPassage = passagesToRender[activePassageIdx] || passagesToRender[0] || defaultPassage;

  // 1. Debounced Local Autosave
  const storageKey = `ielts_answers_${passagesToRender[0]?.id || 'default'}`;
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setUserAnswers(JSON.parse(saved));
      } catch (e) {}
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(userAnswers));
    if (onAnswerChange) onAnswerChange(userAnswers);
  }, [userAnswers, storageKey, onAnswerChange]);

  // Passage Text Selection Toolbar Handler
  const handlePassageTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      setSelectedText(text);

      if (selection.rangeCount > 0) {
        setSelectionRange(selection.getRangeAt(0));
      }

      setTextMenuPos({ x: e.clientX, y: Math.max(10, e.clientY - 50) });
      setShowTextMenu(true);
    } else {
      setShowTextMenu(false);
    }
  };

  const addHighlight = (style: 'highlight' | 'underline' = 'highlight') => {
    if (!selectedText) return;
    const newHl: HighlightItem = {
      id: `hl-${Date.now()}`,
      text: selectedText,
      style,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHighlights([...highlights, newHl]);
    setShowTextMenu(false);
  };

  const addNoteWithText = () => {
    if (!selectedText || !noteInput.trim()) return;
    const newHl: HighlightItem = {
      id: `hl-${Date.now()}`,
      text: selectedText,
      style: 'highlight',
      note: noteInput.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHighlights([...highlights, newHl]);
    setNoteInput('');
    setIsAddingNote(false);
    setShowTextMenu(false);
  };

  const copyToActiveInput = (text: string) => {
    if (activeQuestionId) {
      setUserAnswers({ ...userAnswers, [activeQuestionId]: text });
    }
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions({ ...flaggedQuestions, [qId]: !flaggedQuestions[qId] });
  };

  // Extract all questions in current passage for rendering
  const sectionsList: QuestionSection[] = currentPassage.sections || [
    {
      id: 'sec-default',
      orderIndex: 0,
      type: 'multiple_choice_single' as QuestionType,
      instructions: '',
      questions: currentPassage.questions || [],
    },
  ];

  // Extract all 40 questions across ALL passages for the bottom navigation dock
  const allGlobalQuestions = passagesToRender.flatMap((p, pIdx) => {
    const secs = p.sections || [{ questions: p.questions || [] }];
    return secs.flatMap(s => s.questions.map(q => ({
      ...q,
      passageIndex: pIdx
    })));
  });

  const navigatorItems: NavigatorQuestionItem[] = allGlobalQuestions.map(q => ({
    id: q.id,
    questionNumber: q.questionNumber || 1,
    isAnswered: Boolean(userAnswers[q.id]),
    isFlagged: Boolean(flaggedQuestions[q.id]),
    passageOrPartIndex: (q as any).passageIndex
  }));

  const handleSelectNavigatorQuestion = (item: NavigatorQuestionItem) => {
    if (item.passageOrPartIndex !== undefined && item.passageOrPartIndex !== activePassageIdx) {
      setActivePassageIdx(item.passageOrPartIndex);
      setTimeout(() => {
        setActiveQuestionId(item.id);
        const el = document.getElementById(`question-card-${item.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } else {
      setActiveQuestionId(item.id);
      const el = document.getElementById(`question-card-${item.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="relative h-full flex flex-col font-sans select-none bg-slate-100 overflow-hidden">
      {/* 🙈 SCREEN HIDE OVERLAY */}
      {isScreenHidden && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center text-white space-y-4">
          <EyeOff className="w-16 h-16 text-emerald-400 animate-pulse" />
          <h2 className="text-2xl font-extrabold tracking-tight">Exam Screen Hidden</h2>
          <p className="text-sm text-slate-400">Click below to resume your IELTS exam session.</p>
          <button
            onClick={() => setIsScreenHidden(false)}
            className="px-6 py-3 bg-[#005C53] hover:bg-emerald-600 font-bold rounded-2xl transition-all shadow-lg text-sm"
          >
            Resume Exam
          </button>
        </div>
      )}

      {/* ❓ HELP GUIDE MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-[#005C53]" />
                <span>Computer-Delivered IELTS Instructions</span>
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p>• <strong>Highlighting:</strong> Select text in the reading passage to highlight or add sticky notes.</p>
              <p>• <strong>Copying Text:</strong> Click "Copy to Answer" on selected text to paste directly into completion boxes.</p>
              <p>• <strong>Navigation Dock:</strong> Click any question number 1–40 in the bottom dock to scroll to that question.</p>
              <p>• <strong>Flagging:</strong> Click "Mark for Review" on any question to return to it before final submission.</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setShowHelpModal(false)} className="px-5 py-2 bg-[#005C53] text-white font-bold rounded-xl text-xs">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="bg-white px-6 py-2.5 border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0 select-none">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 hidden md:flex">
            <span className="font-extrabold text-slate-900 text-sm">{currentPassage.title}</span>
          </div>

          {/* Passage Switcher Tabs */}
          {passagesToRender.length > 1 && (
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
              {passagesToRender.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActivePassageIdx(idx)}
                  className={`px-4 py-1.5 text-xs font-extrabold rounded-full transition-all ${
                    activePassageIdx === idx
                      ? 'bg-[#005C53] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Passage {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Notepad Toggle Button */}
          <button
            onClick={() => setShowNotepad(!showNotepad)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showNotepad
                ? 'bg-[#005C53] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Open Exam Notepad & Highlights List"
          >
            <StickyNote className="w-4 h-4 text-amber-500" />
            <span>Notepad {highlights.length > 0 ? `(${highlights.length})` : ''}</span>
          </button>

          <button
            onClick={() => setIsScreenHidden(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
          >
            <EyeOff className="w-4 h-4 text-slate-600" />
            <span>Hide Screen</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#005C53]" />
            <span>Help</span>
          </button>
        </div>
      </div>

      {/* MAIN SPLIT-SCREEN VIEWPORT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        {/* LEFT COLUMN: PASSAGE (Independently Scrollable + Selection Tools) */}
        <div
          ref={passageContainerRef}
          onMouseUp={handlePassageTextSelection}
          className="lg:col-span-6 bg-white p-6 md:p-8 overflow-y-auto border-r border-slate-200 leading-relaxed font-serif text-slate-900 text-base select-text relative"
        >
          {/* FLOATING TEXT SELECTION TOOLBAR */}
          {showTextMenu && (
            <div
              style={{ left: `${textMenuPos.x}px`, top: `${textMenuPos.y}px` }}
              className="fixed z-40 bg-slate-900 text-white p-1.5 rounded-2xl shadow-xl flex items-center space-x-1 text-xs font-sans animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                onClick={() => addHighlight('highlight')}
                className="flex items-center space-x-1 bg-yellow-400 text-slate-900 px-2.5 py-1 rounded-xl hover:bg-yellow-300 transition-colors font-bold"
                title="Highlight in yellow"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>Highlight</span>
              </button>

              <button
                onClick={() => addHighlight('underline')}
                className="flex items-center space-x-1 bg-sky-500 text-white px-2.5 py-1 rounded-xl hover:bg-sky-400 transition-colors font-bold"
                title="Underline text"
              >
                <Underline className="w-3.5 h-3.5" />
                <span>Underline</span>
              </button>

              <button
                onClick={() => setIsAddingNote(true)}
                className="flex items-center space-x-1 bg-emerald-700 text-white px-2.5 py-1 rounded-xl hover:bg-emerald-600 transition-colors font-bold"
                title="Add a note to this selection"
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>

              {activeQuestionId && (
                <button
                  onClick={() => {
                    copyToActiveInput(selectedText);
                    setShowTextMenu(false);
                  }}
                  className="flex items-center space-x-1 bg-slate-800 text-slate-200 px-2.5 py-1 rounded-xl hover:bg-slate-700 transition-colors font-bold"
                  title="Copy selected text into current question"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              )}
            </div>
          )}

          {/* Sticky Note Creation Box */}
          {isAddingNote && (
            <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-300 shadow-md space-y-2 text-xs font-sans mb-4">
              <div className="font-bold text-yellow-900">Add Sticky Note for selected text:</div>
              <div className="p-2 bg-yellow-100/70 rounded-lg text-slate-700 italic border border-yellow-200">
                "{selectedText}"
              </div>
              <input
                type="text"
                value={noteInput}
                placeholder="Type your note here..."
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-yellow-400 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-sans"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setIsAddingNote(false)} className="px-3 py-1 text-slate-600">Cancel</button>
                <button onClick={addNoteWithText} className="px-3 py-1 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400">Save Note</button>
              </div>
            </div>
          )}


          {/* Optional Passage Diagram Image (TOP) */}
          {currentPassage.diagramUrl && (!currentPassage.imagePosition || currentPassage.imagePosition === 'top') && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3 text-center">
              <img src={currentPassage.diagramUrl} alt="Passage Diagram" className="w-full h-auto mx-auto object-contain rounded-xl" />
            </div>
          )}

          {/* Passage Paragraphs */}
          {currentPassage.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 tracking-normal text-slate-800 leading-relaxed">
              {paragraph}
            </p>
          ))}

          {/* Optional Passage Diagram Image (BOTTOM) */}
          {currentPassage.diagramUrl && currentPassage.imagePosition === 'bottom' && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3 text-center">
              <img src={currentPassage.diagramUrl} alt="Passage Diagram" className="w-full h-auto mx-auto object-contain rounded-xl" />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: QUESTIONS FOR ALL 14 SECTIONS */}
        <div className="lg:col-span-6 bg-slate-50 p-6 md:p-8 overflow-y-auto space-y-6 pb-28">
          {sectionsList.map((sec, secIdx) => (
            <div key={sec.id} className="space-y-4">
              {/* Section Header */}
              {sec.instructions && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div className="text-xs font-extrabold text-[#005C53] uppercase tracking-wider">
                    {sec.title || `Section ${secIdx + 1}`}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 italic">
                    {sec.instructions}
                  </div>
                </div>
              )}

              {/* Official YES / NO / NOT GIVEN Instructions Box */}
              {sec.type === 'yes_no_ng' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-300 shadow-sm font-sans space-y-2 text-xs border-l-4 border-l-[#005C53]">
                  <div className="grid grid-cols-12 gap-2 items-center py-0.5">
                    <span className="col-span-3 font-black text-slate-900">YES</span>
                    <span className="col-span-9 text-slate-700 font-medium">if the statement agrees with the claims of the writer</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center py-0.5 border-t border-slate-100 pt-1.5">
                    <span className="col-span-3 font-black text-slate-900">NO</span>
                    <span className="col-span-9 text-slate-700 font-medium">if the statement contradicts the claims of the writer</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center py-0.5 border-t border-slate-100 pt-1.5">
                    <span className="col-span-3 font-black text-slate-900">NOT GIVEN</span>
                    <span className="col-span-9 text-slate-700 font-medium">if it is impossible to say what the writer thinks about this</span>
                  </div>
                </div>
              )}

              {/* Official TRUE / FALSE / NOT GIVEN Instructions Box */}
              {sec.type === 'true_false_ng' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-300 shadow-sm font-sans space-y-2 text-xs border-l-4 border-l-[#005C53]">
                  <div className="grid grid-cols-12 gap-2 items-center py-0.5">
                    <span className="col-span-3 font-black text-slate-900">TRUE</span>
                    <span className="col-span-9 text-slate-700 font-medium">if the statement agrees with the information</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center py-0.5 border-t border-slate-100 pt-1.5">
                    <span className="col-span-3 font-black text-slate-900">FALSE</span>
                    <span className="col-span-9 text-slate-700 font-medium">if the statement contradicts the information</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center py-0.5 border-t border-slate-100 pt-1.5">
                    <span className="col-span-3 font-black text-slate-900">NOT GIVEN</span>
                    <span className="col-span-9 text-slate-700 font-medium">if there is no information on this</span>
                  </div>
                </div>
              )}

              {/* SUMMARY COMPLETION & NOTE COMPLETION OFFICIAL IELTS CARD */}
              {(sec.type === 'summary_completion' || sec.type === 'note_completion') && (
                <div className="p-6 bg-white rounded-3xl border border-slate-300 shadow-sm space-y-5 font-sans">
                  {/* Summary Title */}
                  {sec.summaryTitle && (
                    <h3 className="font-black text-slate-900 text-base leading-snug">
                      {sec.summaryTitle}
                    </h3>
                  )}

                  {/* Flowing Paragraph Text with Inline Inputs/Dropdowns */}
                  {sec.summaryText && (() => {
                    const parts = sec.summaryText.split(/(\[\[GAP(?::\d+)?\]\])/g);
                    let autoIndex = 0;
                    const gapCounts: Record<string, number> = {};

                    return (
                      <div className="text-slate-900 font-serif leading-relaxed text-sm md:text-base bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                        {parts.map((part, idx) => {
                          if (part.startsWith('[[GAP')) {
                            const match = part.match(/\[\[GAP(?::(\d+))?\]\]/);
                            let targetQIdx = autoIndex;
                            if (match && match[1]) {
                              targetQIdx = parseInt(match[1]) - 1;
                            } else {
                              autoIndex++;
                            }

                            const matchingQ = sec.questions[targetQIdx];
                            if (!matchingQ) return <span key={idx} className="text-red-500">[Missing Q]</span>;

                            const currentGapIndexForQ = gapCounts[matchingQ.id] || 0;
                            gapCounts[matchingQ.id] = currentGapIndexForQ + 1;

                            const currentVal = Array.isArray(userAnswers[matchingQ.id])
                              ? (userAnswers[matchingQ.id][currentGapIndexForQ] || '')
                              : (currentGapIndexForQ === 0 ? (userAnswers[matchingQ.id] || '') : '');

                            const handleUpdate = (val: string) => {
                              const existingAns = Array.isArray(userAnswers[matchingQ.id])
                                ? [...userAnswers[matchingQ.id]]
                                : (userAnswers[matchingQ.id] !== undefined ? [String(userAnswers[matchingQ.id])] : []);
                              existingAns[currentGapIndexForQ] = val;
                              setUserAnswers({ ...userAnswers, [matchingQ.id]: existingAns });
                            };

                            return (
                              <span key={idx} className="inline-flex items-center space-x-1 font-sans mx-1 align-baseline">
                                {currentGapIndexForQ === 0 && (
                                  <span className="font-bold text-xs text-slate-700 font-mono">({matchingQ.questionNumber})</span>
                                )}
                                {sec.wordBankOptions && sec.wordBankOptions.length > 0 ? (
                                    <select
                                      value={currentVal}
                                      onChange={(e) => handleUpdate(e.target.value)}
                                      className="px-2.5 py-1 bg-white rounded-lg border-2 border-[#005C53] text-xs font-extrabold text-[#005C53] focus:outline-none shadow-2xs cursor-pointer inline-block"
                                    >
                                      <option value="">-- Select --</option>
                                      {sec.wordBankOptions.map((opt, oIdx) => {
                                        const useLetters = sec.wordBankLabelStyle !== 'none';
                                        const letterLabel = String.fromCharCode(65 + oIdx);
                                        const val = useLetters ? `${letterLabel} ${opt}` : opt;
                                        return (
                                          <option key={oIdx} value={val}>
                                            {val}
                                          </option>
                                        );
                                      })}
                                    </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={currentVal}
                                    onChange={(e) => handleUpdate(e.target.value)}
                                    placeholder="..."
                                    className="w-28 px-2.5 py-1 bg-white rounded-lg border-2 border-[#005C53] text-xs font-bold text-slate-900 focus:outline-none shadow-2xs inline-block"
                                  />
                                )}
                              </span>
                            );
                          }
                          return <span key={idx}>{part}</span>;
                        })}
                      </div>
                    );
                  })()}

                  {/* Options / Word Bank Box (A-I) Matching Official IELTS Format */}
                  {sec.wordBankOptions && sec.wordBankOptions.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        List of Words / Options {sec.wordBankLabelStyle !== 'none' && `(A–${String.fromCharCode(64 + sec.wordBankOptions.length)})`}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 font-sans text-xs">
                        {sec.wordBankOptions.map((opt, oIdx) => {
                          const useLetters = sec.wordBankLabelStyle !== 'none';
                          const letterLabel = String.fromCharCode(65 + oIdx);
                          return (
                            <div key={oIdx} className="flex items-center space-x-2 py-0.5">
                              {useLetters && <span className="font-black text-slate-900 w-4 text-left">{letterLabel}</span>}
                              <span className="text-slate-800 font-medium">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paragraphs Pool Box (new matching_headings) */}
              {sec.type === 'matching_headings' && sec.paragraphsPool && sec.paragraphsPool.filter(Boolean).length > 0 && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-emerald-400">List of Paragraphs</div>
                  <div className="flex flex-wrap gap-2 font-sans">
                    {sec.paragraphsPool.filter(Boolean).map((p, idx) => (
                      <span key={idx} className="bg-slate-800 text-emerald-300 px-3 py-1 rounded-xl font-bold border border-slate-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Features Pool Box */}
              {sec.type === 'matching_features' && sec.featuresPool && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-emerald-400">List of Features (Researchers / Dates)</div>
                  <div className="flex flex-wrap gap-2 font-sans">
                    {sec.featuresPool.map((f, idx) => (
                      <span key={f.id} className="bg-slate-800 text-emerald-300 px-3 py-1 rounded-xl font-bold border border-slate-700">
                        {String.fromCharCode(65 + idx)}. {f.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* TYPE 11: DIAGRAM LABELING ANNOTATED CANVAS + QUESTION LIST */}
              {sec.type === 'diagram_labeling' && sec.diagramUrl && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 p-2 text-center">
                    <img src={sec.diagramUrl} alt="Diagram" className="max-h-80 mx-auto object-contain block" />
                    {(sec.diagramPins || []).map((pin) => (
                      <div
                        key={pin.id}
                        style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                        className="absolute -translate-x-1/2 -translate-y-full z-10"
                      >
                        <span className="bg-red-600 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-lg border-2 border-white">
                          {pin.pinNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Choice Multi (List Selection) Section-Level Card */}
              {sec.type === 'multiple_choice_multi' && sec.questions.length > 0 && (
                <div
                  id={`question-card-${sec.questions[0].id}`}
                  className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${
                    sec.questions.some(q => q.id === activeQuestionId)
                      ? 'border-[#005C53] ring-2 ring-[#005C53]/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-900 text-white font-extrabold text-xs px-3 py-1 rounded-xl flex items-center justify-center">
                        Questions {sec.questions[0].questionNumber} - {sec.questions[sec.questions.length - 1].questionNumber}
                      </span>
                    </div>
                  </div>

                  {sec.questions[0]?.prompt && (
                    <p className="font-bold text-slate-900 text-base leading-snug">
                      {sec.questions[0].prompt}
                    </p>
                  )}
                  
                  <div className="text-xs font-bold text-amber-700 bg-amber-50 inline-block px-2.5 py-1 rounded-lg border border-amber-200 mb-2">
                    Instruction: Choose {sec.requiredSelectionCount || 2} letters
                  </div>

                  <div className="space-y-2 pt-1">
                    {(sec.wordBankOptions || []).map((opt, idx) => {
                      const selectedQuestions = sec.questions.filter(q => userAnswers[q.id] === opt);
                      const isChecked = selectedQuestions.length > 0;
                      
                      const totalSelected = sec.questions.filter(q => userAnswers[q.id]).length;
                      const isMaxReached = totalSelected >= (sec.requiredSelectionCount || 2) && !isChecked;
                      
                      const letter = String.fromCharCode(65 + idx);

                      return (
                        <button
                          key={opt}
                          disabled={isMaxReached}
                          onClick={() => {
                            const newAnswers = { ...userAnswers };
                            if (isChecked) {
                              selectedQuestions.forEach(q => {
                                delete newAnswers[q.id];
                              });
                            } else {
                              const emptyQ = sec.questions.find(q => !newAnswers[q.id]);
                              if (emptyQ) {
                                newAnswers[emptyQ.id] = opt;
                              }
                            }
                            setUserAnswers(newAnswers);
                          }}
                          className={`w-full text-left p-3.5 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between ${
                            isChecked
                              ? 'bg-[#005C53] text-white border-[#005C53]'
                              : isMaxReached
                              ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                              isChecked ? 'bg-white text-[#005C53] shadow-sm' : isMaxReached ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {letter}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isChecked && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Invisible scroll anchors for remaining questions */}
                  {sec.questions.slice(1).map(q => (
                    <div key={q.id} id={`question-card-${q.id}`} className="hidden" />
                  ))}
                </div>
              )}


              {/* Questions List */}
              {sec.questions.map((q) => {
                if (sec.type === 'multiple_choice_multi') return null;
                if (sec.type === 'note_completion' || sec.type === 'summary_completion') {
                  return <div key={q.id} id={`question-card-${q.id}`} className="hidden" />;
                }

                const isFlagged = flaggedQuestions[q.id];
                const studentAns = userAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    id={`question-card-${q.id}`}
                    onClick={() => setActiveQuestionId(q.id)}
                    className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${
                      activeQuestionId === q.id
                        ? 'border-[#005C53] ring-2 ring-[#005C53]/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                          {q.questionNumber}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleFlag(q.id)}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isFlagged ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-slate-900' : ''}`} />
                        <span>{isFlagged ? 'Flagged' : 'Mark for Review'}</span>
                      </button>
                    </div>

                    <p className="font-bold text-slate-900 text-base leading-snug">{q.prompt}</p>

                    {/* Question Renderers */}

                    {/* 1. Multiple Choice Single */}
                    {sec.type === 'multiple_choice_single' && q.options && (
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, idx) => {
                          const isSelected = studentAns === opt;
                          const letter = String.fromCharCode(65 + idx);
                          return (
                            <button
                              key={opt}
                              onClick={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                              className={`w-full text-left p-3.5 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between ${
                                isSelected ? 'bg-[#005C53] text-white border-[#005C53]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                                  isSelected ? 'bg-white text-[#005C53] shadow-sm' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {letter}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {/* (Multiple Choice Multi is handled at the section level above) */}
                    {/* 3. True/False/Not Given & Yes/No/Not Given */}
                    {(sec.type === 'true_false_ng' || sec.type === 'yes_no_ng') && (
                      <div className="flex space-x-3 pt-2">
                        {(q.options || (sec.type === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'])).map((val) => {
                          const isSelected = studentAns === val;
                          return (
                            <button
                              key={val}
                              onClick={() => setUserAnswers({ ...userAnswers, [q.id]: val })}
                              className={`flex-1 py-3 rounded-2xl text-xs font-extrabold transition-all border ${
                                isSelected ? 'bg-[#005C53] text-white border-[#005C53] shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 4. Free-Text & Gap Fill Inputs */}
                    {(sec.type === 'sentence_completion' ||
                      sec.type === 'table_completion' ||
                      sec.type === 'flow_chart_completion' ||
                      sec.type === 'diagram_labeling' ||
                      sec.type === 'matching_information' ||
                      sec.type === 'short_answer') && (
                      <div className="space-y-2 pt-1">
                        {sec.provideWordBank && sec.wordBankOptions ? (
                          <div className="space-y-2">
                            {Array.from({ length: Array.isArray(q.correctAnswer) ? q.correctAnswer.length : 1 }).map((_, gIdx, arr) => {
                              const currentVal = Array.isArray(userAnswers[q.id])
                                ? (userAnswers[q.id][gIdx] || '')
                                : (gIdx === 0 ? (userAnswers[q.id] || '') : '');
                              
                              return (
                                <select
                                  key={gIdx}
                                  value={currentVal}
                                  onChange={(e) => {
                                    if (arr.length > 1) {
                                      const existing = Array.isArray(userAnswers[q.id]) ? [...userAnswers[q.id]] : [String(userAnswers[q.id] || '')];
                                      existing[gIdx] = e.target.value;
                                      setUserAnswers({ ...userAnswers, [q.id]: existing });
                                    } else {
                                      setUserAnswers({ ...userAnswers, [q.id]: e.target.value });
                                    }
                                  }}
                                  className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-bold text-[#005C53] bg-white focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                                >
                                  <option value="">-- Select from Word Bank {arr.length > 1 ? `(Gap ${gIdx + 1})` : ''} --</option>
                                  {sec.wordBankOptions?.map((wOpt, wIdx) => (
                                    <option key={wIdx} value={wOpt}>
                                      {wOpt}
                                    </option>
                                  ))}
                                </select>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {Array.from({ length: Array.isArray(q.correctAnswer) ? q.correctAnswer.length : 1 }).map((_, gIdx, arr) => {
                              const currentVal = Array.isArray(userAnswers[q.id])
                                ? (userAnswers[q.id][gIdx] || '')
                                : (gIdx === 0 ? (userAnswers[q.id] || '') : '');
                              
                              return (
                                <input
                                  key={gIdx}
                                  type="text"
                                  value={currentVal}
                                  onChange={(e) => {
                                    if (arr.length > 1) {
                                      const existing = Array.isArray(userAnswers[q.id]) ? [...userAnswers[q.id]] : [String(userAnswers[q.id] || '')];
                                      existing[gIdx] = e.target.value;
                                      setUserAnswers({ ...userAnswers, [q.id]: existing });
                                    } else {
                                      setUserAnswers({ ...userAnswers, [q.id]: e.target.value });
                                    }
                                  }}
                                  placeholder={arr.length > 1 ? `Type answer for gap ${gIdx + 1}...` : "Type your answer..."}
                                  className="w-full p-3.5 rounded-2xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                                />
                              );
                            })}
                            {sec.wordLimit && (
                              <span className="block text-[10px] text-slate-400 mt-1 font-semibold">
                                Word Limit: {sec.wordLimit}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. Matching Headings — pick a paragraph for each heading */}
                    {sec.type === 'matching_headings' && sec.paragraphsPool && (
                      <select
                        value={studentAns || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-bold text-[#005C53] bg-white focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                      >
                        <option value="">-- Select Paragraph --</option>
                        {sec.paragraphsPool.filter(Boolean).map((p, pIdx) => {
                          const isUsedElsewhere = sec.usedOnceOnly &&
                            sec.questions.some(oq => oq.id !== q.id && userAnswers[oq.id] === p);
                          return (
                            <option key={pIdx} value={p} disabled={isUsedElsewhere}>
                              {p}{isUsedElsewhere ? ' (Already Selected)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    {/* 6. Matching Features */}
                    {sec.type === 'matching_features' && sec.featuresPool && (
                      <select
                        value={studentAns || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-bold text-[#005C53] bg-white focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                      >
                        <option value="">-- Select Matching Feature --</option>
                        {sec.featuresPool.map((f, fIdx) => {
                          const labelStr = `${String.fromCharCode(65 + fIdx)}. ${f.text}`;
                          const isUsedElsewhere = sec.usedOnceOnly && Object.values(userAnswers).includes(labelStr) && studentAns !== labelStr;
                          return (
                            <option key={f.id} value={labelStr} disabled={isUsedElsewhere}>
                              {labelStr} {isUsedElsewhere ? '(Already Selected)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    {/* 7. Matching Sentence Endings */}
                    {sec.type === 'matching_sentence_endings' && sec.sentenceEndingsPool && (
                      <select
                        value={studentAns || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-bold text-[#005C53] bg-white focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                      >
                        <option value="">-- Select Matching Ending --</option>
                        {sec.sentenceEndingsPool.map((e, eIdx) => {
                          const labelStr = `${String.fromCharCode(65 + eIdx)}. ${e.text}`;
                          return (
                            <option key={e.id} value={labelStr}>
                              {labelStr}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* NOTEPAD & HIGHLIGHTS SLIDE-OUT DRAWER */}
        {showNotepad && (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white border-l border-slate-300 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StickyNote className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Exam Notepad & Notes</h3>
              </div>
              <button
                onClick={() => setShowNotepad(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              {/* Free Scratchpad */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Quick Scratchpad / Rough Notes
                </label>
                <textarea
                  value={freeNotes}
                  onChange={(e) => setFreeNotes(e.target.value)}
                  placeholder="Type any quick thoughts, reminders, or drafts here..."
                  className="w-full h-28 p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005C53] text-slate-900 resize-none font-sans text-xs"
                />
              </div>

              {/* Highlights & Text Notes List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                    Passage Highlights ({highlights.length})
                  </label>
                  {highlights.length > 0 && (
                    <button
                      onClick={() => setHighlights([])}
                      className="text-[10px] text-red-600 hover:underline font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {highlights.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    <Highlighter className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs">No highlights yet.</p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      Select text in the passage on the left to highlight or add sticky notes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {highlights.map((hl) => (
                      <div
                        key={hl.id}
                        className={`p-3 rounded-xl border space-y-1.5 ${
                          hl.style === 'underline'
                            ? 'bg-sky-50 border-sky-200 text-sky-950'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-950'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            hl.style === 'underline' ? 'bg-sky-200 text-sky-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {hl.style === 'underline' ? 'Underlined' : 'Highlighted'}
                          </span>
                          <button
                            onClick={() => setHighlights(highlights.filter((h) => h.id !== hl.id))}
                            className="text-slate-400 hover:text-red-500 p-0.5"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs italic leading-snug">"{hl.text}"</p>
                        {hl.note && (
                          <div className="pt-1 border-t border-yellow-200/80 font-semibold text-xs flex items-start space-x-1">
                            <span className="text-slate-500">Note:</span>
                            <span className="text-slate-900">{hl.note}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUESTION NAVIGATOR DOCK */}
      <QuestionNavigator
        questions={navigatorItems}
        activeQuestionId={activeQuestionId}
        onSelectQuestion={handleSelectNavigatorQuestion}
        onToggleFlag={toggleFlag}
        title="Reading Questions"
      />
    </div>
  );
}

