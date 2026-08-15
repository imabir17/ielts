'use client';

import React, { useState } from 'react';
import { Test, MOCK_IELTS_TEST } from '@/lib/mock-data';
import { FileCode, Upload, CheckCircle2, AlertCircle, X, Sparkles, Database } from 'lucide-react';

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedTest: Test) => void;
}

export function JsonImportModal({ isOpen, onClose, onImport }: JsonImportModalProps) {
  const [jsonString, setJsonString] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLoadSampleJson = () => {
    setJsonString(JSON.stringify(MOCK_IELTS_TEST, null, 2));
    setErrorMsg(null);
  };

  const handleApplyJson = () => {
    if (!jsonString.trim()) {
      setErrorMsg('JSON payload cannot be empty.');
      return;
    }
    try {
      const parsed = JSON.parse(jsonString) as Test;
      if (!parsed.title || !parsed.category) {
        setErrorMsg('Invalid Test Schema: missing "title" or "category" properties.');
        return;
      }
      if (!Array.isArray(parsed.reading) || !Array.isArray(parsed.listening)) {
        setErrorMsg('Invalid Test Schema: "reading" and "listening" must be arrays.');
        return;
      }

      onImport(parsed);
      setSuccessMsg(true);
      setErrorMsg(null);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(`JSON Parsing Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005C53] text-white flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">Direct JSON Ingestion (Zero-Typing Mode)</h2>
              <p className="text-xs text-slate-500">Paste full IELTS test JSON including answer keys to populate all 4 modules instantly.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-100 text-[#005C53] rounded-xl text-xs font-bold flex items-center space-x-2 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>JSON Loaded! All 4 modules populated into Test Builder.</span>
          </div>
        )}

        {/* Helper Bar */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-600 font-medium">Have a pre-formatted test JSON ready?</span>
          <button
            onClick={handleLoadSampleJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#005C53] text-white font-bold text-xs rounded-xl hover:bg-[#003831] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Load Sample Full IELTS Test JSON</span>
          </button>
        </div>

        {/* Text Area JSON Editor */}
        <textarea
          value={jsonString}
          onChange={(e) => setJsonString(e.target.value)}
          placeholder={`Paste full test JSON payload here...\n\nExample:\n{\n  "title": "IELTS Academic Test 06",\n  "category": "Academic",\n  "totalDurationMinutes": 165,\n  "reading": [...],\n  "listening": [...],\n  "writing": [...],\n  "speaking": [...]\n}`}
          rows={15}
          className="w-full font-mono text-xs p-4 bg-slate-900 text-emerald-300 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005C53] resize-y leading-relaxed"
        />

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">Answer keys included in payload</span>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyJson}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Apply & Populate Test Builder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
