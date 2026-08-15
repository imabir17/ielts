'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { LogOut, User } from 'lucide-react';

export function StudentNav() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  // CRITICAL REQUIREMENT: Layout must NOT render navigation during exams
  if (pathname.includes('/student/exam')) {
    return null;
  }

  return (
    <header className="bg-[var(--sidebar)] text-[var(--sidebar-text)] border-b border-[var(--sidebar-line)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="side-mark" style={{ width: 28, height: 28, fontSize: 14 }}>S</div>
          <div>
            <div className="side-brand-name" style={{ fontSize: 13 }}>Student Portal</div>
            <div className="side-brand-role" style={{ fontSize: 9 }}>Apex Academy</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.03)] px-3 py-1.5 rounded-[3px] border border-[var(--sidebar-line)] font-mono text-[11px] text-[var(--sidebar-text)]">
            <User className="w-3.5 h-3.5" />
            <span>{currentUser?.name || 'Student'} ({currentUser?.studentId || 'STU-0000'})</span>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--sidebar-text-dim)] hover:text-[#F2F3EE] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
