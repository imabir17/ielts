'use client';

import React from 'react';
import { MOCK_ORGANIZATIONS, MOCK_EXAM_LOGS, MOCK_AUDIT_LOGS, MOCK_ANOMALIES } from '@/lib/mock-data';
import { Building2, Users, BookCheck, ShieldCheck, TrendingUp, AlertTriangle, History, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const totalStudents = MOCK_ORGANIZATIONS.reduce((acc, curr) => acc + curr.studentCount, 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Platform Overview HQ</span>
            <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full uppercase">
              Super Admin Mode
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global management of B2B coaching centers, exam logs, and test material IP.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/organizations"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
          >
            <Building2 className="w-4 h-4 text-[#005C53]" />
            <span>Manage Tenants</span>
          </Link>
          <Link
            href="/admin/materials/new"
            className="inline-flex items-center space-x-2 bg-[#005C53] hover:bg-[#003831] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Test</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Coaching Orgs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#005C53] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{MOCK_ORGANIZATIONS.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Dhaka Branches: Gulshan, Dhanmondi, Uttara</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Student Seats</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalStudents}</div>
          <div className="text-xs text-slate-400 mt-2">Across all coaching tenants</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Test Bank</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#005C53] flex items-center justify-center">
              <BookCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">14</div>
          <div className="text-xs text-emerald-600 font-medium mt-2">Academic & General Training</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">System Health & Uptime</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">99.9%</div>
          <div className="text-xs text-slate-400 mt-2">Vercel Edge / Supabase Ready</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Exam Activity Feed */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#005C53]" />
              <span>Live Exam Feed Across Centers</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Real-time log</span>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_EXAM_LOGS.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <span>{log.studentName}</span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {log.studentId}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {log.orgName} • {log.testTitle}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-100 text-[#005C53] text-xs px-2.5 py-1 rounded-full font-extrabold">
                    Band {log.overallBand}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{log.completedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly & Quality Alerts */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Question Difficulty & Anomaly Flags</span>
            </h2>
          </div>

          <div className="space-y-3">
            {MOCK_ANOMALIES.map((anom) => (
              <div
                key={anom.questionId}
                className="p-4 bg-red-50/50 rounded-xl border border-red-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    {anom.issueFlag}
                  </span>
                  <span className="text-xs font-mono font-bold text-red-600">
                    {anom.passRatePercentage}% pass rate
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">{anom.prompt}</div>
                <div className="text-[11px] text-slate-500">
                  Module: {anom.module} • {anom.testTitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs Snippet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <History className="w-5 h-5 text-[#005C53]" />
            <span>Platform Security & Audit Trail</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">3 Recent Events</span>
        </div>

        <div className="divide-y divide-slate-100">
          {MOCK_AUDIT_LOGS.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">{log.action}</span>
                <div className="text-slate-500">Target: {log.target}</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-slate-600 font-semibold">{log.actor} ({log.role})</span>
                <div className="text-slate-400 text-[10px]">{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
