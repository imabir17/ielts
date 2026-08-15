'use client';

import React from 'react';
import { StudentNav } from '@/components/layout/StudentNav';
import { usePathname } from 'next/navigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExam = pathname?.includes('/student/exam');

  if (isExam) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StudentNav />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
