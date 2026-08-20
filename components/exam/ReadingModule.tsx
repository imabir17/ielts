'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Passage, QuestionSection, Question, QuestionType } from '@/lib/mock-data';
import {
  Flag, HelpCircle, EyeOff, CheckCircle2, Highlighter, StickyNote, X, ZoomIn, ZoomOut, Type
} from 'lucide-react';

interface ReadingModuleProps {
  passage: Passage;
  allPassages?: Passage[];
  onAnswerChange?: (answers: Record<string, any>) => void;
}

interface HighlightItem {
  id: string;
  text: string;
  note?: string;
}

export function ReadingModule({ passage, allPassages, onAnswerChange }: ReadingModuleProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Tools & Passage View Settings
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [showTextMenu, setShowTextMenu] = useState<boolean>(false);
  const [textMenuPos, setTextMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [passageFontSize, setPassageFontSize] = useState<number>(15); // 14, 15, 17, 19

  // Split-Screen Drag State
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Modals & Overlays
  const [isScreenHidden, setIsScreenHidden] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const passageContainerRef = useRef<HTMLDivElement>(null);

  const [activePassageIdx, setActivePassageIdx] = useState<number>(0);
  const passagesToRender = allPassages && allPassages.length > 0 ? allPassages : (passage ? [passage] : []);
  const currentPassage = passagesToRender[activePassageIdx] || passagesToRender[0];

  // Autosave
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

  // Dragging Listener for Resizable Split Pane
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const totalWidth = window.innerWidth;
      const newPercent = Math.min(Math.max((e.clientX / totalWidth) * 100, 25), 75);
      setSplitPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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

  const addHighlight = () => {
    if (!selectedText) return;
    const newHl: HighlightItem = { id: `hl-${Date.now()}`, text: selectedText };
    setHighlights([...highlights, newHl]);
    setShowTextMenu(false);
  };

  const addNoteWithText = () => {
    if (!selectedText || !noteInput.trim()) return;
    const newHl: HighlightItem = { id: `hl-${Date.now()}`, text: selectedText, note: noteInput.trim() };
    setHighlights([...highlights, newHl]);
    setNoteInput('');
    setIsAddingNote(false);
    setShowTextMenu(false);
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions({ ...flaggedQuestions, [qId]: !flaggedQuestions[qId] });
  };

  if (!currentPassage) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 font-medium">
        No reading passages available in this test.
      </div>
    );
  }

  // Extract all questions in current passage for rendering
  const sectionsList: QuestionSection[] = currentPassage?.sections || [
    {
      id: 'sec-default',
      orderIndex: 0,
      type: 'multiple_choice_single' as QuestionType,
      instructions: '',
      questions: currentPassage?.questions || [],
    },
  ];

  // Extract all questions across ALL passages for the bottom navigation dock
  const allGlobalQuestions = passagesToRender.flatMap((p, pIdx) => {
    const secs = p?.sections || [{ questions: p?.questions || [] }];
    return secs.flatMap(s => (s?.questions || []).map(q => ({ ...q, passageIdx: pIdx })));
  });

  return (
    <div className="relative h-full flex flex-col font-sans select-none bg-slate-100 overflow-hidden">
      {/* 🙈 SCREEN HIDE OVERLAY */}
      {isScreenHidden && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center text-white space-y-4">
          <EyeOff className="w-12 h-12 text-slate-300 animate-pulse" />
          <h2 className="text-xl font-bold tracking-tight">Test Screen Hidden</h2>
          <p className="text-xs text-slate-400">Click below to resume your IELTS exam session.</p>
          <button
            onClick={() => setIsScreenHidden(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-[2px] border border-slate-600 transition-all text-xs"
          >
            Resume Test
          </button>
        </div>
      )}

      {/* ❓ HELP GUIDE MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2px] p-6 max-w-lg w-full space-y-4 border border-slate-400 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-slate-700" />
                <span>Reading Test Instructions & Shortcuts</span>
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-sans">
              <p>• <strong>Navigation:</strong> Use the buttons 1–40 in the bottom toolbar to navigate directly to any question.</p>
              <p>• <strong>Review Flag:</strong> Click "Review" on a question to mark it so you can return to it later.</p>
              <p>• <strong>Highlighting:</strong> Highlight text by selecting passage text with your mouse.</p>
              <p>• <strong>Divider:</strong> Click and drag the vertical bar between the passage and questions to resize the view.</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setShowHelpModal(false)} className="px-4 py-1.5 bg-slate-800 text-white font-semibold rounded-[2px] text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="bg-white px-4 py-2 border-b border-slate-300 flex items-center justify-between shrink-0 select-none text-xs">
        <div className="flex items-center space-x-4">
          {/* Passage Switcher Tabs */}
          {passagesToRender.length > 1 && (
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-[2px] border border-slate-300">
              {passagesToRender.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActivePassageIdx(idx)}
                  className={`px-3 py-1 text-xs font-semibold rounded-[2px] transition-colors ${
                    activePassageIdx === idx
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Passage {idx + 1}
                </button>
              ))}
            </div>
          )}
          <span className="font-semibold text-slate-800 hidden md:inline truncate max-w-md">{currentPassage.title}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Passage Zoom Controls */}
          <div className="flex items-center space-x-1 border border-slate-300 rounded-[2px] bg-slate-50 px-1 py-0.5">
            <button
              onClick={() => setPassageFontSize(prev => Math.max(13, prev - 1))}
              className="px-1.5 py-0.5 hover:bg-slate-200 rounded-[2px] font-bold text-slate-700 text-xs"
              title="Decrease Font Size"
            >
              A−
            </button>
            <span className="text-[11px] text-slate-500 font-mono px-1">Text</span>
            <button
              onClick={() => setPassageFontSize(prev => Math.min(20, prev + 1))}
              className="px-1.5 py-0.5 hover:bg-slate-200 rounded-[2px] font-bold text-slate-700 text-xs"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <button
            onClick={() => setIsScreenHidden(true)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-[2px] text-xs font-medium text-slate-700 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
            <span>Hide</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-[2px] text-xs font-medium text-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
            <span>Help</span>
          </button>
        </div>
      </div>

      {/* MAIN RESIZABLE SPLIT-SCREEN VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: PASSAGE (Independently Scrollable) */}
        <div
          ref={passageContainerRef}
          onMouseUp={handlePassageTextSelection}
          style={{ width: `${splitPercent}%` }}
          className="bg-white p-6 md:p-8 overflow-y-auto font-serif text-slate-900 select-text relative h-full border-r border-slate-300"
        >
          {/* FLOATING TEXT SELECTION TOOLBAR */}
          {showTextMenu && (
            <div
              style={{ left: `${textMenuPos.x}px`, top: `${textMenuPos.y}px` }}
              className="fixed z-40 bg-slate-900 text-white p-1 rounded-[2px] shadow-lg flex items-center space-x-1 text-xs font-sans"
            >
              <button
                onClick={addHighlight}
                className="flex items-center space-x-1 bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-[2px] font-semibold text-xs"
              >
                <Highlighter className="w-3 h-3" />
                <span>Highlight</span>
              </button>

              <button
                onClick={() => setIsAddingNote(true)}
                className="flex items-center space-x-1 bg-slate-800 text-white px-2 py-0.5 rounded-[2px] font-semibold text-xs border border-slate-700"
              >
                <StickyNote className="w-3 h-3" />
                <span>Note</span>
              </button>
            </div>
          )}

          {/* Sticky Note Input */}
          {isAddingNote && (
            <div className="p-3 bg-yellow-50 rounded-[2px] border border-yellow-400 space-y-2 text-xs font-sans mb-4">
              <div className="font-semibold text-yellow-950">Add Sticky Note:</div>
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-2.5 py-1 rounded-[2px] border border-yellow-400 text-xs bg-white text-slate-900 focus:outline-none"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setIsAddingNote(false)} className="px-2.5 py-0.5 text-slate-600">Cancel</button>
                <button onClick={addNoteWithText} className="px-2.5 py-0.5 bg-yellow-500 text-slate-950 font-semibold rounded-[2px]">Save</button>
              </div>
            </div>
          )}

          {/* Optional Passage Diagram (TOP) */}
          {currentPassage.diagramUrl && (!currentPassage.imagePosition || currentPassage.imagePosition === 'top') && (
            <div className="mb-6 rounded-[2px] overflow-hidden border border-slate-300 bg-slate-50 p-2 text-center">
              <img src={currentPassage.diagramUrl} alt="Passage Diagram" className="w-full h-auto mx-auto object-contain" />
            </div>
          )}

          {/* Passage Paragraphs */}
          <div style={{ fontSize: `${passageFontSize}px`, lineHeight: 1.7 }} className="text-slate-850">
            {currentPassage.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>


          {/* Optional Passage Diagram (BOTTOM) */}
          {currentPassage.diagramUrl && currentPassage.imagePosition === 'bottom' && (
            <div className="mt-6 rounded-[2px] overflow-hidden border border-slate-300 bg-slate-50 p-2 text-center">
              <img src={currentPassage.diagramUrl} alt="Passage Diagram" className="w-full h-auto mx-auto object-contain" />
            </div>
          )}
        </div>

        {/* DRAGGABLE RESIZER HANDLE */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="w-2 bg-slate-200 hover:bg-blue-600 active:bg-blue-700 cursor-col-resize flex items-center justify-center transition-colors z-20 shrink-0 select-none border-x border-slate-300"
          title="Click and drag to resize panes"
        >
          <div className="h-8 w-0.5 bg-slate-400 rounded-full" />
        </div>

        {/* RIGHT COLUMN: QUESTIONS */}
        <div
          style={{ width: `${100 - splitPercent}%` }}
          className="bg-slate-100 p-5 md:p-6 overflow-y-auto space-y-5 pb-28 h-full"
        >
          {sectionsList.map((sec, secIdx) => (
            <div key={sec.id} className="space-y-3">
              {/* Section Header */}
              {sec.instructions && (
                <div className="p-3.5 bg-white rounded-[2px] border border-slate-300 space-y-1">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {sec.title || `Section ${secIdx + 1}`}
                  </div>
                  <div className="text-xs text-slate-600 italic">
                    {sec.instructions}
                  </div>
                </div>
              )}

              {/* Official YES / NO / NOT GIVEN Instructions Box */}
              {sec.type === 'yes_no_ng' && (
                <div className="p-3 bg-white rounded-[2px] border border-slate-300 font-sans space-y-1.5 text-xs">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-3 font-bold text-slate-900">YES</span>
                    <span className="col-span-9 text-slate-700">if the statement agrees with the claims of the writer</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center border-t border-slate-100 pt-1">
                    <span className="col-span-3 font-bold text-slate-900">NO</span>
                    <span className="col-span-9 text-slate-700">if the statement contradicts the claims of the writer</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center border-t border-slate-100 pt-1">
                    <span className="col-span-3 font-bold text-slate-900">NOT GIVEN</span>
                    <span className="col-span-9 text-slate-700">if it is impossible to say what the writer thinks about this</span>
                  </div>
                </div>
              )}

              {/* Official TRUE / FALSE / NOT GIVEN Instructions Box */}
              {sec.type === 'true_false_ng' && (
                <div className="p-3 bg-white rounded-[2px] border border-slate-300 font-sans space-y-1.5 text-xs">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-3 font-bold text-slate-900">TRUE</span>
                    <span className="col-span-9 text-slate-700">if the statement agrees with the information</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center border-t border-slate-100 pt-1">
                    <span className="col-span-3 font-bold text-slate-900">FALSE</span>
                    <span className="col-span-9 text-slate-700">if the statement contradicts the information</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center border-t border-slate-100 pt-1">
                    <span className="col-span-3 font-bold text-slate-900">NOT GIVEN</span>
                    <span className="col-span-9 text-slate-700">if there is no information on this</span>
                  </div>
                </div>
              )}

              {/* SUMMARY COMPLETION & NOTE COMPLETION CARD */}
              {(sec.type === 'summary_completion' || sec.type === 'note_completion') && (
                <div className="p-4 bg-white rounded-[2px] border border-slate-300 space-y-4 font-sans">
                  {sec.summaryTitle && (
                    <h3 className="font-bold text-slate-900 text-sm">
                      {sec.summaryTitle}
                    </h3>
                  )}

                  {sec.summaryText && (() => {
                    const parts = sec.summaryText.split(/(\[\[GAP(?::\d+)?\]\])/g);
                    let autoIndex = 0;
                    const gapCounts: Record<string, number> = {};

                    return (
                      <div className="text-slate-900 font-serif leading-relaxed text-sm bg-slate-50 p-4 rounded-[2px] border border-slate-200">
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
                                    className="px-2 py-0.5 bg-white rounded-[2px] border border-slate-400 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-800 inline-block"
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
                                    className="w-24 px-2 py-0.5 bg-white rounded-[2px] border border-slate-400 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-800 inline-block"
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

                  {/* Options / Word Bank Box (A-I) */}
                  {sec.wordBankOptions && sec.wordBankOptions.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        List of Options {sec.wordBankLabelStyle !== 'none' && `(A–${String.fromCharCode(64 + sec.wordBankOptions.length)})`}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 font-sans text-xs">
                        {sec.wordBankOptions.map((opt, oIdx) => {
                          const useLetters = sec.wordBankLabelStyle !== 'none';
                          const letterLabel = String.fromCharCode(65 + oIdx);
                          return (
                            <div key={oIdx} className="flex items-center space-x-1.5 py-0.5">
                              {useLetters && <span className="font-bold text-slate-900 w-4 text-left font-mono">{letterLabel}</span>}
                              <span className="text-slate-800">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paragraphs Pool Box */}
              {sec.type === 'matching_headings' && sec.paragraphsPool && sec.paragraphsPool.filter(Boolean).length > 0 && (
                <div className="p-3 bg-slate-900 text-white rounded-[2px] space-y-1.5 text-xs">
                  <div className="font-bold text-slate-200">List of Paragraphs</div>
                  <div className="flex flex-wrap gap-1.5 font-sans">
                    {sec.paragraphsPool.filter(Boolean).map((p, idx) => (
                      <span key={idx} className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-[2px] font-semibold border border-slate-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Features Pool Box */}
              {sec.type === 'matching_features' && sec.featuresPool && (
                <div className="p-3 bg-slate-900 text-white rounded-[2px] space-y-1.5 text-xs">
                  <div className="font-bold text-slate-200">List of Features (Researchers / Dates)</div>
                  <div className="flex flex-wrap gap-1.5 font-sans">
                    {sec.featuresPool.map((f, idx) => (
                      <span key={f.id} className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-[2px] font-semibold border border-slate-700">
                        {String.fromCharCode(65 + idx)}. {f.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagram Labeling Canvas */}
              {sec.type === 'diagram_labeling' && sec.diagramUrl && (
                <div className="space-y-3">
                  <div className="relative rounded-[2px] overflow-hidden border border-slate-300 bg-slate-900 p-2 text-center">
                    <img src={sec.diagramUrl} alt="Diagram" className="max-h-72 mx-auto object-contain block" />
                    {(sec.diagramPins || []).map((pin) => (
                      <div
                        key={pin.id}
                        style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                        className="absolute -translate-x-1/2 -translate-y-full z-10"
                      >
                        <span className="bg-slate-900 text-white font-bold text-xs px-1.5 py-0.5 rounded-[2px] border border-white">
                          {pin.pinNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Choice Multi (List Selection) Section Card */}
              {sec.type === 'multiple_choice_multi' && sec.questions.length > 0 && (
                <div
                  id={`question-card-${sec.questions[0].id}`}
                  className={`bg-white p-5 rounded-[2px] border space-y-3 transition-colors ${
                    sec.questions.some(q => q.id === activeQuestionId)
                      ? 'border-blue-600 ring-1 ring-blue-600'
                      : 'border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="bg-slate-800 text-white font-bold text-xs px-2 py-0.5 rounded-[2px] font-mono">
                      Questions {sec.questions[0].questionNumber} – {sec.questions[sec.questions.length - 1].questionNumber}
                    </span>
                    <span className="text-xs text-slate-600 italic">
                      Choose {sec.requiredSelectionCount || 2} letters
                    </span>
                  </div>

                  {sec.questions[0]?.prompt && (
                    <p className="font-semibold text-slate-900 text-sm leading-snug">
                      {sec.questions[0].prompt}
                    </p>
                  )}

                  <div className="space-y-1.5 pt-1">
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
                          className={`w-full text-left p-2.5 rounded-[2px] border text-xs font-medium transition-colors flex items-center justify-between ${
                            isChecked
                              ? 'bg-blue-50/70 border-blue-600 text-blue-950'
                              : isMaxReached
                              ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className={`w-5 h-5 rounded-[2px] flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                              isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}>
                              {letter}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isChecked && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                  
                  {sec.questions.slice(1).map(q => (
                    <div key={q.id} id={`question-card-${q.id}`} className="hidden" />
                  ))}
                </div>
              )}

              {/* Individual Question Cards */}
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
                    className={`bg-white p-4 md:p-5 rounded-[2px] border space-y-3 transition-colors ${
                      activeQuestionId === q.id
                        ? 'border-blue-600 ring-1 ring-blue-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-[2px] bg-slate-800 text-white font-mono text-xs font-semibold flex items-center justify-center">
                          {q.questionNumber}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleFlag(q.id)}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-[2px] text-xs font-medium border transition-colors ${
                          isFlagged ? 'bg-amber-400 text-slate-950 border-amber-500' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Flag className={`w-3 h-3 ${isFlagged ? 'fill-slate-950' : ''}`} />
                        <span>{isFlagged ? 'Review Marked' : 'Review'}</span>
                      </button>
                    </div>

                    <p className="font-semibold text-slate-900 text-sm leading-snug">{q.prompt}</p>

                    {/* Question Renderers */}
                    {/* 1. Multiple Choice Single */}
                    {sec.type === 'multiple_choice_single' && q.options && (
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt, idx) => {
                          const isSelected = studentAns === opt;
                          const letter = String.fromCharCode(65 + idx);
                          return (
                            <button
                              key={opt}
                              onClick={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                              className={`w-full text-left p-2.5 rounded-[2px] border text-xs font-medium transition-colors flex items-center justify-between ${
                                isSelected ? 'bg-blue-50/70 border-blue-600 text-blue-950' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className={`w-5 h-5 rounded-[2px] flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                                  isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-300'
                                }`}>
                                  {letter}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 3. True/False/Not Given & Yes/No/Not Given */}
                    {(sec.type === 'true_false_ng' || sec.type === 'yes_no_ng') && (
                      <div className="flex space-x-2 pt-1">
                        {(q.options || (sec.type === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'])).map((val) => {
                          const isSelected = studentAns === val;
                          return (
                            <button
                              key={val}
                              onClick={() => setUserAnswers({ ...userAnswers, [q.id]: val })}
                              className={`flex-1 py-2 rounded-[2px] text-xs font-semibold transition-colors border ${
                                isSelected ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
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
                          <div className="space-y-1.5">
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
                                  className="w-full px-3 py-1.5 rounded-[2px] border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-slate-800"
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
                          <div className="space-y-1.5">
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
                                  className="w-full px-3 py-1.5 rounded-[2px] border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-slate-800"
                                />
                              );
                            })}
                            {sec.wordLimit && (
                              <span className="block text-[10px] text-slate-500 font-mono">
                                Word Limit: {sec.wordLimit}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. Matching Headings */}
                    {sec.type === 'matching_headings' && sec.paragraphsPool && (
                      <select
                        value={studentAns || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-[2px] border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-slate-800"
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
                        className="w-full px-3 py-1.5 rounded-[2px] border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-slate-800"
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
                        className="w-full px-3 py-1.5 rounded-[2px] border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-slate-800"
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
      </div>

      {/* BOTTOM 1-40 QUESTION NAVIGATION DOCK */}
      <div className="bg-[#0F172A] text-white px-4 py-2 border-t border-slate-800 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center space-x-3 overflow-x-auto py-1">
          {passagesToRender.map((p, pIdx) => {
            const pQuestions = allGlobalQuestions.filter(q => q.passageIdx === pIdx);
            return (
              <div key={p.id} className="flex items-center space-x-1 border-r border-slate-700 pr-3 last:border-r-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-1">
                  Passage {pIdx + 1}
                </span>
                {pQuestions.map((q) => {
                  const qId = q.id;
                  const qNum = q.questionNumber || 1;
                  const isFlagged = flaggedQuestions[qId];
                  const isAnswered = Boolean(userAnswers[qId]);
                  const isActive = activeQuestionId === qId;

                  return (
                    <button
                      key={qId}
                      onClick={() => {
                        if (activePassageIdx !== pIdx) {
                          setActivePassageIdx(pIdx);
                        }
                        setTimeout(() => {
                          setActiveQuestionId(qId);
                          const el = document.getElementById(`question-card-${qId}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className={`relative w-7 h-7 rounded-[2px] font-mono text-xs font-semibold flex items-center justify-center transition-all border ${
                        isActive
                          ? 'outline outline-2 outline-blue-400 outline-offset-1 z-10'
                          : ''
                      } ${
                        isAnswered
                          ? 'bg-slate-700 text-white border-slate-600 font-bold'
                          : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-100'
                      }`}
                      title={`Question ${qNum}${isAnswered ? ' (Answered)' : ''}${isFlagged ? ' (Flagged for Review)' : ''}`}
                    >
                      <span>{qNum}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
