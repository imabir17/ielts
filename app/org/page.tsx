'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { getOrgQuota } from '@/lib/quota-manager';
import { Users, Send, GraduationCap, Award, Plus, ArrowRight, AlertTriangle, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export default function OrgDashboardPage() {
  const { students, tenants, packages, currentUser, examLogs } = useStore();

  const myOrg = tenants.find(o => o.id === currentUser?.id) || (currentUser?.role === 'tenant' ? currentUser : tenants[0]);
  const tenantStudents = students.filter(s => s.orgId === myOrg?.id);
  const quota = getOrgQuota(myOrg, packages, students, examLogs);

  const getStudentAverageBand = (studentId: string) => {
    const logs = examLogs.filter(l => l.studentId === studentId && l.overallBand !== undefined);
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, l) => acc + (l.overallBand || 0), 0);
    return Number((sum / logs.length).toFixed(1));
  };

  const studentsWithScores = tenantStudents.map(s => getStudentAverageBand(s.id)).filter(score => score > 0);
  const cohortAvgBand = studentsWithScores.length > 0 
    ? (studentsWithScores.reduce((a, b) => a + b, 0) / studentsWithScores.length).toFixed(1)
    : '0.0';

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>{myOrg?.name || 'Apex Academy'}</div>
          <h1>Coaching Center Dashboard</h1>
          <p className="page-sub">Manage your student cohort, generate mock exam IDs, and assign test series.</p>
        </div>
        <div className="topbar-actions">
          <Link href="/org/students" className="btn btn-ghost"><Plus className="w-4 h-4" /> Generate Student ID</Link>
          <Link href="/org/assign" className="btn btn-fill"><Send className="w-4 h-4" /> Assign Test</Link>
        </div>
      </div>

      {/* 3-EXAMS REMAINING WARNING BANNER */}
      {quota.isNearExamLimit && (
        <div className="mb-6 p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl flex items-center justify-between gap-4 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-amber-900">
                Low Exam Allocation Alert: Only {quota.remainingExams} Exam{quota.remainingExams === 1 ? '' : 's'} Remaining
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Your monthly exam quota has almost run out ({quota.usedExams} of {quota.totalExamLimit} used). Upgrade plan or request extra mock test allocations to ensure uninterrupted student examinations.
              </p>
            </div>
          </div>
          <Link
            href="/org/assign"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors shadow-sm"
          >
            Review Quota
          </Link>
        </div>
      )}

      {/* EXAM QUOTA EXHAUSTED WARNING BANNER */}
      {quota.isExamQuotaFull && (
        <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/40 rounded-xl flex items-center justify-between gap-4 text-red-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-red-900">
                Monthly Exam Quota Exhausted ({quota.usedExams} / {quota.totalExamLimit})
              </div>
              <p className="text-xs text-red-800 mt-0.5">
                You have reached your maximum mock exam limit for this cycle. New test assignments and submissions are locked until quota is renewed.
              </p>
            </div>
          </div>
          <a
            href="mailto:support@mockielts.com"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors shadow-sm"
          >
            Contact Admin
          </a>
        </div>
      )}

      <hr className="rule" />

      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Student IDs Issued</span>
            <Users className="w-4 h-4 text-[var(--forest)]" />
          </div>
          <div className="stat-num">{quota.usedIds} <span className="text-[16px] text-slate-400">/ {quota.totalIdLimit === 'unlimited' ? '∞' : quota.totalIdLimit}</span></div>
          <div className="stat-foot">{quota.remainingIds === 'unlimited' ? 'Unlimited Seats' : `${quota.remainingIds} IDs remaining`}</div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Monthly Exam Quota</span>
            <BookOpen className="w-4 h-4 text-[var(--brick)]" />
          </div>
          <div className="stat-num">{quota.usedExams} <span className="text-[16px] text-slate-400">/ {quota.totalExamLimit === 'unlimited' ? '∞' : quota.totalExamLimit}</span></div>
          <div className={`stat-foot ${quota.isNearExamLimit ? 'text-amber-700 font-bold' : quota.isExamQuotaFull ? 'text-red-700 font-bold' : ''}`}>
            {quota.remainingExams === 'unlimited' ? 'Unlimited Exams' : `${quota.remainingExams} exams remaining`}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Cohort Avg Band</span>
            <Award className="w-4 h-4 text-[var(--gold)]" />
          </div>
          <div className="stat-num gold">{cohortAvgBand}</div>
          <div className="stat-foot up">↗ Target: Band 7.5+</div>
        </div>
      </div>


      <div className="panel-row">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L2 20h20z" /><path d="M12 9v5M12 17h.01" /></svg>
              Prepare for Upcoming Mock Exam Session
            </div>
          </div>
          <div className="panel-body py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[15px] text-[var(--ink-soft)] max-w-xl leading-[1.6]">
                Students can log in via their generated Student ID (e.g. STU-8821) and take their assigned IELTS practice test.
              </p>
            </div>
            <Link
              href="/org/assign"
              className="btn btn-fill"
              style={{ backgroundColor: 'var(--brick)', borderColor: 'var(--brick)' }}
            >
              Assign IELTS Test 01 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <Users className="w-4 h-4 text-[var(--brick)]" />
              Student Roster
            </div>
            <Link href="/org/students" className="panel-meta hover:text-[var(--ink)]">View All ({tenantStudents.length})</Link>
          </div>
          <div className="panel-body p-0">
            <table className="audit-table">
              <tbody>
                {tenantStudents.map((std) => (
                  <tr key={std.id}>
                    <td className="who pl-5">
                      <div className="font-medium text-[var(--ink)]">{std.name}</div>
                      <div className="font-mono text-[11px] text-[var(--ink-faint)] mt-0.5">{std.studentId} • {std.email}</div>
                    </td>
                    <td className="text-right pr-5">
                      <span className="pill pass">Band {getStudentAverageBand(std.id) || 'N/A'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
