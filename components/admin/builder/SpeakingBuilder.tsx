'use client';

import React from 'react';
import { SpeakingPart } from '@/lib/mock-data';
import { Mic, Sparkles, MessageSquare } from 'lucide-react';

interface SpeakingBuilderProps {
  speaking: SpeakingPart[];
  onChange: (speaking: SpeakingPart[]) => void;
}

export function SpeakingBuilder({ speaking, onChange }: SpeakingBuilderProps) {
  const safeSpeaking = Array.isArray(speaking) ? speaking : [];
  const part1: SpeakingPart = safeSpeaking.find((s) => s.partNumber === 1) || {
    id: 'spk-1',
    partNumber: 1,
    topic: 'Introduction & Hometown',
    prompts: [
      'Could you tell me your full name and show your identification?',
      'Where do you come from, and what do you like most about your hometown?',
      'Do you prefer working or studying in the morning or evening?',
    ],
  };

  const part2: SpeakingPart = safeSpeaking.find((s) => s.partNumber === 2) || {
    id: 'spk-2',
    partNumber: 2,
    topic: 'Cue Card: Describe an Environmental Initiative',
    prompts: [
      'Describe an environmental project or initiative you know about.',
      'You should say: What it is, Who started it, How it impacts the community, and Explain why you find this initiative important.',
    ],
    prepTime: 60,
    speakTime: 120,
  };

  const part3: SpeakingPart = safeSpeaking.find((s) => s.partNumber === 3) || {
    id: 'spk-3',
    partNumber: 3,
    topic: 'Two-Way Discussion: Sustainability & Technology',
    prompts: [
      'How can modern technological innovations help combat global climate change?',
      'Do you believe individual action or government policy is more effective in environmental conservation?',
    ],
  };


  const updatePart1 = (updatedFields: Partial<SpeakingPart>) => {
    onChange([{ ...part1, ...updatedFields }, part2, part3]);
  };

  const updatePart2 = (updatedFields: Partial<SpeakingPart>) => {
    onChange([part1, { ...part2, ...updatedFields }, part3]);
  };

  const updatePart3 = (updatedFields: Partial<SpeakingPart>) => {
    onChange([part1, part2, { ...part3, ...updatedFields }]);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-[#005C53]">
        <div className="flex items-center space-x-2 font-semibold">
          <Mic className="w-4 h-4 text-red-500" />
          <span>Speaking Module Builder — Plain Text Inputs (Parts 1, 2, 3)</span>
        </div>
        <span className="font-mono text-[11px] font-bold">IELTS Standard Speaking Spec</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Part 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-[#005C53]" />
                <span>Part 1: Introduction</span>
              </h3>
              <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Part 1
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topic Header</label>
              <input
                type="text"
                value={part1.topic}
                onChange={(e) => updatePart1({ topic: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Introductory Questions (One per line)
              </label>
              <textarea
                rows={8}
                value={part1.prompts.join('\n')}
                onChange={(e) => updatePart1({ prompts: e.target.value.split('\n').filter(Boolean) })}
                placeholder="Enter Part 1 questions..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005C53] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Part 2: Cue Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>Part 2: Cue Card</span>
              </h3>
              <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Part 2
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cue Card Title / Topic</label>
              <input
                type="text"
                value={part2.topic}
                onChange={(e) => updatePart2({ topic: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Task Card & Sub-Prompts ("You should say...")
              </label>
              <textarea
                rows={6}
                value={part2.prompts.join('\n')}
                onChange={(e) => updatePart2({ prompts: e.target.value.split('\n').filter(Boolean) })}
                placeholder="Enter cue card prompt and bullet points..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005C53] resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Prep Time (sec)</label>
                <input
                  type="number"
                  value={part2.prepTime || 60}
                  onChange={(e) => updatePart2({ prepTime: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Speak Time (sec)</label>
                <input
                  type="number"
                  value={part2.speakTime || 120}
                  onChange={(e) => updatePart2({ speakTime: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Part 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-[#005C53]" />
                <span>Part 3: Discussion</span>
              </h3>
              <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Part 3
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discussion Topic Header</label>
              <input
                type="text"
                value={part3.topic}
                onChange={(e) => updatePart3({ topic: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discussion Questions (One per line)
              </label>
              <textarea
                rows={8}
                value={part3.prompts.join('\n')}
                onChange={(e) => updatePart3({ prompts: e.target.value.split('\n').filter(Boolean) })}
                placeholder="Enter Part 3 discussion questions..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005C53] resize-y"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
