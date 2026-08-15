'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut, User } from 'lucide-react';

export function StudentNav() {
  const pathname = usePathname();

  // CRITICAL REQUIREMENT: Layout must NOT render navigation during exams
  if (pathname.includes('/student/exam')) {
    return null;
  }

  return (
    <header className="bg-[#003831] text-white border-b border-emerald-900 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight text-base">Student Exam Portal</span>
            <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Apex Academy</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-800 text-xs font-semibold">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sarah Jenkins (STU-8821)</span>
          </div>

          <Link
            href="/login"
            className="flex items-center space-x-1.5 text-xs text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Role</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
