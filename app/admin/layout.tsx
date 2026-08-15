import React from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <AdminSidebar />
      <main>
        {children}
      </main>
    </div>
  );
}
