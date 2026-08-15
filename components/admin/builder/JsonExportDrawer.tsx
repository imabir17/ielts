'use client';

import React, { useState } from 'react';
import { Test } from '@/lib/mock-data';
import { Code2, Copy, Check, X, Database } from 'lucide-react';

interface JsonExportDrawerProps {
  testState: Test;
  isOpen: boolean;
  onClose: () => void;
}

export function JsonExportDrawer({ testState, isOpen, onClose }: JsonExportDrawerProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const jsonContent = JSON.stringify(testState, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end font-sans">
      <div className="bg-slate-900 text-emerald-400 w-full max-w-2xl h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-white text-base">Unified Test JSON Payload</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* JSON Display */}
        <div className="flex-1 my-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-xl text-xs text-slate-300 font-mono">
            <span>Schema: IELTS_Standard_Test_v1</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-emerald-400 hover:underline font-bold"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={jsonContent}
            className="flex-1 font-mono text-xs p-4 bg-slate-950 text-emerald-300 rounded-b-xl border border-slate-800 focus:outline-none resize-none leading-relaxed overflow-y-auto"
          />
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Ready for Supabase `tests` table insert</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
