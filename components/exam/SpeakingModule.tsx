'use client';

import React, { useState } from 'react';
import { SpeakingPart } from '@/lib/mock-data';
import { Mic, MicOff, Volume2, User, Sparkles } from 'lucide-react';

interface SpeakingModuleProps {
  parts: SpeakingPart[];
}

export function SpeakingModule({ parts }: SpeakingModuleProps) {
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const currentPart = parts[activePartIndex] || parts[0];

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-100 font-sans overflow-hidden p-6 md:p-10 max-w-4xl mx-auto w-full">
      {/* Top Part Selector */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-red-600" />
          <h2 className="font-bold text-slate-900 text-lg">Speaking Module Simulation</h2>
        </div>

        <div className="flex items-center space-x-2">
          {parts.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePartIndex(idx);
                setIsRecording(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePartIndex === idx
                  ? 'bg-[#005C53] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Part {p.partNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Examiner Card & Waveform Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between overflow-y-auto">
        {/* Examiner Prompt */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <div className="w-10 h-10 rounded-full bg-[#005C53] text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#005C53] uppercase tracking-wider">
                Simulated AI Examiner
              </div>
              <div className="text-sm font-bold text-slate-900">{currentPart.topic}</div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Examiner Questions / Prompts
            </div>
            {currentPart.prompts.map((prompt, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-base font-semibold text-slate-800 leading-snug flex items-start space-x-3"
              >
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{prompt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Waveform Indicator & Record Button */}
        <div className="pt-8 border-t border-slate-100 space-y-6 flex flex-col items-center">
          {/* Animated Waveform SVG */}
          <div className="h-16 flex items-center justify-center space-x-1.5 w-full max-w-xs">
            {[40, 70, 35, 90, 60, 100, 50, 80, 45, 75, 30, 95, 65].map((h, i) => (
              <div
                key={i}
                style={{ height: isRecording ? `${h}%` : '20%' }}
                className={`w-2 rounded-full transition-all duration-300 ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            {isRecording ? 'Recording active... speak clearly into microphone' : 'Microphone idle'}
          </div>

          <button
            onClick={toggleRecording}
            className={`px-8 py-4 rounded-2xl font-extrabold text-sm text-white transition-all shadow-lg active:scale-95 flex items-center space-x-3 ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 animate-bounce'
                : 'bg-[#005C53] hover:bg-[#003831]'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-emerald-300" />
                <span>Start Audio Recording</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
