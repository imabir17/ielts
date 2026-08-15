'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { getTestById } from '@/lib/test-store';
import { ArrowLeft, User, Mail, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { OrgSidebar } from '@/components/layout/OrgSidebar';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = typeof params?.id === 'string' ? params.id : '';
  const { students, examLogs, speakingRequests, currentUser, packages } = useStore();

  const student = students.find(s => s.id === studentId);
  const studentLogs = examLogs.filter(l => l.studentId === studentId);
  const studentSpeakingRequests = speakingRequests.filter(r => r.studentId === studentId);

  if (!student) {
    return (
      <div className="flex h-screen bg-[var(--paper)]">
        <OrgSidebar />
        <div className="flex-1 flex items-center justify-center">Student not found</div>
      </div>
    );
  }

  const pkg = currentUser?.role === 'tenant' && currentUser.packageIds ? packages.find(p => currentUser.packageIds?.includes(p.id)) : null;
  const totalAssigned = student.assignedTests?.length || 0;
  const totalCompleted = student.completedTests || 0;

  return (
    <>
      <div className="topbar mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/org/students')} className="w-8 h-8 rounded-full bg-[var(--paper-card)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="eyebrow"><span className="dot"></span>Student Profile</div>
            <h1 className="text-[28px]">{student.name}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info Card */}
        <div className="panel p-6 lg:col-span-1 h-fit">
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-[var(--line-soft)]">
            <div className="w-16 h-16 rounded-full bg-[var(--forest)]/10 text-[var(--forest)] flex items-center justify-center text-xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-medium text-[18px] text-[var(--ink)]">{student.name}</h2>
              <div className="flex items-center text-[13px] text-[var(--ink-soft)] mt-1">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                {student.email}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-[14px]">
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Student ID</span>
              <span className="font-mono text-[var(--ink)]">{student.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Assigned Package</span>
              <span className="font-medium text-[var(--ink)]">{pkg?.name || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Tests Assigned</span>
              <span className="font-bold text-[var(--ink)]">{totalAssigned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Tests Completed</span>
              <span className="font-bold text-[var(--ink)]">{totalCompleted}</span>
            </div>
          </div>
        </div>

        {/* Test Results Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-0 overflow-hidden">
            <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)]">
              <h3 className="font-medium text-[16px] text-[var(--ink)]">Exam Submissions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="audit-table w-full">
                <thead>
                  <tr>
                    <th>Test Title</th>
                    <th>Modules</th>
                    <th>R / L / W Scores</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {studentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[var(--ink-faint)]">
                        No exam submissions yet.
                      </td>
                    </tr>
                  ) : (
                    studentLogs.map(log => (
                      <tr key={log.id} onClick={() => router.push(`/org/results/${log.id}`)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                        <td className="font-medium">{log.testTitle}</td>
                        <td>
                          <div className="flex gap-1">
                            {log.modulesTaken?.map(m => (
                              <span key={m} className="text-[10px] uppercase font-bold bg-[var(--paper)] px-1.5 py-0.5 rounded border border-[var(--line-soft)] text-[var(--ink-soft)]">
                                {m.charAt(0)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2 text-[12px] font-mono">
                            <span title="Reading">R: {log.scores?.reading || '-'}</span>
                            <span className="text-[var(--line)]">|</span>
                            <span title="Listening">L: {log.scores?.listening || '-'}</span>
                            <span className="text-[var(--line)]">|</span>
                            <span title="Writing" className={log.scores?.writing === undefined && log.modulesTaken.includes('writing') ? 'text-[var(--brick)] font-bold' : ''}>
                              W: {log.scores?.writing !== undefined ? log.scores.writing : (log.modulesTaken.includes('writing') ? 'Pending' : '-')}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            log.status === 'Completed' ? 'bg-[var(--forest)]/10 text-[var(--forest)] border border-[var(--forest)]/20' :
                            log.status === 'Graded' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-[var(--line-soft)] text-[var(--ink-soft)]'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="text-[12px] text-[var(--ink-soft)]">
                          {new Date(log.completedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Speaking Requests Section */}
          {studentSpeakingRequests.length > 0 && (
            <div className="panel p-0 overflow-hidden">
              <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex justify-between items-center">
                <h3 className="font-medium text-[16px] text-[var(--ink)]">Speaking Mock Requests</h3>
                <button onClick={() => router.push('/org/speaking')} className="text-[13px] text-[var(--forest)] font-medium hover:underline">
                  Manage all requests
                </button>
              </div>
              <div className="p-5 space-y-4">
                {studentSpeakingRequests.map(req => {
                  const reqTest = getTestById(req.testId);
                  return (
                    <div key={req.id} className="flex justify-between items-center p-4 border border-[var(--line)] rounded-[3px] bg-white">
                      <div>
                        <div className="font-medium text-[14px] text-[var(--ink)]">{reqTest?.title}</div>
                        <div className="text-[12px] text-[var(--ink-soft)] flex items-center mt-1">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Requested on {new Date(req.requestedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-[3px] text-[11px] font-bold uppercase tracking-wider ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-[var(--forest)]/10 text-[var(--forest)]'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
