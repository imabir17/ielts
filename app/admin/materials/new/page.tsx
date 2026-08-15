'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseAndNormalizeTestJson, IngestionResult } from '@/lib/test-ingestion-engine';
import { saveTestToStorage } from '@/lib/test-store';
import { ImageUploader } from '@/components/admin/builder/ImageUploader';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, FileCode, Music, Image, Sparkles, Send, Eye } from 'lucide-react';

const SAMPLE_FULL_JSON_TEMPLATE = `{
  "title": "IELTS Academic Official Test 08",
  "category": "Academic",
  "totalDurationMinutes": 165,
  "reading": [
    {
      "passage_number": 1,
      "title": "Attitudes to Language",
      "text": "It is not easy to be systematic and objective about language study...",
      "questions": [
        {
          "type": "YES/NO/NOT GIVEN",
          "instructions": "Do the following statements agree with the claims of the writer?",
          "items": [
            { "number": 1, "statement": "There are understandable reasons why arguments occur about language." },
            { "number": 2, "statement": "People feel more strongly about language education than about small differences." }
          ]
        }
      ]
    }
  ]
}`;

export default function TestIngestionPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testCategory, setTestCategory] = useState<'Academic' | 'General Training'>('Academic');
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [diagramUrl, setDiagramUrl] = useState<string | undefined>();
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const handleValidateAndIngest = () => {
    if (!jsonInput.trim()) {
      setIngestionResult({ success: false, error: 'JSON payload cannot be empty.' });
      return;
    }

    const result = parseAndNormalizeTestJson(jsonInput, {
      title: testTitle.trim() ? testTitle : undefined,
      category: testCategory,
    });

    setIngestionResult(result);
  };

  const handleCreateTest = () => {
    if (ingestionResult?.success && ingestionResult.test) {
      saveTestToStorage(ingestionResult.test);
      setCreatedSuccess(true);
      setTimeout(() => {
        router.push('/admin/materials');
      }, 1500);
    }
  };

  const handleSimulateAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFileName(e.target.files[0].name);
    }
  };

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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
          <span>Universal Test Ingestion Engine</span>
          <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full uppercase">
            System Ingestion Pipeline
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Paste any raw IELTS JSON payload. The system normalizes all passages, listening tracks, writing prompts, and answer keys into an active test ready for students!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Settings & Media Asset Vault */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Test Metadata</h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Test Title (Optional Override)</label>
              <input
                type="text"
                placeholder="e.g. IELTS Academic Master Mock 08"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Category</label>
              <select
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              >
                <option value="Academic">IELTS Academic</option>
                <option value="General Training">IELTS General Training</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Music className="w-5 h-5 text-[#005C53]" />
              <span>Media Asset Vault</span>
            </h2>
            <p className="text-xs text-slate-500">
              Attach MP3 audio tracks for Section 1-4 Listening modules if available.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-[#005C53] transition-colors relative cursor-pointer bg-slate-50">
              <input
                type="file"
                accept="audio/*"
                onChange={handleSimulateAudioUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-[#005C53] mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700">
                {audioFileName ? audioFileName : 'Drop MP3 Audio File or Click to Upload'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Supports MP3, WAV up to 50MB</div>
            </div>

            {audioFileName && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-[#005C53] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Audio track attached & encoded!</span>
              </div>
            )}
          </div>

          <ImageUploader
            label="Writing Task 1 Diagram / Chart Asset"
            value={diagramUrl}
            onChange={(url) => setDiagramUrl(url)}
            helperText="Upload local chart or graph images (PNG, JPG, SVG) for Writing Task 1."
          />
        </div>

        {/* Right Column: Universal JSON Ingestion Input */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-[#005C53]" />
              <h2 className="font-extrabold text-slate-900 text-lg">Raw Test JSON Payload Input</h2>
            </div>
            <button
              onClick={() => {
                setJsonInput(SAMPLE_FULL_JSON_TEMPLATE);
                setIngestionResult(null);
              }}
              className="px-3 py-1.5 bg-[#005C53] text-white font-bold text-xs rounded-xl hover:bg-[#003831] flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Load Template JSON</span>
            </button>
          </div>

          <textarea
            rows={16}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setIngestionResult(null);
            }}
            placeholder="Paste your raw JSON payload here (e.g. { 'reading': [...], 'listening': [...] } or full test JSON)..."
            className="w-full font-mono text-xs p-4 bg-slate-900 text-emerald-300 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005C53] leading-relaxed resize-y"
          />

          {/* Validation & Ingestion Results */}
          {ingestionResult && (
            <div className="space-y-4">
              {ingestionResult.success ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 text-[#005C53] font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>JSON Schema Validated & Normalized Successfully!</span>
                  </div>
                  {ingestionResult.summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-slate-700 font-medium">
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Passages</span>
                        <span className="font-extrabold text-[#005C53]">{ingestionResult.summary.passagesCount} Loaded</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Listening</span>
                        <span className="font-extrabold text-[#005C53]">{ingestionResult.summary.listeningSectionsCount} Sections</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Writing</span>
                        <span className="font-extrabold text-[#005C53]">{ingestionResult.summary.writingTasksCount} Tasks</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Total Qs</span>
                        <span className="font-extrabold text-[#005C53]">{ingestionResult.summary.totalQuestionsCount} Questions</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-red-700 text-xs font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{ingestionResult.error}</span>
                </div>
              )}
            </div>
          )}

          {createdSuccess && (
            <div className="p-4 bg-emerald-100 text-[#005C53] font-bold text-sm rounded-2xl flex items-center space-x-2 border border-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Test Created & Saved to Test Bank Vault! Redirecting...</span>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-mono">Answers & Rubrics Auto-Parsed</span>
            <div className="flex space-x-3">
              <button
                onClick={handleValidateAndIngest}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >
                Validate JSON
              </button>
              <button
                onClick={() => {
                  handleValidateAndIngest();
                  setTimeout(() => handleCreateTest(), 100);
                }}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Ingest & Create Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
