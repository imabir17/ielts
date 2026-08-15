'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, Send, LayoutDashboard, LogOut, Award } from 'lucide-react';

export function OrgSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Org Dashboard', href: '/org', icon: LayoutDashboard },
    { name: 'Student Directory', href: '/org/students', icon: Users },
    { name: 'Assign Tests', href: '/org/assign', icon: Send },
    { name: 'Exam Results', href: '/org#results', icon: Award },
  ];

  return (
    <aside className="w-64 bg-[#005C53] text-white min-h-screen flex flex-col justify-between p-4 border-r border-emerald-800">
      <div>
        {/* Brand */}
        <div className="flex items-center space-x-3 px-3 py-4 border-b border-emerald-600/50 mb-6">
          <div className="w-9 h-9 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-300 font-extrabold text-lg shadow-sm">
            <Building2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-none text-base">Apex Academy</h1>
            <span className="text-[10px] text-emerald-200 uppercase tracking-widest font-semibold">
              Coaching Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-950 text-white shadow-sm border border-emerald-700/50'
                    : 'text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-emerald-300'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switch Persona */}
      <div className="pt-4 border-t border-emerald-600/50">
        <Link
          href="/login"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-200 hover:bg-emerald-950 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-300" />
          <span>Switch Persona / Logout</span>
        </Link>
      </div>
    </aside>
  );
}
