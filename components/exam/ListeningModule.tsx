'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ListeningSection, QuestionSection, Question, TableCell, FlowStep, DiagramPin } from '@/lib/mock-data';
import { Volume2, VolumeX, Headphones, CheckCircle2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

interface ListeningModuleProps {
  allSections: ListeningSection[];
  audioUrl?: string;
  volume?: number;
  onAnswerChange?: (answers: Record<string, any>) => void;
}

export function ListeningModule({ allSections = [], audioUrl, volume = 1, onAnswerChange }: ListeningModuleProps) {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const section = allSections && allSections.length > 0 ? allSections[activeSectionIdx] || allSections[0] : null;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (onAnswerChange) onAnswerChange(userAnswers);
  }, [userAnswers, onAnswerChange]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelect = (questionId: string, opt: string, maxLimit?: number) => {
    const current = (userAnswers[questionId] as string[]) || [];
    if (current.includes(opt)) {
      handleAnswerChange(questionId, current.filter(x => x !== opt));
    } else {
      if (maxLimit && current.length >= maxLimit) return;
      handleAnswerChange(questionId, [...current, opt]);
    }
  };

  const renderTextInput = (qId: string, placeholder = "Write your answer...") => (
    <input
      type="text"
      placeholder={placeholder}
      value={userAnswers[qId] || ''}
      onChange={(e) => handleAnswerChange(qId, e.target.value)}
      className="px-3 py-1.5 rounded-[2px] border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-slate-800 min-w-[120px] max-w-[240px] w-full"
    />
  );

  const renderDropdown = (qId: string, options: string[] | {id: string, text: string}[], usedOnceOnly = false) => {
    const isObjArray = options.length > 0 && typeof options[0] !== 'string';
    const usedAnswers = Object.values(userAnswers);
    return (
      <select
        value={userAnswers[qId] || ''}
        onChange={(e) => handleAnswerChange(qId, e.target.value)}
        className="px-3 py-1.5 rounded-[2px] border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-slate-800 min-w-[120px]"
      >
        <option value="" disabled>Select option...</option>
        {options.map((opt: any) => {
          const val = isObjArray ? opt.id : opt;
          const label = isObjArray ? opt.text : opt;
          const isDisabled = usedOnceOnly && usedAnswers.includes(val) && userAnswers[qId] !== val;
          return (
            <option key={val} value={val} disabled={isDisabled}>{label}</option>
          );
        })}
      </select>
    );
  };

  const renderQuestionSection = (qSec: QuestionSection) => {
    return (
      <div key={qSec.id} className="bg-white p-5 rounded-[2px] border border-slate-300 space-y-5">
        {qSec.instructions && (
          <div className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-[2px] border border-slate-200 overflow-hidden prose prose-sm max-w-none prose-p:my-1">
            <MDEditor.Markdown source={qSec.instructions} style={{ backgroundColor: 'transparent', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }} />
          </div>
        )}

        {/* Diagram Image (Top) */}
        {qSec.diagramUrl && qSec.type !== 'diagram_labeling' && (!qSec.imagePosition || qSec.imagePosition === 'top') && (
          <div className="w-full flex justify-center bg-slate-50 border border-slate-300 rounded-[2px] p-3 overflow-hidden mt-3 mb-4">
            <img src={qSec.diagramUrl} alt="Reference" className="max-w-full max-h-[450px] object-contain rounded-[2px]" />
          </div>
        )}
        
        {/* 1. Multiple Choice */}
        {(qSec.type === 'multiple_choice_single' || qSec.type === 'multiple-choice') && (
          <div className="space-y-5">
            {qSec.questions.map(q => {
              const isMulti = qSec.type === 'multiple_choice_multi' || qSec.isMultiSelect;
              return (
                <div key={q.id} className="space-y-2.5">
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{q.prompt}</p>
                  <div className="space-y-1.5">
                    {q.options?.map((opt, oIdx) => {
                      const isSelected = isMulti 
                        ? ((userAnswers[q.id] || []) as string[]).includes(opt)
                        : userAnswers[q.id] === opt;
                      
                      const maxLimit = qSec.requiredSelectionCount;
                      const disableUnselected = isMulti && maxLimit && !isSelected && ((userAnswers[q.id] || []).length >= maxLimit);
                      const letter = String.fromCharCode(65 + oIdx);

                      return (
                        <label
                          key={opt}
                          className={`w-full text-left p-2.5 rounded-[2px] border text-xs font-medium transition-colors flex items-center justify-start space-x-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 text-blue-950 border-blue-600'
                              : disableUnselected ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type={isMulti ? "checkbox" : "radio"}
                            name={`q-${q.id}`}
                            checked={isSelected}
                            disabled={!!disableUnselected}
                            onChange={() => {
                              if (isMulti) handleMultiSelect(q.id, opt, maxLimit);
                              else handleAnswerChange(q.id, opt);
                            }}
                            className="hidden"
                          />
                          <span className={`w-5 h-5 rounded-[2px] flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                            isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}>
                            {letter}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Multiple Choice Multi Section Card */}
        {qSec.type === 'multiple_choice_multi' && qSec.questions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="bg-slate-800 text-white font-bold text-xs px-2 py-0.5 rounded-[2px] font-mono">
                Questions {qSec.questions[0].questionNumber} – {qSec.questions[qSec.questions.length - 1].questionNumber}
              </span>
              <span className="text-xs text-slate-600 italic">
                Choose {qSec.requiredSelectionCount || 2} letters
              </span>
            </div>

            {qSec.questions[0]?.prompt ? (
              <p className="font-semibold text-slate-900 text-sm leading-snug">
                {qSec.questions[0].prompt}
              </p>
            ) : qSec.instructions ? (
              <p className="font-semibold text-slate-900 text-sm leading-snug">
                {qSec.instructions}
              </p>
            ) : null}

            <div className="space-y-1.5 pt-1">
              {(qSec.wordBankOptions || []).map((opt, idx) => {
                const selectedQuestions = qSec.questions.filter(q => userAnswers[q.id] === opt);
                const isChecked = selectedQuestions.length > 0;
                const totalSelected = qSec.questions.filter(q => userAnswers[q.id]).length;
                const isMaxReached = totalSelected >= (qSec.requiredSelectionCount || 2) && !isChecked;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={opt}
                    disabled={isMaxReached}
                    onClick={() => {
                      if (isChecked) {
                        selectedQuestions.forEach(q => handleAnswerChange(q.id, ''));
                      } else {
                        const emptyQ = qSec.questions.find(q => !userAnswers[q.id]);
                        if (emptyQ) {
                          handleAnswerChange(emptyQ.id, opt);
                        }
                      }
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
          </div>
        )}

        {/* 2. Matching */}
        {qSec.type === 'matching' && (
          <div className="space-y-4">
            {qSec.wordBankOptions && qSec.wordBankOptions.length > 0 && (
              <div className="bg-slate-50 border border-slate-300 p-3 rounded-[2px]">
                {qSec.wordBankTitle && (
                  <div className="mb-2 text-xs font-bold text-slate-800 prose prose-sm max-w-none">
                    <MDEditor.Markdown source={qSec.wordBankTitle} style={{ backgroundColor: 'transparent', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }} />
                  </div>
                )}
                <div className="space-y-1 text-xs">
                  {qSec.wordBankOptions.map((opt, idx) => (
                    <div key={idx} className="text-slate-700">{opt}</div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {qSec.questionsTitle && (
                <div className="mb-1 text-xs font-bold text-slate-800 prose prose-sm max-w-none">
                  <MDEditor.Markdown source={qSec.questionsTitle} style={{ backgroundColor: 'transparent', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }} />
                </div>
              )}
              {qSec.questions.map(q => (
                <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2.5 last:border-0 space-y-1 sm:space-y-0 text-xs">
                  <span className="font-medium text-slate-800">
                    <span className="font-bold mr-2 text-slate-500 font-mono">{q.questionNumber}.</span>
                    {q.prompt}
                  </span>
                  {renderDropdown(q.id, qSec.wordBankOptions || [], qSec.usedOnceOnly)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Diagram Labeling */}
        {qSec.type === 'diagram_labeling' && (
          <div className="space-y-4">
            {qSec.diagramUrl && (
              <div className="relative border border-slate-300 rounded-[2px] overflow-hidden p-3 bg-slate-900 flex justify-center">
                <img src={qSec.diagramUrl} alt="Diagram" className="max-w-full h-auto" />
                {qSec.diagramPins?.map(pin => (
                  <div key={pin.id} style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                    <span className="bg-slate-900 text-white font-mono text-xs font-bold px-1.5 py-0.5 rounded-[2px] border border-white">
                      {pin.pinNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {qSec.questions.map(q => (
                <div key={q.id} className="flex items-center space-x-2">
                  <span className="font-bold text-slate-700 min-w-[1.5rem] font-mono">{q.questionNumber || q.pinNumber}.</span>
                  {qSec.wordBankOptions ? renderDropdown(q.id, qSec.wordBankOptions) : renderTextInput(q.id)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Form Completion */}
        {qSec.type === 'form_completion' && (
          <div className="bg-slate-50 p-5 rounded-[2px] border border-slate-300">
            <h4 className="font-serif text-base font-bold text-slate-900 mb-3 border-b border-slate-300 pb-2">
              {qSec.title || "Form"}
            </h4>
            <div className="space-y-3">
              {qSec.questions.map(q => (
                <div key={q.id} className="flex items-start md:items-center flex-col md:flex-row space-y-1 md:space-y-0 text-xs">
                  <span className="md:w-1/3 font-semibold text-slate-700">{q.prompt}</span>
                  <div className="md:w-2/3 flex items-center space-x-2">
                    <span className="font-bold text-slate-500 font-mono">{q.questionNumber}.</span>
                    {renderTextInput(q.id)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Note Completion & 8. Summary Completion */}
        {(qSec.type === 'note_completion' || qSec.type === 'summary_completion') && (
          <div className="bg-white p-5 rounded-[2px] border border-slate-300 leading-7 text-slate-800 font-serif whitespace-pre-wrap text-sm">
            {qSec.summaryTitle && <h4 className="font-bold text-base mb-3 text-center text-slate-900 font-sans">{qSec.summaryTitle}</h4>}
            {qSec.summaryText ? (
              qSec.summaryText.split('[[GAP]]').map((part, pIdx, arr) => (
                <React.Fragment key={pIdx}>
                  {part}
                  {pIdx < arr.length - 1 && qSec.questions[pIdx] && (
                    <span className="inline-flex items-center mx-1 font-sans">
                      <span className="text-xs font-bold text-slate-500 mr-1 font-mono">({qSec.questions[pIdx].questionNumber})</span>
                      {qSec.provideWordBank
                        ? renderDropdown(qSec.questions[pIdx].id, qSec.wordBankOptions || [])
                        : renderTextInput(qSec.questions[pIdx].id)}
                    </span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="text-slate-400 italic">No text provided.</span>
            )}
          </div>
        )}

        {/* 6. Table Completion */}
        {qSec.type === 'table_completion' && qSec.tableGrid && (
          <div className="space-y-4 font-sans">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                {qSec.tableGrid.headers && (
                  <thead className="bg-slate-100">
                    <tr>
                      {qSec.tableGrid.headers.map((h, i) => (
                        <th key={i} className="p-2.5 border border-slate-300 font-bold text-slate-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {qSec.tableGrid.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 border border-slate-300">
                          {cell.isGap ? (
                            <span className="text-slate-800">
                              {(cell.text || '___').split('___').map((part, pIdx, arr) => (
                                <React.Fragment key={pIdx}>
                                  {part}
                                  {pIdx < arr.length - 1 && ' .................... '}
                                </React.Fragment>
                              ))}
                            </span>
                          ) : (
                            cell.text
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {qSec.questions && qSec.questions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                {qSec.questions.map(q => (
                  <div key={q.id} className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-slate-700 font-mono">({q.questionNumber})</span>
                    {renderTextInput(q.id)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. Flow-chart Completion */}
        {qSec.type === 'flow_chart_completion' && qSec.flowSteps && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
              {qSec.flowSteps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="bg-white border border-slate-400 p-3 rounded-[2px] text-center min-w-[240px] max-w-sm text-xs">
                    {step.isGap ? (
                      <span className="text-slate-800">
                        {(step.text || '___').split('___').map((part, pIdx, arr) => (
                          <React.Fragment key={pIdx}>
                            {part}
                            {pIdx < arr.length - 1 && ' .................... '}
                          </React.Fragment>
                        ))}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-800">{step.text}</span>
                    )}
                  </div>
                  {idx < (qSec.flowSteps?.length || 0) - 1 && (
                    <div className="w-0.5 h-4 bg-slate-400"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {qSec.questions && qSec.questions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
                {qSec.questions.map(q => (
                  <div key={q.id} className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700 font-mono">({q.questionNumber})</span>
                    {renderTextInput(q.id)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. Sentence Completion */}
        {qSec.type === 'sentence_completion' && (
          <div className="space-y-3 text-xs leading-relaxed">
            {qSec.questions.map(q => {
              const parts = q.prompt.split('___');
              return (
                <div key={q.id} className="text-slate-800">
                  <span className="font-bold mr-1.5 font-mono">{q.questionNumber}.</span>
                  {parts[0]}
                  {parts.length > 1 && (
                    <span className="inline-flex items-center mx-1.5">
                      {qSec.wordBankOptions 
                        ? renderDropdown(q.id, qSec.wordBankOptions)
                        : renderTextInput(q.id)}
                    </span>
                  )}
                  {parts[1] || ''}
                </div>
              );
            })}
          </div>
        )}

        {/* 10. Short Answer */}
        {qSec.type === 'short_answer' && (
          <div className="space-y-4 text-xs">
            {qSec.questions.map(q => (
              <div key={q.id} className="space-y-1.5">
                <p className="font-medium text-slate-900">
                  <span className="font-bold mr-1.5 font-mono">{q.questionNumber}.</span>
                  {q.prompt}
                </p>
                <div className="pl-4">
                  {renderTextInput(q.id)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback for simple text-input (legacy) */}
        {qSec.type === 'text-input' && (
          <div className="space-y-3 text-xs">
            {qSec.questions.map(q => (
              <div key={q.id} className="space-y-1.5">
                <p className="font-semibold text-slate-900">{q.prompt}</p>
                {renderTextInput(q.id)}
              </div>
            ))}
          </div>
        )}

        {/* Diagram Image (Bottom) */}
        {qSec.diagramUrl && qSec.type !== 'diagram_labeling' && qSec.imagePosition === 'bottom' && (
          <div className="w-full flex justify-center bg-slate-50 border border-slate-300 rounded-[2px] p-3 overflow-hidden mt-4 mb-2">
            <img src={qSec.diagramUrl} alt="Reference" className="max-w-full max-h-[450px] object-contain rounded-[2px]" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* LOCKED AUDIO PLAYER AT TOP */}
      <div className="sticky top-0 z-30 bg-[#0F172A] text-white px-4 py-2 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="px-3 py-1 rounded-[2px] bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition-colors flex items-center space-x-1"
            >
              <span>{isPlaying ? '⏸ Pause' : '▶ Play Audio'}</span>
            </button>
            <div className="flex items-center space-x-2 text-xs">
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-slate-300">{formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Audio Scrubber */}
          <div className="flex-1 max-w-md hidden sm:block">
            <input
              type="range"
              min={0}
              max={audioRef.current?.duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-sm appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Volume Button */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl || ''}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* SCROLLABLE QUESTIONS */}
      <div className="flex-1 overflow-y-auto p-5 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="bg-white p-4 rounded-[2px] border border-slate-300 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
            Listening Section Instructions
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Answer the questions as you listen. The audio track is played once only in an official IELTS examination.
          </p>
        </div>

        {!section ? (
          <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-[2px] border border-slate-300">
            No listening sections available in this test.
          </div>
        ) : (
          section.sections ? (
            section.sections.map(qSec => renderQuestionSection(qSec))
          ) : (
            renderQuestionSection({
              id: section.id,
              type: section.questions?.[0]?.type || 'text-input',
              instructions: '',
              orderIndex: 0,
              questions: section.questions || []
            })
          )
        )}
        
        <div className="h-16"></div>
      </div>

      {/* BOTTOM NAVIGATION DOCK */}
      <div className="bg-[#0F172A] text-white px-4 py-2 border-t border-slate-800 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center space-x-3 overflow-x-auto py-1">
          {allSections.map((s, sIdx) => {
            const partQuestions = (s.sections || [{ questions: s.questions || [] }]).flatMap(qSec => qSec.questions || []);
            return (
              <div key={s.id} className="flex items-center space-x-1 border-r border-slate-700 pr-3 last:border-r-0">
                <button
                  onClick={() => setActiveSectionIdx(sIdx)}
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-[2px] font-bold mr-1 transition-colors ${
                    activeSectionIdx === sIdx ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Part {sIdx + 1}
                </button>
                {partQuestions.map((q) => {
                  const isAnswered = Boolean(userAnswers[q.id]);
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        if (activeSectionIdx !== sIdx) {
                          setActiveSectionIdx(sIdx);
                        }
                        setTimeout(() => {
                          const el = document.getElementById(`question-card-${q.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className={`w-7 h-7 rounded-[2px] font-mono text-xs font-semibold flex items-center justify-center transition-all border ${
                        isAnswered
                          ? 'bg-slate-700 text-white border-slate-600 font-bold'
                          : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-100'
                      }`}
                      title={`Question ${q.questionNumber || '-'}${isAnswered ? ' (Answered)' : ''}`}
                    >
                      {q.questionNumber || '-'}
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
