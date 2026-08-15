'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { Test } from '@/lib/mock-data';
import { getStoredTests } from '@/lib/test-store';
import { Send, CheckCircle2, BookOpen, UserCheck, AlertCircle } from 'lucide-react';

export default function AssignTestsPage() {
  const { students, tenants, packages, currentUser, updateTenant, updateStudent } = useStore();
  
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  // Load tests
  useEffect(() => {
    const list = getStoredTests();
    setTests(list);
    if (list.length > 0) setSelectedTestId(list[0].id);
  }, []);

  // Filter students for current tenant
  const tenantStudents = students.filter(s => s.orgId === currentUser?.id);

  // Calculate limits
  const currentTenant = tenants.find(t => t.id === currentUser?.id);
  const tenantPackages = currentTenant?.packageIds?.map(id => packages.find(p => p.id === id)).filter(Boolean) || [];

  const hasUnlimitedExams = tenantPackages.some(p => p!.examLimit === 'unlimited');
  const totalExamLimit = hasUnlimitedExams 
    ? 'unlimited' 
    : tenantPackages.reduce((sum, p) => sum + (p!.examLimit as number), 0);

  const examsUsed = currentTenant?.examsUsedThisMonth || 0;
  const assignmentsAttempting = selectedStudentIds.length;
  
  const isQuotaFull = totalExamLimit !== 'unlimited' && (examsUsed + assignmentsAttempting) > (totalExamLimit as number);

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sId) => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleAssign = () => {
    if (isQuotaFull || selectedStudentIds.length === 0 || !selectedTestId) return;

    // Deduct quota
    if (currentTenant) {
      updateTenant(currentTenant.id, { 
        examsUsedThisMonth: examsUsed + selectedStudentIds.length 
      });
    }

    // Assign to students
    selectedStudentIds.forEach(id => {
      const student = students.find(s => s.id === id);
      if (student && !student.assignedTests.includes(selectedTestId)) {
        updateStudent(id, {
          assignedTests: [...student.assignedTests, selectedTestId]
        });
      }
    });

    setAssignedSuccess(true);
    setSelectedStudentIds([]);
    setTimeout(() => setAssignedSuccess(false), 3000);
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
          <span>Assign Mock Test</span>
          <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full">
            Exam Dispatcher
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select target students from your coaching center and publish test assignments to their student portals.
        </p>
      </div>

      {/* Quota Status */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalExamLimit !== 'unlimited' && examsUsed >= (totalExamLimit as number) ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-[#005C53]'}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Monthly Exam Quota</div>
            <div className="text-xs text-slate-500">Based on your active packages</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">
            {examsUsed} <span className="text-slate-400 text-lg">/ {totalExamLimit === 'unlimited' ? '∞' : totalExamLimit}</span>
          </div>
          <div className={`text-xs font-bold ${totalExamLimit !== 'unlimited' && examsUsed >= (totalExamLimit as number) ? 'text-red-600' : 'text-[#005C53]'}`}>
            Exams Assigned
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Test Picker */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#005C53]" />
            <span>Select Test Material</span>
          </h2>

          {tests.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-200">
              No tests available. Ask Superadmin to ingest tests.
            </div>
          )}

          {tests.map((t) => {
            const isSelected = selectedTestId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTestId(t.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  isSelected ? 'bg-white border-[#005C53] shadow-md' : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isSelected ? 'text-emerald-800 bg-emerald-100' : 'text-slate-600 bg-slate-200'
                  }`}>
                    {isSelected ? 'Active Selection' : 'Click to Select'}
                  </span>
                  <span className="text-xs font-bold text-[#005C53]">{t.category}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t.title}</h3>
                <p className="text-xs text-slate-500">
                  Full 4-module test series. Duration: {t.totalDurationMinutes} mins.
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Student Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-[#005C53]" />
              <span>Target Students ({selectedStudentIds.length} Selected)</span>
            </h2>
            <button
              onClick={() => setSelectedStudentIds(tenantStudents.map((s) => s.id))}
              className="text-xs font-semibold text-[#005C53] hover:underline"
            >
              Select All
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {tenantStudents.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">
                 No students found. Go to the Students page to create some.
               </div>
            ) : (
              tenantStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#005C53] rounded focus:ring-[#005C53]"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{student.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{student.studentId}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      {student.assignedTests.length} Assigned
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {isQuotaFull && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="block mb-1">Quota Exceeded</strong>
                You do not have enough exam quota to assign tests to {selectedStudentIds.length} student(s). Please reduce your selection or upgrade your packages.
              </div>
            </div>
          )}

          <button
            onClick={handleAssign}
            disabled={selectedStudentIds.length === 0 || isQuotaFull || !selectedTestId}
            className="w-full py-3.5 bg-[#005C53] hover:bg-[#003831] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2"
          >
            {assignedSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>Test Successfully Assigned!</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-red-300" />
                <span>Publish Test Assignment ({selectedStudentIds.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
