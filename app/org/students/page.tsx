'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { getOrgQuota } from '@/lib/quota-manager';
import { UserPlus, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';

export default function StudentsManagementPage() {
  const { students, addStudent, currentUser, tenants, packages, isInitialized, examLogs } = useStore();
  
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentTenant = tenants.find(t => t.id === currentUser?.id) || (currentUser?.role === 'tenant' ? currentUser : tenants[0]);
  const quota = getOrgQuota(currentTenant, packages, students, examLogs);

  const tenantStudents = students.filter(s => s.orgId === currentTenant?.id);
  const currentUsage = quota.usedIds;
  const totalIdLimit = quota.totalIdLimit;
  const isQuotaFull = quota.isIdQuotaFull;

  const handleGenerateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || isQuotaFull) return;


    const randomNum = Math.floor(1000 + Math.random() * 9000);
    addStudent({
      id: `std-${Date.now()}`,
      name: nameInput,
      studentId: `STU-${randomNum}`,
      email: emailInput,
      mobileNumber: mobileInput,
      password: passwordInput,
      orgId: currentUser?.id,
      assignedTests: [],
      completedTests: 0,
      averageBand: 0,
    });

    setNameInput(''); setEmailInput(''); setMobileInput(''); setPasswordInput('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>{currentTenant?.name || 'Coaching Center'}</div>
          <h1>Student ID Generator</h1>
          <p className="page-sub">Issue unique mock exam login IDs for your students.</p>
        </div>
      </div>

      <hr className="rule" />

      <div className="bg-[var(--paper-card)] p-5 border border-[var(--line)] rounded-[3px] mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-[3px] border ${isQuotaFull ? 'bg-[#B23A2A]/10 border-[#B23A2A]/20 text-[#B23A2A]' : 'bg-[var(--forest)]/10 border-[var(--forest)]/20 text-[var(--forest)]'} flex items-center justify-center`}>
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-[19px] text-[var(--ink)]">Student ID Quota</div>
            <div className="text-[13px] text-[var(--ink-soft)]">Based on your active packages</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[24px] text-[var(--ink)]">
            {currentUsage} <span className="text-[var(--ink-faint)] text-[18px]">/ {totalIdLimit === 'unlimited' ? '∞' : totalIdLimit}</span>
          </div>
          <div className={`font-mono text-[10px] uppercase tracking-[0.05em] mt-1 ${isQuotaFull ? 'text-[#B23A2A]' : 'text-[var(--forest)]'}`}>
            {isQuotaFull ? 'Quota Exhausted' : 'IDs Available'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">
                <UserPlus className="w-4 h-4 text-[var(--brick)]" />
                Issue New Student Profile
              </div>
            </div>
            <div className="panel-body py-5">
              {isQuotaFull ? (
                <div className="p-4 bg-[rgba(180,135,43,0.14)] border border-[rgba(180,135,43,0.3)] rounded-[3px] flex items-start gap-3 text-[var(--gold)]">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-[13.5px]">
                    <strong className="block mb-1 text-[var(--ink)]">Limit Reached</strong>
                    <span className="text-[var(--ink-soft)]">You have reached the maximum number of student IDs allowed by your current packages. Please contact Superadmin to upgrade.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateStudent} className="space-y-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Full Student Name *</label>
                    <input type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-white text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Student Email *</label>
                    <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-white text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Mobile Number *</label>
                    <input type="tel" required value={mobileInput} onChange={(e) => setMobileInput(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-white text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Initial Password *</label>
                    <input type="text" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-white text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                  </div>
                  <button type="submit" className="btn btn-fill w-full justify-center mt-2">
                    <Sparkles className="w-4 h-4" /> Generate Credentials
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Generated Student Roster</div>
              <span className="panel-meta">{tenantStudents.length} Total</span>
            </div>
            <div className="panel-body p-0 max-h-[600px] overflow-y-auto">
              <table className="audit-table">
                <tbody>
                  {tenantStudents.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-8 italic text-[var(--ink-faint)]">
                        {!isInitialized ? 'Loading student roster...' : 'No students generated yet.'}
                      </td>
                    </tr>
                  ) : (

                    tenantStudents.map((student, idx) => (
                      <tr key={student.id} style={idx === 0 ? { backgroundColor: 'var(--paper-alt)' } : {}}>
                        <td className="who pl-5">
                          <div className="font-medium text-[var(--ink)] flex items-center gap-2">
                            {student.name}
                            {idx === 0 && <span className="font-mono text-[9px] bg-[var(--brick)] text-white px-1.5 py-0.5 rounded-[2px] uppercase">New</span>}
                          </div>
                          <div className="font-mono text-[11px] text-[var(--ink-faint)] mt-0.5">{student.email} • {student.mobileNumber}</div>
                        </td>
                        <td className="text-right pr-5">
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10.5px] text-[var(--ink-faint)]">ID:</span>
                              <span className="font-mono text-[11px] font-medium bg-[var(--ink)] text-[var(--paper)] px-1.5 py-0.5 rounded-[2px]">{student.studentId}</span>
                              <button onClick={() => handleCopy(student.studentId)} className="bg-transparent border-none text-[var(--ink-faint)] hover:text-[var(--ink)] cursor-pointer">
                                {copiedId === student.studentId ? <Check className="w-3.5 h-3.5 text-[var(--forest)]" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10.5px] text-[var(--ink-faint)]">Pass:</span>
                              <span className="font-mono text-[11px] font-medium bg-[var(--paper-card)] border border-[var(--line)] text-[var(--ink-soft)] px-1.5 py-0.5 rounded-[2px]">{student.password}</span>
                              <button onClick={() => handleCopy(student.password || '')} className="bg-transparent border-none text-[var(--ink-faint)] hover:text-[var(--ink)] cursor-pointer">
                                {copiedId === student.password ? <Check className="w-3.5 h-3.5 text-[var(--forest)]" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
