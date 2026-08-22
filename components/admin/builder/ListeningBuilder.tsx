'use client';

import React, { useState, useRef } from 'react';
import { ListeningSection, QuestionSection, DiagramPin, QuestionType } from '@/lib/mock-data';
import { Headphones, Music, CheckCircle2, AlertCircle, Play, Pause, Volume2, Plus, Trash2, ChevronDown, ChevronUp, ListPlus, ArrowUp, ArrowDown } from 'lucide-react';
import { ListeningQuestionEditor } from './ListeningQuestionEditor';

interface ListeningBuilderProps {
  listening: ListeningSection[];
  onChange: (listening: ListeningSection[]) => void;
  globalAudioUrl: string;
  onGlobalAudioUrlChange: (url: string) => void;
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

function renumberListeningSections(listeningList: ListeningSection[]): ListeningSection[] {
  let globalQNum = 1;

  return listeningList.map((lis) => {
    const rawSections = lis.sections || [];
    const renumberedSections = rawSections.map((sec, secIdx) => {
      const updatedQuestions = sec.questions.map((q) => {
        const qNum = globalQNum++;
        return { ...q, questionNumber: qNum };
      });

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

    const allFlatQuestions = renumberedSections.flatMap((s) => s.questions);

    return {
      ...lis,
      sections: renumberedSections,
      questions: allFlatQuestions,
    };
  });
}

export function ListeningBuilder({ listening, onChange, globalAudioUrl, onGlobalAudioUrlChange }: ListeningBuilderProps) {
  const [activePartIdx, setActivePartIdx] = useState<number>(0);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Ensure 4 listening parts exist
  const currentParts: ListeningSection[] = [
    listening[0] || { id: 'lis-sec-1', title: 'Part 1: Conversation in Social Context', duration: 180, questions: [], sections: [] },
    listening[1] || { id: 'lis-sec-2', title: 'Part 2: Monologue in Social Context', duration: 210, questions: [], sections: [] },
    listening[2] || { id: 'lis-sec-3', title: 'Part 3: Conversation in Educational Context', duration: 240, questions: [], sections: [] },
    listening[3] || { id: 'lis-sec-4', title: 'Part 4: Academic Monologue', duration: 300, questions: [], sections: [] },
  ].map((p) => ({
    ...p,
    sections: p.sections || [],
    questions: p.questions || [],
  }));

  const activePart = currentParts[activePartIdx];

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updatePart = (updatedFields: Partial<ListeningSection>) => {
    const newParts = [...currentParts];
    newParts[activePartIdx] = { ...activePart, ...updatedFields };
    const renumbered = renumberListeningSections(newParts);
    onChange(renumbered);
  };

  const handleGlobalAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64Url = ev.target?.result as string;
        if (base64Url) {
          onGlobalAudioUrlChange(base64Url);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const togglePlayAudio = () => {
    if (!audioRef.current || !globalAudioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const addQuestionSection = (type: QuestionType = 'multiple_choice_single') => {
    const secId = `sec-${activePart.id}-${Date.now()}`;
    const newSec: QuestionSection = {
      id: secId,
      sectionNumber: (activePart.sections?.length || 0) + 1,
      type,
      title: `Question Set ${(activePart.sections?.length || 0) + 1}`,
      instructions: 'Answer the questions below.',
      orderIndex: activePart.sections?.length || 0,
      questions: [],
    };

    updatePart({
      sections: [...(activePart.sections || []), newSec],
    });
  };

  const updateQuestionSection = (secId: string, updatedFields: Partial<QuestionSection>) => {
    const newSections = (activePart.sections || []).map((s) => (s.id === secId ? { ...s, ...updatedFields } : s));
    updatePart({ sections: newSections });
  };

  const deleteQuestionSection = (secId: string) => {
    if (!confirm('Are you sure you want to delete this entire question set?')) return;
    const newSections = (activePart.sections || []).filter((s) => s.id !== secId);
    updatePart({ sections: newSections });
  };

  const moveQuestionSection = (secId: string, direction: 'up' | 'down') => {
    const sections = [...(activePart.sections || [])];
    const idx = sections.findIndex((s) => s.id === secId);
    if (idx < 0) return;
    if (direction === 'up' && idx > 0) {
      [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
    } else if (direction === 'down' && idx < sections.length - 1) {
      [sections[idx + 1], sections[idx]] = [sections[idx], sections[idx + 1]];
    }
    updatePart({ sections });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Global Audio Tracker Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base">Master Listening Audio Track (Plays for all sections)</h3>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
            MP3 / WAV
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Global Audio Source URL</label>
              <input
                type="text"
                value={globalAudioUrl}
                onChange={(e) => onGlobalAudioUrlChange(e.target.value)}
                placeholder="https://cdn.example.com/full-listening-test.mp3"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <Music className="w-8 h-8 text-[#005C53] mx-auto" />
              <div className="text-xs font-bold text-slate-700">Upload Master Audio MP3</div>
              <label className="inline-block px-4 py-2 bg-[#005C53] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#003831] shadow-sm">
                <span>Choose Audio File</span>
                <input type="file" accept="audio/*" onChange={handleGlobalAudioUpload} className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            {globalAudioUrl ? (
              <div className="w-full p-4 bg-[#002A25] rounded-2xl text-white space-y-3 shadow-sm border border-emerald-800">
                <div className="text-xs font-bold text-emerald-300 flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-red-400" />
                  <span>In-Builder Audio Player Preview</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlayAudio}
                    className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <span className="text-xs font-mono text-emerald-200">
                    {isPlaying ? 'Playing track...' : 'Ready to preview'}
                  </span>
                </div>
                <audio ref={audioRef} src={globalAudioUrl} onEnded={() => setIsPlaying(false)} />
              </div>
            ) : (
              <div className="w-full p-6 text-center bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800 font-medium">
                ⚠️ No master audio source attached yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parts Tabs (Parts 1 to 4) */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
        {[0, 1, 2, 3].map((idx) => {
          const part = currentParts[idx];
          const isComplete = part.questions.length > 0;
          return (
            <button
              key={idx}
              onClick={() => {
                setActivePartIdx(idx);
                setIsPlaying(false);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activePartIdx === idx
                  ? 'bg-[#005C53] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Part {idx + 1}</span>
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />
              ) : (
                <span title="Missing questions">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 ml-1" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base">Part {activePartIdx + 1} Metadata</h3>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Part Title</label>
          <input
            type="text"
            value={activePart.title}
            onChange={(e) => updatePart({ title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#005C53]"
          />
        </div>

        {/* Question Sections Configuration */}
        <div className="border-t border-slate-200 pt-6 mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <span className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span>Question Configurations</span>
            </h3>

            <div className="flex items-center space-x-2">
              <select
                id="newSectionTypeSelect"
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              >
                {LISTENING_QUESTION_TYPE_SPECS.map((s) => (
                  <option key={s.type} value={s.type}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const sel = document.getElementById('newSectionTypeSelect') as HTMLSelectElement;
                  addQuestionSection(sel.value as QuestionType);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question Set</span>
              </button>
            </div>
          </div>

          <div className="space-y-6 mt-4">
            {activePart.sections?.map((sec, secIdx) => {
              const spec = LISTENING_QUESTION_TYPE_SPECS.find((s) => s.type === sec.type) || LISTENING_QUESTION_TYPE_SPECS[0];
              const isCollapsed = collapsedSections[sec.id];

              return (
                <div key={sec.id} className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm transition-all">
                  <div
                    className="flex items-center justify-between bg-slate-50 p-4 border-b border-slate-200 cursor-pointer select-none hover:bg-slate-100"
                    onClick={() => toggleSectionCollapse(sec.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveQuestionSection(sec.id, 'up'); }}
                          disabled={secIdx === 0}
                          className="text-slate-400 hover:text-slate-800 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveQuestionSection(sec.id, 'down'); }}
                          disabled={secIdx === (activePart.sections?.length || 0) - 1}
                          className="text-slate-400 hover:text-slate-800 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                          <span>Set {secIdx + 1}: {spec.label}</span>
                          <span className="text-xs font-medium bg-[#005C53]/10 text-[#005C53] px-2 py-0.5 rounded-md">
                            {sec.questions.length} questions
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1">{spec.mechanism}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteQuestionSection(sec.id); }}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-slate-400">
                        {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-5 md:p-6 bg-white space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">Set Instructions (Student-facing)</label>
                          <span className="text-[10px] font-bold text-slate-400">Supports Markdown (e.g. **bold**, # Heading)</span>
                        </div>
                        <textarea
                          rows={3}
                          value={sec.instructions}
                          onChange={(e) => updateQuestionSection(sec.id, { instructions: e.target.value })}
                          placeholder="e.g. Write **NO MORE THAN TWO WORDS** for each answer."
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-6">
                        <ListeningQuestionEditor
                          section={sec}
                          onChange={(updated) => updateQuestionSection(sec.id, updated)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {(activePart.sections?.length || 0) === 0 && (
              <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                <ListPlus className="w-8 h-8 mb-3 text-slate-300" />
                <p className="font-bold text-sm text-slate-700">No question sets configured for this part.</p>
                <p className="text-xs max-w-sm mt-1 leading-relaxed">Add a question set using the dropdown above. You can mix and match multiple choice, matching, completion, and diagram types.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
