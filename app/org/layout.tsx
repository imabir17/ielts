'use client';

import React, { useEffect } from 'react';
import { OrgSidebar } from '@/components/layout/OrgSidebar';
import { useStore } from '@/components/providers/StoreProvider';
import { usePathname, useRouter } from 'next/navigation';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.role === 'teacher') {
      const allowedPaths = ['/org/results', '/org/speaking'];
      const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));
      if (!isAllowed) {
        router.replace('/org/results');
      }
    }
  }, [currentUser, pathname, router]);

  return (
    <div className="app">
      <OrgSidebar />
      <main>
        {children}
      </main>
    </div>
  );
}
