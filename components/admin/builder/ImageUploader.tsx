'use client';

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, CheckCircle2, Link as LinkIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (imageUrl: string | undefined) => void;
  helperText?: string;
}

export function ImageUploader({ label, value, onChange, helperText }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-[#005C53]" />
          <span>{label}</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setUrlInput('');
            }}
            className="text-xs text-red-600 hover:underline flex items-center space-x-1 font-bold"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove Image</span>
          </button>
        )}
      </div>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {value ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white p-3 text-center shadow-sm group">
          <img src={value} alt="Uploaded Diagram" className="max-h-56 mx-auto object-contain rounded-xl" />
          <div className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full inline-flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Image Attached & Rendered</span>
          </div>
        </div>
      ) : (
        /* Upload Mode Switcher (File Drag & Drop or URL) */
        <div className="space-y-3">
          <div className="flex space-x-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                activeTab === 'upload' ? 'bg-[#005C53] text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Local Image</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                activeTab === 'url' ? 'bg-[#005C53] text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste Image URL</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#005C53] bg-white rounded-2xl p-5 text-center cursor-pointer transition-all hover:bg-emerald-50/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-7 h-7 text-[#005C53] mx-auto mb-1.5" />
              <div className="text-xs font-extrabold text-slate-800">Click to Browse PNG, JPG, WEBP, SVG</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Supports diagrams up to 10MB</div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="https://example.com/diagram.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3.5 py-2 bg-[#005C53] text-white text-xs font-bold rounded-xl hover:bg-[#003831]"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
