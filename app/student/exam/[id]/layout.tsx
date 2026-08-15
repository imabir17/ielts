import React from 'react';

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  // CRITICAL REQUIREMENT: Exam layout has NO navigation bars or footers to prevent distraction during testing.
  return <div className="h-screen w-screen overflow-hidden bg-slate-100 flex flex-col font-sans">{children}</div>;
}
