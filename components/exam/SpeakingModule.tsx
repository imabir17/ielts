'use client';

import React, { useState } from 'react';
import { SpeakingPart } from '@/lib/mock-data';
import { User, Sparkles, CalendarPlus, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';

interface SpeakingModuleProps {
  parts: SpeakingPart[];
  testId: string;
}

export function SpeakingModule({ parts, testId }: SpeakingModuleProps) {
  const [activePartIndex, setActivePartIndex] = useState(0);
  const currentPart = parts[activePartIndex] || parts[0];
  const { currentUser, addSpeakingRequest, speakingRequests, students } = useStore();

  const [requested, setRequested] = useState(false);

  const handleRequestMock = () => {
    const studentUser = currentUser || students?.[0];
    if (!studentUser) return;
    const studentInfo = students.find(s => s.id === studentUser.id) || studentUser;

    addSpeakingRequest({
      id: `sr-${Date.now()}`,
      studentId: studentUser.id,
      orgId: studentInfo.orgId || '',
      testId: testId,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    
    setRequested(true);
  };

  const studentUser = currentUser || students?.[0];
  const existingRequest = speakingRequests.find(r => r.studentId === studentUser?.id && r.testId === testId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-100 font-sans overflow-hidden p-6 md:p-10 max-w-4xl mx-auto w-full">
      {/* Top Part Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-red-600" />
          <h2 className="font-bold text-slate-900 text-lg">Speaking Practice</h2>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          {parts.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePartIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

      {/* Main Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <div className="w-10 h-10 rounded-full bg-[#005C53] text-white flex items-center justify-center font-bold shrink-0">
              <User className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#005C53] uppercase tracking-wider">
                Practice Topic
              </div>
              <div className="text-sm font-bold text-slate-900">{currentPart.topic}</div>
            </div>
          </div>

          <div className="space-y-4 pt-2 pb-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Questions / Prompts
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

        {/* Request Mock Section */}
        <div className="pt-6 border-t border-slate-100 flex flex-col items-center text-center space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Ready for a real Speaking test?</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Practice mode does not record your audio. To get an official band score for speaking, you can request a live mock session with your instructor.
          </p>

          {existingRequest || requested ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex flex-col items-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div className="font-bold text-sm">Request Submitted</div>
              <div className="text-xs text-emerald-700">Your organization will review your request and schedule a session.</div>
            </div>
          ) : (
            <button
              onClick={handleRequestMock}
              className="btn btn-fill flex items-center space-x-2 px-8 py-3 bg-[var(--sidebar)] border-[var(--sidebar)] text-white hover:bg-[var(--ink)] shadow-md"
            >
              <CalendarPlus className="w-5 h-5" />
              <span>Request Speaking Mock</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
