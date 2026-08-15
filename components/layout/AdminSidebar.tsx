'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { LayoutDashboard, Building2, Vault, Hammer, Shield, Settings } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  const platformNav = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
    { name: 'Test bank vault', href: '/admin/materials', icon: Vault },
    { name: 'Ingest / build test', href: '/admin/materials/builder', icon: Hammer },
  ];

  const governanceNav = [
    { name: 'Platform managers', href: '/admin/managers', icon: Shield },
    { name: 'Audit & settings', href: '/admin/settings', icon: Settings },
  ];

  const renderNav = (items: typeof platformNav) => (
    <nav className="side-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href) && !item.href.includes('#'));
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
  );

  return (
    <aside className="sidebar shrink-0">
      <div className="side-brand">
        <div className="side-mark">I</div>
        <div>
          <div className="side-brand-name">Super admin</div>
          <div className="side-brand-role">IELTSSync HQ</div>
        </div>
      </div>

      <div className="side-section-label">Platform</div>
      {renderNav(platformNav)}

      <div className="side-section-label">Governance</div>
      {renderNav(governanceNav)}

      <div className="sidebar-foot">
        <div className="side-avatar">
          {currentUser?.name ? currentUser.name[0].toUpperCase() : 'S'}
        </div>
        <Link href="/login" className="sidebar-foot-text hover:text-[#F2F3EE] transition-colors">
          Switch persona / Log out
        </Link>
      </div>
    </aside>
  );
}
