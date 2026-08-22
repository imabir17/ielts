'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { getOrgQuota } from '@/lib/quota-manager';
import { LayoutDashboard, Users, Send, Award, Mic, AlertTriangle } from 'lucide-react';

export function OrgSidebar() {
  const pathname = usePathname();
  const { currentUser, tenants, packages, students, examLogs } = useStore();

  const myOrg = tenants.find(o => o.id === currentUser?.id) || (currentUser?.role === 'tenant' ? currentUser : tenants[0]);
  const quota = getOrgQuota(myOrg, packages, students, examLogs);

  const navItems = [
    { name: 'Org Dashboard', href: '/org', icon: LayoutDashboard },
    { name: 'Student Directory', href: '/org/students', icon: Users },
    { name: 'Assign Tests', href: '/org/assign', icon: Send },
    { name: 'Speaking Mocks', href: '/org/speaking', icon: Mic },
    { name: 'Exam Results', href: '/org/results', icon: Award },
  ];

  return (
    <aside className="sidebar shrink-0">
      <div className="side-brand">
        <div className="side-mark" style={{ borderColor: 'var(--forest)', color: 'var(--forest)' }}>
          {myOrg?.name ? myOrg.name.charAt(0).toUpperCase() : 'T'}
        </div>
        <div>
          <div className="side-brand-name truncate max-w-[140px]">{myOrg?.name || 'Apex Academy'}</div>
          <div className="side-brand-role">{quota.tierName} Center</div>
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
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mini Quota Tracker in Sidebar */}
      <div className="mx-3 my-4 p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
          <span>Monthly Quotas</span>
          {quota.isNearExamLimit && (
            <span className="bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5" /> Low
            </span>
          )}
        </div>
        
        {/* Exam Quota Bar */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
            <span>Exams</span>
            <span className={quota.isNearExamLimit ? 'text-amber-400 font-bold' : quota.isExamQuotaFull ? 'text-red-400 font-bold' : 'text-slate-200'}>
              {quota.usedExams} / {quota.totalExamLimit === 'unlimited' ? '∞' : quota.totalExamLimit}
            </span>
          </div>
          {quota.totalExamLimit !== 'unlimited' && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  quota.isExamQuotaFull ? 'bg-red-500' : quota.isNearExamLimit ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.round((quota.usedExams / (quota.totalExamLimit as number)) * 100))}%` }}
              />
            </div>
          )}
        </div>

        {/* Student ID Quota Bar */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
            <span>Student IDs</span>
            <span className={quota.isIdQuotaFull ? 'text-red-400 font-bold' : 'text-slate-200'}>
              {quota.usedIds} / {quota.totalIdLimit === 'unlimited' ? '∞' : quota.totalIdLimit}
            </span>
          </div>
          {quota.totalIdLimit !== 'unlimited' && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${quota.isIdQuotaFull ? 'bg-red-500' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min(100, Math.round((quota.usedIds / (quota.totalIdLimit as number)) * 100))}%` }}
              />
            </div>
          )}
        </div>
      </div>

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
