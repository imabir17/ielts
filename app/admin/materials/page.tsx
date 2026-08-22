'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Test } from '@/lib/mock-data';
import { useStore } from '@/components/providers/StoreProvider';
import { saveTestToStorage } from '@/lib/test-store';
import { 
  BookOpen, Plus, Eye, CheckCircle2, Lock, Trash2, Edit3, 
  AlertTriangle, X, Loader2 
} from 'lucide-react';

export default function TestBankPage() {
  const { tests, setTests, deleteTest, isInitialized } = useStore();
  const [filterCategory, setFilterCategory] = useState<'All' | 'Academic' | 'General Training'>('All');
  
  // Delete Modal State
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    const updated = tests.map((t) =>
      t.id === id ? { ...t, status: (t.status === 'published' ? 'draft' : 'published') as any } : t
    );
    setTests(updated);
    const target = updated.find((t) => t.id === id);
    if (target) saveTestToStorage(target);
  };

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTest(testToDelete.id);
      setToastMessage(`"${testToDelete.title || 'Test'}" was deleted successfully.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (error) {
      console.error('Failed to delete test:', error);
    } finally {
      setIsDeleting(false);
      setTestToDelete(null);
    }
  };

  const filteredTests = tests.filter(
    (t) => filterCategory === 'All' || t.category === filterCategory
  );

  return (
    <div className="space-y-8 font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-bold border border-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

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
        {filteredTests.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
            <div className="font-bold text-sm text-slate-600">
              {!isInitialized ? 'Loading test materials...' : 'No tests found in this category.'}
            </div>
            <p className="text-xs text-slate-400">
              Click "+ Ingest New Test" or create a test using the Test Builder.
            </p>
          </div>
        ) : (
          filteredTests.map((test) => (
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
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                  >
                    {test.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => setTestToDelete(test)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Test Material"
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
          ))
        )}
      </div>

      {/* CONFIRMATION WARNING POPUP MODAL */}
      {testToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Icon Button */}
            <button
              onClick={() => !isDeleting && setTestToDelete(null)}
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
                {testToDelete.title || 'Untitled Test'}
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
                <span className="bg-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800">
                  {testToDelete.category}
                </span>
                <span>•</span>
                <span>{testToDelete.questionCount || 0} Questions</span>
                <span>•</span>
                <span>{testToDelete.totalDurationMinutes || 165} mins</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this test? It will be removed from all tenant coaching center test catalogs and cannot be recovered.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setTestToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTest}
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
