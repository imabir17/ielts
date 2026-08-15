'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { LayoutDashboard, Users, Send, Award } from 'lucide-react';

export function OrgSidebar() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  const navItems = [
    { name: 'Org Dashboard', href: '/org', icon: LayoutDashboard },
    { name: 'Student Directory', href: '/org/students', icon: Users },
    { name: 'Assign Tests', href: '/org/assign', icon: Send },
    { name: 'Exam Results', href: '/org#results', icon: Award },
  ];

  return (
    <aside className="sidebar shrink-0">
      <div className="side-brand">
        <div className="side-mark" style={{ borderColor: 'var(--forest)', color: 'var(--forest)' }}>T</div>
        <div>
          <div className="side-brand-name">Apex Academy</div>
          <div className="side-brand-role">Coaching Admin</div>
        </div>
      </div>

      <div className="side-section-label">Tenant Portal</div>
      <nav className="side-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`side-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="side-avatar">
          {currentUser?.name ? currentUser.name[0].toUpperCase() : 'T'}
        </div>
        <Link href="/login" className="sidebar-foot-text hover:text-[#F2F3EE] transition-colors">
          Switch persona / Log out
        </Link>
      </div>
    </aside>
  );
}
