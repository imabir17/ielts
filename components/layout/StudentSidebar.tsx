'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { User, FileText, LogOut } from 'lucide-react';

export function StudentSidebar() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  const links = [
    { href: '/student', label: 'My Profile', icon: User },
    { href: '/student/tests', label: 'Mock Tests', icon: FileText }
  ];

  return (
    <aside className="w-[280px] bg-[var(--sidebar)] text-[var(--sidebar-text)] border-r border-[var(--sidebar-line)] flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 border-b border-[var(--sidebar-line)]">
        <div className="flex items-center gap-3">
          <div className="side-mark">S</div>
          <div>
            <div className="side-brand-name">Student Portal</div>
            <div className="side-brand-role">Apex Academy</div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-[var(--sidebar-line)]">
        <div className="flex items-center gap-3 px-3 py-2 bg-[rgba(255,255,255,0.03)] rounded-[3px] border border-[var(--sidebar-line)]">
          <div className="w-8 h-8 rounded-full bg-[var(--sidebar-hover)] flex items-center justify-center font-bold text-white text-[12px]">
            {currentUser?.name?.charAt(0) || 'S'}
          </div>
          <div className="overflow-hidden">
            <div className="text-[13px] font-medium text-white truncate">{currentUser?.name || 'Student'}</div>
            <div className="text-[11px] text-[var(--sidebar-text-dim)] truncate">{currentUser?.studentId || 'STU-0000'}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--sidebar-text-dim)]">Main Menu</div>
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/student');
          const isReallyActive = link.href === '/student' ? pathname === '/student' : isActive;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`side-link ${isReallyActive ? 'active' : ''}`}
            >
              <link.icon className="side-icon" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--sidebar-line)]">
        <Link href="/login" className="side-link">
          <LogOut className="side-icon" />
          Log Out
        </Link>
      </div>
    </aside>
  );
}
