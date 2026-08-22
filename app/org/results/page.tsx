'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { Award, Calendar } from 'lucide-react';

export default function OrgResultsPage() {
  const router = useRouter();
  const { students, examLogs, currentUser } = useStore();

  // Get all students for this org
  const orgStudents = students.filter(s => !currentUser || s.orgId === currentUser.id || currentUser.role === 'tenant' || currentUser.role === 'superadmin');

  const orgStudentIds = orgStudents.map(s => s.id);

  // Get all exam logs for these students
  const orgLogs = examLogs
    .filter(log => orgStudentIds.includes(log.studentId))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return (
    <>
      <div className="topbar mb-6">
        <div>
          <h1>Exam Results</h1>
        </div>
      </div>

      <div className="panel p-0 overflow-hidden">
        <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)]">
          <h3 className="font-medium text-[16px] text-[var(--ink)]">All Student Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="audit-table w-full">
            <thead>
              <tr>
                <th>Student</th>
                <th>Test Title</th>
                <th>Modules</th>
                <th>R / L / W Scores</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>

            </thead>
            <tbody>
              {orgLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--ink-faint)]">
                    No exam submissions yet.
                  </td>
                </tr>
              ) : (
                orgLogs.map(log => {
                  const student = orgStudents.find(s => s.id === log.studentId);
                  
                  return (
                    <tr key={log.id} onClick={() => router.push(`/org/results/${log.id}`)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <td>
                        <div className="font-medium text-[var(--ink)]">{student?.name || 'Unknown'}</div>
                        <div className="text-[11px] text-[var(--ink-faint)] mt-0.5">{student?.studentId}</div>
                      </td>
                      <td className="text-[14px] text-[var(--ink-soft)]">{log.testTitle}</td>
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
                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                          log.isPublished || log.status === 'Graded'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        }`}>
                          {log.isPublished || log.status === 'Graded' ? '✓ Released' : '⏳ Needs Evaluation'}
                        </span>
                      </td>
                      <td className="text-[12px] text-[var(--ink-soft)] font-mono">
                        {new Date(log.completedAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/org/results/${log.id}`);
                          }}
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                            log.isPublished || log.status === 'Graded'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          {log.isPublished || log.status === 'Graded' ? 'View / Edit' : 'Evaluate & Grade'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>
    </>
  );
}
