'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { Test } from '@/lib/mock-data';
import { getStoredTests } from '@/lib/test-store';
import { getOrgQuota } from '@/lib/quota-manager';
import { Send, CheckCircle2, BookOpen, UserCheck, AlertCircle, AlertTriangle } from 'lucide-react';

export default function AssignTestsPage() {
  const { students, tenants, packages, currentUser, updateTenant, updateStudent, tests, examLogs } = useStore();
  
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  useEffect(() => {
    if (tests && tests.length > 0 && !selectedTestId) {
      setSelectedTestId(tests[0].id);
    }
  }, [tests, selectedTestId]);

  const currentTenant = tenants.find(t => t.id === currentUser?.id) || (currentUser?.role === 'tenant' ? currentUser : tenants[0]);
  const tenantStudents = students.filter(s => s.orgId === currentTenant?.id);
  const quota = getOrgQuota(currentTenant, packages, students, examLogs);

  const assignmentsAttempting = selectedStudentIds.length;
  const isQuotaFull = quota.isExamQuotaFull || (quota.totalExamLimit !== 'unlimited' && typeof quota.remainingExams === 'number' && assignmentsAttempting > quota.remainingExams);

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sId) => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleAssign = () => {
    if (isQuotaFull || selectedStudentIds.length === 0 || !selectedTestId) return;

    if (currentTenant) {
      const newExamsUsed = (currentTenant.examsUsedThisMonth || 0) + selectedStudentIds.length;
      updateTenant(currentTenant.id, { examsUsedThisMonth: newExamsUsed });
    }

    selectedStudentIds.forEach(id => {
      const student = students.find(s => s.id === id);
      if (student && !student.assignedTests.includes(selectedTestId)) {
        updateStudent(id, { assignedTests: [...student.assignedTests, selectedTestId] });
      }
    });

    setAssignedSuccess(true);
    setSelectedStudentIds([]);
    setTimeout(() => setAssignedSuccess(false), 3000);
  };


  if (!currentUser) return <div>Loading...</div>;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>Exam Dispatcher</div>
          <h1>Assign Mock Test</h1>
          <p className="page-sub">Select target students from your coaching center and publish test assignments.</p>
        </div>
      </div>

      {/* 3-EXAMS REMAINING WARNING */}
      {quota.isNearExamLimit && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-between gap-4 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-amber-900">
                Low Exam Quota: Only {quota.remainingExams} Exam{quota.remainingExams === 1 ? '' : 's'} Remaining
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Assigning tests will consume your remaining monthly quota. Ensure you have enough allocations for your target cohort.
              </p>
            </div>
          </div>
        </div>
      )}

      <hr className="rule" />

      <div className="bg-[var(--paper-card)] p-5 border border-[var(--line)] rounded-[3px] mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-[3px] border flex items-center justify-center ${quota.isExamQuotaFull ? 'bg-[#B23A2A]/10 border-[#B23A2A]/20 text-[#B23A2A]' : quota.isNearExamLimit ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' : 'bg-[var(--forest)]/10 border-[var(--forest)]/20 text-[var(--forest)]'}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-[19px] text-[var(--ink)]">Monthly Exam Quota</div>
            <div className="text-[13px] text-[var(--ink-soft)]">
              {quota.remainingExams === 'unlimited' ? 'Unlimited Exams Allowed' : `${quota.remainingExams} mock exams remaining`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[24px] text-[var(--ink)]">
            {quota.usedExams} <span className="text-[var(--ink-faint)] text-[18px]">/ {quota.totalExamLimit === 'unlimited' ? '∞' : quota.totalExamLimit}</span>
          </div>
          <div className={`font-mono text-[10px] uppercase tracking-[0.05em] mt-1 ${quota.isExamQuotaFull ? 'text-[#B23A2A] font-bold' : quota.isNearExamLimit ? 'text-amber-700 font-bold' : 'text-[var(--forest)]'}`}>
            {quota.isExamQuotaFull ? 'Quota Exhausted' : quota.isNearExamLimit ? 'Low Quota' : 'Exams Assigned'}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="font-medium text-[var(--ink)] flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-[var(--brick)]" /> Select Test Material
          </div>

          {tests.length === 0 && (
            <div className="panel p-8 text-center text-[var(--ink-faint)] text-[13px] italic">
              No tests available. Ask Superadmin to ingest tests.
            </div>
          )}

          {tests.map((t) => {
            const isSelected = selectedTestId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTestId(t.id)}
                className={`panel p-5 cursor-pointer transition-colors ${isSelected ? 'border-[var(--ink)] bg-[var(--paper)]' : 'border-[var(--line)] hover:border-[var(--ink-soft)] bg-[var(--paper-card)]'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-[2px] ${isSelected ? 'bg-[var(--ink)] text-white' : 'bg-[var(--paper-alt)] text-[var(--ink-soft)]'}`}>
                    {isSelected ? 'Active Selection' : 'Click to Select'}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--forest)] uppercase tracking-[0.05em]">{t.category}</span>
                </div>
                <h3 className="font-display text-[20px] text-[var(--ink)] m-0 mb-1">{t.title}</h3>
                <p className="text-[12px] text-[var(--ink-soft)]">Full 4-module test series. Duration: {t.totalDurationMinutes} mins.</p>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-[var(--ink)] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[var(--brick)]" /> Target Students ({selectedStudentIds.length} Selected)
            </div>
            <button onClick={() => setSelectedStudentIds(tenantStudents.map((s) => s.id))} className="bg-transparent border-none font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--forest)] hover:text-[var(--ink)] cursor-pointer">
              Select All
            </button>
          </div>

          <div className="panel">
            <div className="panel-body p-0 max-h-[500px] overflow-y-auto">
              <table className="audit-table">
                <tbody>
                  {tenantStudents.length === 0 ? (
                    <tr><td className="text-center py-8 italic text-[var(--ink-faint)]">No students found. Go to the Students page to create some.</td></tr>
                  ) : (
                    tenantStudents.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      return (
                        <tr key={student.id} onClick={() => toggleStudent(student.id)} className="cursor-pointer hover:bg-[var(--paper-alt)] transition-colors" style={isSelected ? { backgroundColor: 'var(--paper-alt)' } : {}}>
                          <td className="who pl-5">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked={isSelected} onChange={() => {}} className="w-4 h-4" />
                              <div>
                                <div className="font-medium text-[var(--ink)]">{student.name}</div>
                                <div className="font-mono text-[11px] text-[var(--ink-faint)] mt-0.5">{student.studentId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right pr-5">
                            <span className="font-mono text-[10px] bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)] px-2 py-0.5 rounded-[2px]">{student.assignedTests.length} Assigned</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {isQuotaFull && (
            <div className="p-4 bg-[rgba(178,58,42,0.1)] border border-[rgba(178,58,42,0.2)] rounded-[3px] flex items-start gap-3 text-[var(--brick-dark)] mt-4">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-[13.5px]">
                <strong className="block mb-1 text-[var(--brick-dark)]">Quota Exceeded</strong>
                You do not have enough exam quota to assign tests to {selectedStudentIds.length} student(s).
              </div>
            </div>
          )}

          <button
            onClick={handleAssign}
            disabled={selectedStudentIds.length === 0 || isQuotaFull || !selectedTestId}
            className="btn btn-fill w-full justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed py-4"
          >
            {assignedSuccess ? (
              <><CheckCircle2 className="w-4 h-4" /> Test Successfully Assigned!</>
            ) : (
              <><Send className="w-4 h-4" /> Publish Test Assignment ({selectedStudentIds.length})</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
