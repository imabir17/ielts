'use client';

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { getTestById } from '@/lib/test-store';
import { ArrowLeft, BookOpen, CheckCircle2, Eye, Key, AlertTriangle, Layers, Edit, Edit3 } from 'lucide-react';

export default function TestInspectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const test = getTestById(id) || {
    id,
    title: 'Test Material',
    category: 'Academic',
    totalDurationMinutes: 165,
    status: 'draft',
    tierAccess: 'All Orgs',
    questionCount: 40,
    createdDate: '2026-08-15',
    reading: [],
    listening: [],
    writing: [],
    speaking: [],
  };
  
  const [activeTab, setActiveTab] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');

  if (!isMounted) {
    return <div className="p-12 text-center text-xs font-bold text-[#005C53]">Loading Inspector...</div>;
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <Link
          href="/admin/materials"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#005C53] hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Test Material Vault</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
              <span>Test Inspector: {test.title}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify question accuracy, answer key mapping, and module integrity before releasing to coaching tenants.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/materials/builder?editId=${test.id}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#005C53] hover:bg-[#003831] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Test in Builder</span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl">
              {test.category} • {test.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {(['reading', 'listening', 'writing', 'speaking'] as const).map((mod) => (
          <button
            key={mod}
            onClick={() => setActiveTab(mod)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === mod
                ? 'bg-[#005C53] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {mod} Module
          </button>
        ))}
      </div>

      {/* Content Inspector Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {activeTab === 'reading' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#005C53]" />
              <span>Reading Passage 1 & Answer Keys</span>
            </h2>

            {test.reading.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto font-serif">
                  {test.reading[0].content}
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Answer Keys</h3>
                  {test.reading[0].questions.map((q) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{q.prompt}</div>
                      <div className="flex items-center space-x-2 text-xs text-[#005C53] font-mono font-bold">
                        <Key className="w-3.5 h-3.5" />
                        <span>Correct Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">Passage content pending draft completion.</div>
            )}
          </div>
        )}

        {activeTab === 'listening' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Listening Section Audio & Question Inspection</h2>
            {test.listening.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-[#005C53] font-semibold">
                  Audio Track URL: {test.listeningAudioUrl || test.listening[0]?.audioUrl || 'No audio provided'}
                </div>
                <div className="space-y-3">
                  {test.listening[0].questions.map((q) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{q.prompt}</div>
                      <div className="text-xs text-[#005C53] font-mono font-bold">
                        Correct Key: {String(q.correctAnswer)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">No listening sections added yet.</div>
            )}
          </div>
        )}

        {activeTab === 'writing' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Writing Task 1 & 2 Prompts</h2>
            {test.writing.map((task) => (
              <div key={task.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{task.title}</span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Min {task.minWords} words
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{task.prompt}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'speaking' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Speaking Part Prompts</h2>
            {test.speaking.map((spk) => (
              <div key={spk.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 text-sm">Part {spk.partNumber}: {spk.topic}</span>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {spk.prompts.map((pr, idx) => (
                    <li key={idx}>{pr}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
