'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MOCK_IELTS_TEST, Test, Passage, ListeningSection, WritingTask, SpeakingPart } from '@/lib/mock-data';
import { useStore } from '@/components/providers/StoreProvider';
import { ReadingBuilder } from '@/components/admin/builder/ReadingBuilder';
import { WritingBuilder } from '@/components/admin/builder/WritingBuilder';
import { ListeningBuilder } from '@/components/admin/builder/ListeningBuilder';
import { SpeakingBuilder } from '@/components/admin/builder/SpeakingBuilder';
import { JsonExportDrawer } from '@/components/admin/builder/JsonExportDrawer';
import { JsonImportModal } from '@/components/admin/builder/JsonImportModal';
import { ArrowLeft, BookOpen, Headphones, Edit3, Mic, Save, Eye, Send, Code2, AlertTriangle, CheckCircle2, FileInput, Sparkles } from 'lucide-react';

function TestBuilderInner() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId') || searchParams.get('id');

  const [testState, setTestState] = useState<Test>(() => {
    return {
      id: `test-builder-${Date.now()}`,
      title: '',
      category: 'Academic',
      tierAccess: 'All Orgs',
      status: 'draft',
      totalDurationMinutes: 170,
      questionCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      reading: [
        { id: `r1-${Date.now()}`, passageNumber: 1, title: '', content: '', questions: [] },
        { id: `r2-${Date.now()}`, passageNumber: 2, title: '', content: '', questions: [] },
        { id: `r3-${Date.now()}`, passageNumber: 3, title: '', content: '', questions: [] }
      ],
      listening: [],
      listeningAudioUrl: '',
      writing: [
        { id: `w1-${Date.now()}`, taskNumber: 1, title: '', prompt: '', minWords: 150, recommendedTime: 20 },
        { id: `w2-${Date.now()}`, taskNumber: 2, title: '', prompt: '', minWords: 250, recommendedTime: 40 }
      ],
      speaking: [
        { id: `s1-${Date.now()}`, partNumber: 1, topic: 'Interview', prompts: [''] },
        { id: `s2-${Date.now()}`, partNumber: 2, topic: 'Cue Card', prompts: [''] },
        { id: `s3-${Date.now()}`, partNumber: 3, topic: 'Discussion', prompts: [''] }
      ]
    };
  });

  const [isMounted, setIsMounted] = useState(false);

  const { addTest, updateTest, tests } = useStore();

  useEffect(() => {
    setIsMounted(true);
    if (editId && tests.length > 0) {
      const found = tests.find(t => t.id === editId);
      if (found) {
        setTestState(found);
      }
    }
  }, [editId, tests]);


  const [activeModuleTab, setActiveModuleTab] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Validation Checks for missing mandatory fields
  const missingPassages = !testState.reading || testState.reading.length < 3 || testState.reading.some((p) => !p?.content?.trim());
  const missingAudio = !testState.listeningAudioUrl?.trim();
  const hasValidationWarnings = missingPassages || missingAudio;

  if (!isMounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-[#005C53]">
        Loading Test Builder...
      </div>
    );
  }

  const handleSaveDraft = async () => {
    const exists = tests.some(t => t.id === testState.id);
    if (exists) {
      await updateTest(testState.id, testState);
    } else {
      await addTest(testState);
    }
    setSaveSuccessMsg('Draft saved securely to Supabase!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handlePublish = async () => {
    const published = { ...testState, status: 'published' as const };
    setTestState(published);
    const exists = tests.some(t => t.id === published.id);
    if (exists) {
      await updateTest(published.id, published);
    } else {
      await addTest(published);
    }
    setSaveSuccessMsg('Test published to Supabase and synced via web link!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleImportJson = async (importedTest: Test) => {
    setTestState(importedTest);
    const exists = tests.some(t => t.id === importedTest.id);
    if (exists) {
      await updateTest(importedTest.id, importedTest);
    } else {
      await addTest(importedTest);
    }
    setSaveSuccessMsg('Test JSON imported and saved directly to Supabase!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb & Title */}
      <div>
        <Link
          href="/admin/materials"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#005C53] hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Test Material Vault</span>
        </Link>

        {/* TOP CONTROL BAR */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            {/* Metadata Inputs */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Test Title</label>
                <input
                  type="text"
                  value={testState.title}
                  onChange={(e) => setTestState({ ...testState, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Category</label>
                <select
                  value={testState.category}
                  onChange={(e) => setTestState({ ...testState, category: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                >
                  <option value="Academic">IELTS Academic</option>
                  <option value="General Training">IELTS General Training</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tier Access</label>
                <select
                  value={testState.tierAccess}
                  onChange={(e) => setTestState({ ...testState, tierAccess: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                >
                  <option value="All Orgs">All Coaching Tenants</option>
                  <option value="Premium Only">Premium Tiers Only</option>
                  <option value="Enterprise Custom">Enterprise Custom</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Direct JSON Import Button */}
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-[#005C53] text-xs font-extrabold rounded-xl transition-all flex items-center space-x-1.5 border border-emerald-300"
                title="Paste full JSON directly without typing form fields"
              >
                <FileInput className="w-4 h-4 text-[#005C53]" />
                <span>Import JSON (Zero-Typing)</span>
              </button>

              <button
                onClick={() => setIsExportDrawerOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
              >
                <Code2 className="w-4 h-4 text-[#005C53]" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleSaveDraft}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
              >
                <Save className="w-4 h-4 text-slate-600" />
                <span>Save Draft</span>
              </button>

              <Link
                href={`/admin/materials/${testState.id}`}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
              >
                <Eye className="w-4 h-4 text-emerald-300" />
                <span>Preview</span>
              </Link>

              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Publish Test</span>
              </button>
            </div>
          </div>

          {/* Validation Feedback Banners */}
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-100 text-[#005C53] rounded-xl text-xs font-bold flex items-center space-x-2 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {hasValidationWarnings && (
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium flex items-center space-x-2 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Validation Notice:{' '}
                {missingPassages && 'Ensure all 3 Reading Passages have body content. '}
                {missingAudio && 'Attach a Master Audio URL for the Listening Module.'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION MODULE TABS */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveModuleTab('reading')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === 'reading'
              ? 'bg-[#005C53] text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Reading Builder (3 Passages)</span>
        </button>

        <button
          onClick={() => setActiveModuleTab('listening')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === 'listening'
              ? 'bg-[#005C53] text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>2. Listening Builder (4 Sections)</span>
        </button>

        <button
          onClick={() => setActiveModuleTab('writing')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === 'writing'
              ? 'bg-[#005C53] text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>3. Writing Builder (Task 1 & 2)</span>
        </button>

        <button
          onClick={() => setActiveModuleTab('speaking')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModuleTab === 'speaking'
              ? 'bg-[#005C53] text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>4. Speaking Builder (Parts 1–3)</span>
        </button>
      </div>

      {/* MODULE BUILDERS VIEWPORT */}
      <div>
        {activeModuleTab === 'reading' && (
          <ReadingBuilder
            passages={testState.reading}
            onChange={(newPassages: Passage[]) => setTestState({ ...testState, reading: newPassages })}
          />
        )}

        {activeModuleTab === 'listening' && (
          <ListeningBuilder
            listening={testState.listening}
            onChange={(newListening: ListeningSection[]) => setTestState({ ...testState, listening: newListening })}
            globalAudioUrl={testState.listeningAudioUrl || ''}
            onGlobalAudioUrlChange={(url: string) => setTestState({ ...testState, listeningAudioUrl: url })}
          />
        )}

        {activeModuleTab === 'writing' && (
          <WritingBuilder
            tasks={testState.writing}
            onChange={(newTasks: WritingTask[]) => setTestState({ ...testState, writing: newTasks })}
          />
        )}

        {activeModuleTab === 'speaking' && (
          <SpeakingBuilder
            speaking={testState.speaking}
            onChange={(newSpeaking: SpeakingPart[]) => setTestState({ ...testState, speaking: newSpeaking })}
          />
        )}
      </div>

      {/* JSON Export Drawer */}
      <JsonExportDrawer
        testState={testState}
        isOpen={isExportDrawerOpen}
        onClose={() => setIsExportDrawerOpen(false)}
      />

      {/* JSON Import Modal (Zero-Typing Mode) */}
      <JsonImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportJson}
      />
    </div>
  );
}

export default function SuperAdminTestBuilderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-[#005C53]">Loading Test Builder...</div>}>
      <TestBuilderInner />
    </Suspense>
  );
}
