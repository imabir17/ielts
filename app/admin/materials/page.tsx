'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Test } from '@/lib/mock-data';
import { useStore } from '@/components/providers/StoreProvider';
import { deleteTestFromStorage, saveTestToStorage } from '@/lib/test-store';
import { BookOpen, Plus, Eye, CheckCircle2, Lock, FileCode, Layers, Trash2, Edit3 } from 'lucide-react';

export default function TestBankPage() {
  const { tests, setTests } = useStore();
  const [filterCategory, setFilterCategory] = useState<'All' | 'Academic' | 'General Training'>('All');

  const toggleStatus = (id: string) => {
    const updated = tests.map((t) =>
      t.id === id ? { ...t, status: (t.status === 'published' ? 'draft' : 'published') as any } : t
    );
    setTests(updated);
    const target = updated.find((t) => t.id === id);
    if (target) saveTestToStorage(target);
  };

  const handleDeleteTest = (id: string) => {
    const updated = deleteTestFromStorage(id);
    setTests(updated);
  };

  const filteredTests = tests.filter(
    (t) => filterCategory === 'All' || t.category === filterCategory
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Global Test Material Vault</span>
            <span className="text-xs bg-[#005C53] text-white font-bold px-2.5 py-1 rounded-full uppercase">
              Core IP Content
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curate, validate, and manage global test availability for tenant coaching centers.
          </p>
        </div>
        <Link
          href="/admin/materials/new"
          className="inline-flex items-center space-x-2 bg-[#005C53] hover:bg-[#003831] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest New Test</span>
        </Link>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center space-x-2">
        {(['All', 'Academic', 'General Training'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === cat
                ? 'bg-[#005C53] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat} Tests
          </button>
        ))}
      </div>

      {/* Test Catalog List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-[#005C53] transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  {test.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    test.status === 'published'
                      ? 'bg-emerald-50 text-[#005C53]'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {test.status.toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg leading-snug">{test.title}</h3>
              <p className="text-xs text-slate-500">
                Created: {test.createdDate} • {test.totalDurationMinutes} mins • {test.questionCount} Questions
              </p>

              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Tier Access: {test.tierAccess}</span>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleStatus(test.id)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  {test.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDeleteTest(test.id)}
                  className="text-slate-400 hover:text-red-600 p-1"
                  title="Delete Test"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/materials/builder?editId=${test.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-extrabold text-white bg-[#005C53] hover:bg-[#003831] px-3 py-1.5 rounded-xl shadow-sm transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{test.status === 'draft' ? 'Edit Draft' : 'Edit Test'}</span>
                </Link>
                <Link
                  href={`/admin/materials/${test.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
