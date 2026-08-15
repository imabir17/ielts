'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Building2, BookOpen, BarChart3, PlusCircle, Settings, LogOut, FileText } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Organizations Directory', href: '/admin/organizations', icon: Building2 },
    { name: 'Test Bank Vault', href: '/admin/materials', icon: BookOpen },
    { name: 'Ingest / Build Test', href: '/admin/materials/builder', icon: PlusCircle },
    { name: 'Platform Managers', href: '/admin/managers', icon: ShieldCheck },
    { name: 'Audit & Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#002A25] text-emerald-100 min-h-screen flex flex-col justify-between p-4 border-r border-emerald-900/50 shrink-0">
      <div>
        {/* Brand */}
        <div className="flex items-center space-x-3 px-3 py-4 border-b border-emerald-800/40 mb-6">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-none text-base">Super Admin</h1>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">IELTSSync HQ</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href) && !item.href.includes('#'));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#005C53] text-white shadow-sm border border-emerald-500/30'
                    : 'text-emerald-200/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-emerald-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switch Persona / Logout */}
      <div className="pt-4 border-t border-emerald-800/40">
        <Link
          href="/login"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Persona / Logout</span>
        </Link>
      </div>
    </aside>
  );
}
