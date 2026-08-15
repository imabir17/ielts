import React from 'react';
import { OrgSidebar } from '@/components/layout/OrgSidebar';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <OrgSidebar />
      <main>
        {children}
      </main>
    </div>
  );
}
