'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { UserPlus, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';

export default function StudentsManagementPage() {
  const { students, addStudent, currentUser, tenants, packages } = useStore();
  
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get current tenant and packages
  const currentTenant = tenants.find(t => t.id === currentUser?.id);
  const tenantPackages = currentTenant?.packageIds?.map(id => packages.find(p => p.id === id)).filter(Boolean) || [];

  // Calculate limits
  const hasUnlimitedIds = tenantPackages.some(p => p!.idLimit === 'unlimited');
  const totalIdLimit = hasUnlimitedIds 
    ? 'unlimited' 
    : tenantPackages.reduce((sum, p) => sum + (p!.idLimit as number), 0);

  const tenantStudents = students.filter(s => s.orgId === currentUser?.id);
  const currentUsage = tenantStudents.length;

  const isQuotaFull = totalIdLimit !== 'unlimited' && currentUsage >= (totalIdLimit as number);

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

    setNameInput('');
    setEmailInput('');
    setMobileInput('');
    setPasswordInput('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
          <span>Student ID Generator</span>
          <span className="text-xs bg-[#005C53] text-white font-bold px-2.5 py-1 rounded-full">
            {currentTenant?.name || 'Coaching Center'}
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Issue unique mock exam login IDs for your students.
        </p>
      </div>

      {/* Quota Status */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isQuotaFull ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-[#005C53]'}`}>
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Student ID Quota</div>
            <div className="text-xs text-slate-500">Based on your active packages</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">
            {currentUsage} <span className="text-slate-400 text-lg">/ {totalIdLimit === 'unlimited' ? '∞' : totalIdLimit}</span>
          </div>
          <div className={`text-xs font-bold ${isQuotaFull ? 'text-red-600' : 'text-[#005C53]'}`}>
            {isQuotaFull ? 'Quota Exhausted' : 'IDs Available'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-[#005C53]" />
              <span>Issue New Student Profile</span>
            </h2>

            {isQuotaFull ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="block mb-1">Limit Reached</strong>
                  You have reached the maximum number of student IDs allowed by your current packages. Please contact Superadmin to upgrade.
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateStudent} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Miller"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. david@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +8801700000000"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. secret123"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#005C53] hover:bg-[#003831] text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-97 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Generate Credentials</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base">Generated Student Roster</h2>
              <span className="text-xs text-slate-500 font-mono">{tenantStudents.length} Total</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {tenantStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No students generated yet.
                </div>
              ) : (
                tenantStudents.map((student, idx) => (
                  <div
                    key={student.id}
                    className={`p-4 flex items-center justify-between transition-all duration-300 ${
                      idx === 0 ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-sm text-slate-900 font-bold flex items-center space-x-2">
                        <span>{student.name}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{student.email} • {student.mobileNumber}</div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400">ID:</span>
                        <span className="bg-slate-900 text-emerald-300 font-mono text-xs px-2 py-1 rounded border border-slate-700 font-bold">
                          {student.studentId}
                        </span>
                        <button onClick={() => handleCopy(student.studentId)} className="p-1 hover:text-[#005C53] text-slate-400 transition-colors">
                          {copiedId === student.studentId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400">Pass:</span>
                        <span className="bg-slate-100 text-slate-700 font-mono text-xs px-2 py-1 rounded border border-slate-300 font-bold">
                          {student.password}
                        </span>
                        <button onClick={() => handleCopy(student.password || '')} className="p-1 hover:text-[#005C53] text-slate-400 transition-colors">
                          {copiedId === student.password ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
