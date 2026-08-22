'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { Award, Calendar, UserCheck, GraduationCap, Clock } from 'lucide-react';

export default function OrgResultsPage() {
  const router = useRouter();
  const { students, examLogs, currentUser } = useStore();

  const isTeacher = currentUser?.role === 'teacher';
  const targetOrgId = isTeacher ? currentUser?.orgId : currentUser?.id;

  // Get all students for this org
  const orgStudents = students.filter(s => !targetOrgId || s.orgId === targetOrgId || currentUser?.role === 'superadmin');
  const orgStudentIds = orgStudents.map(s => s.id);

  // Get all exam logs for these students
  const orgLogs = examLogs
    .filter(log => orgStudentIds.includes(log.studentId) || (targetOrgId && log.orgId === targetOrgId))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return (
    <>
      <div className="topbar mb-6">
        <div>
          <div className="eyebrow"><span className="dot"></span>{isTeacher ? 'Faculty Evaluation Console' : 'Official Results'}</div>
          <h1>{isTeacher ? 'Student Exam Submissions & Evaluation' : 'Exam Results'}</h1>
          <p className="page-sub">
            {isTeacher 
              ? 'Review candidate answers, manually override score keys, grade writing tasks, and release official results.'
              : 'Audit candidate mock exam submissions, monitor band averages, and see which faculty examiner evaluated each test.'}
          </p>
        </div>
      </div>

      <div className="panel p-0 overflow-hidden">
        <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex items-center justify-between">
          <h3 className="font-medium text-[16px] text-[var(--ink)]">All Student Submissions ({orgLogs.length})</h3>
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
                <th>Evaluator / Nametag</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orgLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-[var(--ink-faint)] italic">
                    No exam submissions yet.
                  </td>
                </tr>
              ) : (
                orgLogs.map(log => {
                  const student = orgStudents.find(s => s.id === log.studentId);
                  
                  return (
                    <tr key={log.id} onClick={() => router.push(`/org/results/${log.id}`)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <td>
                        <div className="font-medium text-[var(--ink)]">{student?.name || log.studentName || 'Unknown'}</div>
                        <div className="text-[11px] text-[var(--ink-faint)] mt-0.5">{student?.studentId || log.studentId}</div>
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
                          <span title="Writing" className={log.scores?.writing === undefined && log.modulesTaken?.includes('writing') ? 'text-[var(--brick)] font-bold' : ''}>
                            W: {log.scores?.writing !== undefined ? log.scores.writing : (log.modulesTaken?.includes('writing') ? 'Pending' : '-')}
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
                      <td>
                        {log.evaluatedBy ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate max-w-[140px]" title={log.evaluatedBy}>
                              {log.evaluatedBy}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono italic">
                            Auto-graded
                          </span>
                        )}
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

