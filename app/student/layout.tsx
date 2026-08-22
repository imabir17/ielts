'use client';

import React from 'react';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { usePathname } from 'next/navigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExam = pathname?.includes('/student/exam');

  if (isExam) {
    return <>{children}</>;
  }

  return (
    <div className="app">
      <StudentSidebar />
      <main>
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}

