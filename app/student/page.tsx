'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { Award, BookOpen, Clock, Mail, GraduationCap } from 'lucide-react';

export default function StudentProfilePage() {
  const { currentUser, examLogs, tests } = useStore();

  if (!currentUser) return null;

  const myLogs = examLogs.filter(l => l.studentId === currentUser.id);
  const completedTestIds = myLogs.map(l => l.testId);
  const pendingTestsCount = tests.filter(t => !completedTestIds.includes(t.id)).length;

  // Calculate Average Band
  const scoredLogs = myLogs.filter(l => l.overallBand !== undefined);
  const averageBand = scoredLogs.length > 0 
    ? (scoredLogs.reduce((acc, l) => acc + (l.overallBand || 0), 0) / scoredLogs.length).toFixed(1)
    : '-';

  return (
    <>
      <div className="topbar mb-8">
        <div>
          <div className="eyebrow"><span className="dot"></span>Apex IELTS Academy</div>
          <h1>My Profile</h1>
          <p className="page-sub">View your account details and overall performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="panel p-6 md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[var(--sidebar)] text-white flex items-center justify-center text-2xl font-bold">
              {currentUser.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-2xl font-display text-[var(--ink)]">{currentUser.name}</h2>
              <div className="text-[var(--ink-soft)] font-mono text-[12px]">{currentUser.studentId}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[var(--paper)] p-4 rounded-[3px] border border-[var(--line-soft)]">
              <div className="text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1 flex items-center"><Mail className="w-3.5 h-3.5 mr-1"/> Email Address</div>
              <div className="font-medium text-[var(--ink)]">{currentUser.email || 'N/A'}</div>
            </div>
            <div className="bg-[var(--paper)] p-4 rounded-[3px] border border-[var(--line-soft)]">
              <div className="text-[11px] font-bold uppercase text-[var(--ink-soft)] mb-1 flex items-center"><GraduationCap className="w-3.5 h-3.5 mr-1"/> Institution</div>
              <div className="font-medium text-[var(--ink)]">Apex Academy</div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="panel p-6 flex flex-col justify-center text-center bg-gradient-to-br from-[var(--paper-card)] to-white border-[var(--line)] shadow-sm">
          <div className="mx-auto w-12 h-12 bg-[var(--forest)]/10 text-[var(--forest)] rounded-full flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1">Average Overall Band</div>
          <div className="text-5xl font-display text-[var(--ink)]">{averageBand}</div>
        </div>
      </div>

      {/* Tests Overview */}
      <h3 className="font-display text-[20px] text-[var(--ink)] mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-[var(--brick)]"/> Activity Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="panel p-6 border-l-4 border-l-[var(--forest)]">
          <div className="text-[32px] font-display text-[var(--ink)]">{scoredLogs.length}</div>
          <div className="font-medium text-[14px] text-[var(--ink-soft)]">Completed & Graded Tests</div>
          <Link href="/student/tests" className="text-[13px] font-bold text-[var(--forest)] hover:underline mt-4 inline-block">View Results &rarr;</Link>
        </div>
        <div className="panel p-6 border-l-4 border-l-[var(--brick)]">
          <div className="text-[32px] font-display text-[var(--ink)]">{pendingTestsCount}</div>
          <div className="font-medium text-[14px] text-[var(--ink-soft)]">Pending Mock Tests</div>
          <Link href="/student/tests" className="text-[13px] font-bold text-[var(--brick)] hover:underline mt-4 inline-block">Start Testing &rarr;</Link>
        </div>
      </div>
    </>
  );
}
