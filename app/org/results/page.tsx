'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { Award, Calendar } from 'lucide-react';

export default function OrgResultsPage() {
  const router = useRouter();
  const { students, examLogs, currentUser } = useStore();

  if (!currentUser) return null;

  // Get all students for this org
  const orgStudents = students.filter(s => s.orgId === currentUser.id || currentUser.role === 'tenant');
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
