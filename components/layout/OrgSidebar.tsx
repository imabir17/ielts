'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { LayoutDashboard, Users, Send, Award, Mic, FileEdit } from 'lucide-react';

export function OrgSidebar() {
  const pathname = usePathname();
  const { currentUser, examLogs, students } = useStore();

  const orgStudents = students.filter(s => s.orgId === currentUser?.id || currentUser?.role === 'tenant');
  const orgStudentIds = orgStudents.map(s => s.id);
  const pendingWritingCount = examLogs.filter(log => 
    (orgStudentIds.includes(log.studentId) || log.orgId === currentUser?.id) &&
    (log.modulesTaken?.includes('writing') || Boolean(log.answers?.writing && Object.keys(log.answers.writing).length > 0)) &&
    (log.scores?.writing === undefined || log.status !== 'Graded')
  ).length;

  const navItems = [
    { name: 'Org Dashboard', href: '/org', icon: LayoutDashboard },
    { name: 'Student Directory', href: '/org/students', icon: Users },
    { name: 'Assign Tests', href: '/org/assign', icon: Send },
    { name: 'Writing Grading', href: '/org/grading', icon: FileEdit, badge: pendingWritingCount > 0 ? pendingWritingCount : undefined },
    { name: 'Speaking Mocks', href: '/org/speaking', icon: Mic },
    { name: 'Exam Results', href: '/org/results', icon: Award },
  ];


  return (
    <aside className="sidebar shrink-0">
      <div className="side-brand">
        <div className="side-mark" style={{ borderColor: 'var(--forest)', color: 'var(--forest)' }}>T</div>
        <div>
          <div className="side-brand-name">Apex Academy</div>
          <div className="side-brand-role">Coaching Admin</div>
        </div>
      </div>

      <div className="side-section-label">Tenant Portal</div>
      <nav className="side-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`side-item flex items-center justify-between ${isActive ? 'active' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Icon />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-amber-500 text-slate-950 font-bold font-mono text-[10px] px-1.5 py-0.5 rounded-full shadow-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="side-avatar">
          {currentUser?.name ? currentUser.name[0].toUpperCase() : 'T'}
        </div>
        <Link href="/login" className="sidebar-foot-text hover:text-[#F2F3EE] transition-colors">
          Switch persona / Log out
        </Link>
      </div>
    </aside>
  );
}
