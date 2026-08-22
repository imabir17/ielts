'use client';

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { Test, Passage, ListeningSection, WritingTask, SpeakingPart, Question } from '@/lib/mock-data';
import { 
  ArrowLeft, BookOpen, CheckCircle2, Eye, Key, AlertTriangle, 
  Layers, Edit, Edit3, Trash2, X, Loader2 
} from 'lucide-react';

export default function TestInspectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { tests, deleteTest } = useStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const test: Test = tests.find(t => t.id === id) || {
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

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTest(test.id);
      router.push('/admin/materials');
    } catch (err) {
      console.error('Failed to delete test:', err);
      setIsDeleting(false);
    }
  };

  if (!isMounted) {
    return <div className="p-12 text-center text-xs font-bold text-[#005C53]">Loading Inspector...</div>;
  }

  return (
    <div className="space-y-8 font-sans relative">
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
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-all border border-red-200"
              title="Delete this test permanently"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Test</span>
            </button>
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
            <h2 className="text-lg font-bold text-slate-900">Reading Passages & Question Mappings</h2>
            {test.reading.map((pas: Passage) => (
              <div key={pas.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-sm">{pas.title}</span>
                  <span className="text-xs font-mono text-slate-500">Passage {pas.passageNumber}</span>
                </div>
                <div className="text-xs text-slate-600 font-mono line-clamp-3 bg-white p-3 rounded-lg border border-slate-200">
                  {pas.content || '(No passage body content added yet)'}
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Question Keys ({pas.questions?.length || 0}):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {pas.questions?.map((q: Question) => (
                      <div key={q.id} className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] font-mono text-slate-400">Q{q.questionNumber}</div>
                        <div className="text-xs font-bold text-[#005C53] truncate">
                          {Array.isArray(q.correctAnswer) ? q.correctAnswer.join('/') : q.correctAnswer || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'listening' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Listening Audio & Section Keys</h2>
            {test.listening.map((sec: ListeningSection) => (
              <div key={sec.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-sm">{sec.title}</span>
                  <span className="text-xs font-mono text-slate-500">{sec.duration}s duration</span>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Question Keys ({sec.questions?.length || 0}):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {sec.questions?.map((q: Question) => (
                      <div key={q.id} className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] font-mono text-slate-400">Q{q.questionNumber}</div>
                        <div className="text-xs font-bold text-[#005C53] truncate">
                          {Array.isArray(q.correctAnswer) ? q.correctAnswer.join('/') : q.correctAnswer || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'writing' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Writing Task 1 & 2 Prompts</h2>
            {test.writing.map((task: WritingTask) => (
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
            {test.speaking.map((spk: SpeakingPart) => (
              <div key={spk.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 text-sm">Part {spk.partNumber}: {spk.topic}</span>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {spk.prompts.map((pr: string, idx: number) => (
                    <li key={idx}>{pr}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* CONFIRMATION WARNING POPUP MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Icon Button */}
            <button
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              disabled={isDeleting}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Alert Header */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Delete Test Material?</h3>
                <p className="text-xs text-slate-500">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Test Details Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="font-bold text-sm text-slate-900 line-clamp-2">
                {test.title || 'Untitled Test'}
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
                <span className="bg-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800">
                  {test.category}
                </span>
                <span>•</span>
                <span>{test.questionCount || 0} Questions</span>
                <span>•</span>
                <span>{test.totalDurationMinutes || 165} mins</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this test? It will be removed from all tenant coaching center test catalogs and cannot be recovered.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
