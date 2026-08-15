import React from 'react';
import { StudentNav } from '@/components/layout/StudentNav';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <StudentNav />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
