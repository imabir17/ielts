'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { Users, Send, GraduationCap, Award, Plus, ArrowRight } from 'lucide-react';

export default function OrgDashboardPage() {
  const { students, tenants, packages, currentUser, examLogs } = useStore();

  const myOrg = tenants.find(o => o.id === currentUser?.id);
  const tenantStudents = students.filter(s => s.orgId === currentUser?.id);
  
  const myPackage = myOrg?.packageIds ? packages.find(p => myOrg.packageIds?.includes(p.id)) : null;

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

  const totalExamsAssigned = examLogs.filter(l => l.orgId === currentUser?.id).length;

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

      <hr className="rule" />

      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Enrolled Students</span>
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.2" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>
          </div>
          <div className="stat-num">{tenantStudents.length}</div>
          <div className="stat-foot">Active mock test takers</div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Exams Administered</span>
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 19V10M12 19V5M20 19v-6" /></svg>
          </div>
          <div className="stat-num">{totalExamsAssigned}</div>
          <div className="stat-foot">Mock tests logged</div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Cohort Avg Band</span>
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
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
