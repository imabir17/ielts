import React from 'react';
import { StudentNav } from '@/components/layout/StudentNav';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StudentNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
