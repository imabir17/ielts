'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { User, FileText, LogOut } from 'lucide-react';

export function StudentSidebar() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  const links = [
    { href: '/student', label: 'My Profile', icon: User },
    { href: '/student/tests', label: 'Mock Tests', icon: FileText }
  ];

  return (
    <aside className="sidebar shrink-0">
      <div className="side-brand">
        <div className="side-mark">S</div>
        <div>
          <div className="side-brand-name">Student Portal</div>
          <div className="side-brand-role">Apex Academy</div>
        </div>
      </div>

      <div className="side-section-label">Main Menu</div>
      <nav className="side-nav">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/student');
          const isReallyActive = link.href === '/student' ? pathname === '/student' : isActive;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`side-item ${isReallyActive ? 'active' : ''}`}
            >
              <link.icon />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot mt-auto">
        <div className="side-avatar text-[14px]">
          {currentUser?.name?.charAt(0) || 'S'}
        </div>
        <div className="overflow-hidden">
          <Link href="/login" className="sidebar-foot-text hover:text-[#F2F3EE] transition-colors block truncate">
            {currentUser?.name || 'Student'} <span className="opacity-50">· Log out</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
