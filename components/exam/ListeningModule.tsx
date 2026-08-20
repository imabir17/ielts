'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ListeningSection, QuestionSection, Question, TableCell, FlowStep, DiagramPin } from '@/lib/mock-data';
import { Volume2, VolumeX, Headphones, CheckCircle } from 'lucide-react';
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
      className="px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53] min-w-[120px] max-w-[240px] w-full"
    />
  );

  const renderDropdown = (qId: string, options: string[] | {id: string, text: string}[], usedOnceOnly = false) => {
    const isObjArray = options.length > 0 && typeof options[0] !== 'string';
    const usedAnswers = Object.values(userAnswers);
    return (
      <select
        value={userAnswers[qId] || ''}
        onChange={(e) => handleAnswerChange(qId, e.target.value)}
        className="px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53] min-w-[120px]"
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
      <div key={qSec.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 hover:border-[#005C53]/40 transition-colors">
        {qSec.instructions && (
          <div className="text-xs font-medium text-[#005C53] bg-emerald-50 p-3 rounded-lg overflow-hidden prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
            <MDEditor.Markdown source={qSec.instructions} style={{ backgroundColor: 'transparent', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }} />
          </div>
        )}

        {/* Generic Image Uploader (Top) */}
        {qSec.diagramUrl && qSec.type !== 'diagram_labeling' && (!qSec.imagePosition || qSec.imagePosition === 'top') && (
          <div className="w-full flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden mt-4 mb-6">
            <img src={qSec.diagramUrl} alt="Reference" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm" />
          </div>
        )}
        
        {/* 1. Multiple Choice */}
        {(qSec.type === 'multiple_choice_single' || qSec.type === 'multiple-choice') && (
          <div className="space-y-6">
            {qSec.questions.map(q => {
              const isMulti = qSec.type === 'multiple_choice_multi' || qSec.isMultiSelect;
              return (
                <div key={q.id} className="space-y-3">
                  <p className="font-bold text-slate-900 text-base">{q.prompt}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt) => {
                      const isSelected = isMulti 
                        ? ((userAnswers[q.id] || []) as string[]).includes(opt)
                        : userAnswers[q.id] === opt;
                      
                      const maxLimit = qSec.requiredSelectionCount;
                      const disableUnselected = isMulti && maxLimit && !isSelected && ((userAnswers[q.id] || []).length >= maxLimit);

                      return (
                        <label
                          key={opt}
                          className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-start space-x-3 cursor-pointer ${
                            isSelected
                              ? 'bg-[#005C53] text-white border-[#005C53]'
                              : disableUnselected ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${isMulti ? 'rounded-sm' : 'rounded-full'} ${isSelected ? 'border-white bg-[#005C53]' : 'border-slate-300'}`}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* Multiple Choice Multi (List Selection) Section-Level Card */}
        {qSec.type === 'multiple_choice_multi' && qSec.questions.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-900 text-white font-extrabold text-xs px-3 py-1 rounded-xl flex items-center justify-center">
                  Questions {qSec.questions[0].questionNumber} - {qSec.questions[qSec.questions.length - 1].questionNumber}
                </span>
              </div>
            </div>

            {qSec.questions[0]?.prompt ? (
              <p className="font-bold text-slate-900 text-base leading-snug">
                {qSec.questions[0].prompt}
              </p>
            ) : qSec.instructions ? (
              <p className="font-bold text-slate-900 text-base leading-snug">
                {qSec.instructions}
              </p>
            ) : null}
            
            <div className="text-xs font-bold text-amber-700 bg-amber-50 inline-block px-2.5 py-1 rounded-lg border border-amber-200 mb-2">
              Instruction: Choose {qSec.requiredSelectionCount || 2} letters
            </div>

            <div className="space-y-2 pt-1">
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
                    {isChecked && <CheckCircle className="w-5 h-5 text-emerald-300" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Matching */}
        {qSec.type === 'matching' && (
          <div className="space-y-6">
            {/* Word Bank Box */}
            {qSec.wordBankOptions && qSec.wordBankOptions.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                {qSec.wordBankTitle && (
                  <div className="mb-3 text-sm font-bold text-slate-800 prose prose-sm max-w-none">
                    <MDEditor.Markdown source={qSec.wordBankTitle} style={{ backgroundColor: 'transparent', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }} />
                  </div>
                )}
                <div className="space-y-1">
                  {qSec.wordBankOptions.map((opt, idx) => (
                    <div key={idx} className="text-sm text-slate-700">{opt}</div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Questions List */}
            <div className="space-y-4">
              {qSec.questionsTitle && (
                <div className="mb-2 text-sm font-bold text-slate-800 prose prose-sm max-w-none">
                  <MDEditor.Markdown source={qSec.questionsTitle} style={{ backgroundColor: 'transparent', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }} />
                </div>
              )}
              {qSec.questions.map(q => (
                <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 last:border-0 space-y-2 sm:space-y-0">
                  <span className="text-sm font-medium text-slate-800">
                    <span className="font-bold mr-2 text-slate-400">{q.questionNumber}.</span>
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
          <div className="space-y-6">
            {qSec.diagramUrl && (
              <div className="relative border border-slate-200 rounded-xl overflow-hidden p-4 bg-slate-50 flex justify-center">
                <img src={qSec.diagramUrl} alt="Diagram" className="max-w-full h-auto" />
                {qSec.diagramPins?.map(pin => (
                  <div key={pin.id} style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                    <span className="bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                      {pin.pinNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {qSec.questions.map(q => (
                <div key={q.id} className="flex items-center space-x-3">
                  <span className="font-bold text-slate-700 min-w-[1.5rem]">{q.questionNumber || q.pinNumber}.</span>
                  {qSec.wordBankOptions ? renderDropdown(q.id, qSec.wordBankOptions) : renderTextInput(q.id)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Form Completion */}
        {qSec.type === 'form_completion' && (
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
            <h4 className="font-serif text-lg font-bold text-slate-800 mb-4 border-b border-amber-200 pb-2">
              {qSec.title || "Form"}
            </h4>
            <div className="space-y-4">
              {qSec.questions.map(q => (
                <div key={q.id} className="flex items-start md:items-center flex-col md:flex-row space-y-2 md:space-y-0">
                  <span className="md:w-1/3 text-sm font-semibold text-slate-700">{q.prompt}</span>
                  <div className="md:w-2/3 flex items-center space-x-2">
                    <span className="font-bold text-slate-400">{q.questionNumber}.</span>
                    {renderTextInput(q.id)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Note Completion & 8. Summary Completion */}
        {(qSec.type === 'note_completion' || qSec.type === 'summary_completion') && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 leading-8 text-slate-800 font-serif whitespace-pre-wrap">
            {qSec.summaryTitle && <h4 className="font-bold text-lg mb-4 text-center">{qSec.summaryTitle}</h4>}
            {qSec.summaryText ? (
              qSec.summaryText.split('[[GAP]]').map((part, pIdx, arr) => (
                <React.Fragment key={pIdx}>
                  {part}
                  {pIdx < arr.length - 1 && qSec.questions[pIdx] && (
                    <span className="inline-flex items-center mx-2">
                      <span className="text-xs font-bold text-slate-400 mr-1">{qSec.questions[pIdx].questionNumber}</span>
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
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300">
                {qSec.tableGrid.headers && (
                  <thead className="bg-slate-100">
                    <tr>
                      {qSec.tableGrid.headers.map((h, i) => (
                        <th key={i} className="p-3 border border-slate-300 font-bold text-sm text-slate-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {qSec.tableGrid.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 border border-slate-300 text-sm">
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
            
            {/* Answer Grid Below Table */}
            {qSec.questions && qSec.questions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                {qSec.questions.map(q => (
                  <div key={q.id} className="flex items-center space-x-3">
                    <span className="font-bold text-slate-800">({q.questionNumber})</span>
                    {renderTextInput(q.id)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. Flow-chart Completion */}
        {qSec.type === 'flow_chart_completion' && qSec.flowSteps && (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              {qSec.flowSteps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="bg-white border-2 border-emerald-600 p-4 rounded-lg shadow-sm text-center min-w-[250px] max-w-sm">
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
                      <span className="text-sm font-medium">{step.text}</span>
                    )}
                  </div>
                  {idx < (qSec.flowSteps?.length || 0) - 1 && (
                    <div className="w-0.5 h-6 bg-emerald-600"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Answer Grid Below Flow Chart */}
            {qSec.questions && qSec.questions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                {qSec.questions.map(q => (
                  <div key={q.id} className="flex items-center space-x-3">
                    <span className="font-bold text-slate-800">({q.questionNumber})</span>
                    {renderTextInput(q.id)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. Sentence Completion */}
        {qSec.type === 'sentence_completion' && (
          <div className="space-y-4">
            {qSec.questions.map(q => {
              const parts = q.prompt.split('___');
              return (
                <div key={q.id} className="text-slate-800 leading-8">
                  <span className="font-bold mr-2">{q.questionNumber}.</span>
                  {parts[0]}
                  {parts.length > 1 && (
                    <span className="inline-flex items-center mx-2">
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
          <div className="space-y-6">
            {qSec.questions.map(q => (
              <div key={q.id} className="space-y-2">
                <p className="font-medium text-slate-800">
                  <span className="font-bold mr-2">{q.questionNumber}.</span>
                  {q.prompt}
                </p>
                <div className="pl-6">
                  {renderTextInput(q.id)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback for simple text-input (legacy) */}
        {qSec.type === 'text-input' && (
          <div className="space-y-4">
            {qSec.questions.map(q => (
              <div key={q.id} className="space-y-2">
                <p className="font-bold text-slate-900 text-base">{q.prompt}</p>
                {renderTextInput(q.id)}
              </div>
            ))}
          </div>
        )}

        {/* Generic Image Uploader (Bottom) */}
        {qSec.diagramUrl && qSec.type !== 'diagram_labeling' && qSec.imagePosition === 'bottom' && (
          <div className="w-full flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden mt-6 mb-2">
            <img src={qSec.diagramUrl} alt="Reference" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* LOCKED AUDIO PLAYER AT TOP */}
      <div className="sticky top-0 z-30 bg-[#002A25] text-white p-4 shadow-lg border-b border-emerald-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold shadow-md transition-transform active:scale-95 shrink-0"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Listening Module Audio</h3>
              </div>
              <div className="text-xs text-emerald-300 font-mono mt-0.5">
                {formatTime(currentTime)}
              </div>
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
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-red-500"
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
            className="p-2 text-emerald-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl || ''}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* SCROLLABLE QUESTIONS BELOW */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
            Listening Module Instructions
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Listen to the audio track carefully. Answer the questions as you listen. You will not be able to replay the track in an official IELTS exam session.
          </p>
        </div>

        {!section ? (
          <div className="p-10 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
            No listening sections available in this test.
          </div>
        ) : (
          /* Render Question Sections or fallback to questions directly if no sections array */
          section.sections ? (
            section.sections.map(qSec => renderQuestionSection(qSec))
          ) : (
            /* Fallback for direct section.questions if it's treated as a single QuestionSection */
            renderQuestionSection({
              id: section.id,
              type: section.questions?.[0]?.type || 'text-input',
              instructions: '',
              orderIndex: 0,
              questions: section.questions || []
            })
          )
        )}
        
        {/* Extra space at bottom to account for footer */}
        <div className="h-16"></div>
      </div>

      {/* BOTTOM NAVIGATION BARS */}
      <div className="bg-slate-900 text-white p-3 border-t border-slate-800 flex flex-col space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        
        {/* Part Selector */}
        <div className="max-w-7xl mx-auto w-full flex items-center justify-center space-x-2">
          {allSections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => setActiveSectionIdx(idx)}
              className={`px-6 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                activeSectionIdx === idx
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              Part {idx + 1}
            </button>
          ))}
        </div>

        {/* Question Navigator */}
        <div className="max-w-7xl mx-auto w-full flex items-center space-x-2 overflow-x-auto py-1 px-2">
          {allSections.flatMap((s, sIdx) => 
            (s?.sections || [{ questions: s?.questions || [] }]).flatMap(qSec => 
              (qSec?.questions || []).map(q => ({ ...q, partIdx: sIdx }))
            )
          ).map((q) => {
            const isAnswered = Boolean(userAnswers[q.id]);
            return (
              <button
                key={q.id}
                onClick={() => {
                  if (activeSectionIdx !== q.partIdx) {
                    setActiveSectionIdx(q.partIdx);
                  }
                  setTimeout(() => {
                    const el = document.getElementById(`question-card-${q.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 150);
                }}
                className={`relative min-w-[32px] h-8 rounded-xl font-extrabold text-xs flex items-center justify-center transition-all px-2 ${
                  isAnswered
                    ? 'bg-[#005C53] text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {q.questionNumber || '-'}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
