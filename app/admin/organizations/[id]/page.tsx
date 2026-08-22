'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { getOrgQuota } from '@/lib/quota-manager';
import { Building2, Users, ArrowLeft, ShieldCheck, Mail, MapPin, Key, BookCheck } from 'lucide-react';

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tenants, examLogs, packages, students } = useStore();
  const org = tenants.find((o) => o.id === id) || tenants[0];
  const quota = getOrgQuota(org, packages, students, examLogs);
  const orgLogs = examLogs.filter((l) => l.orgId === org?.id);

  if (!org) return <div className="p-8 text-center text-slate-500">Loading organization details...</div>;

  return (
    <div className="space-y-8 font-sans">
      {/* Back button */}
      <div>
        <Link
          href="/admin/organizations"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#005C53] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Coaching Orgs Directory</span>
        </Link>
      </div>

      {/* Org Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#005C53] text-white flex items-center justify-center font-black text-2xl shadow-md">
              <Building2 className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{org.name}</h1>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {org.code}
                </span>
                <span className="text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {quota.tierName} Plan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {org.location}</span>
                <span>•</span>
                <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> {org.contactEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Center</span>
            </span>
          </div>
        </div>

        {/* Usage Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Student Seat Capacity</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {quota.usedIds} / {quota.totalIdLimit === 'unlimited' ? '∞' : quota.totalIdLimit}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              {quota.remainingIds === 'unlimited' ? 'Unlimited Seats' : `${quota.remainingIds} available seats remaining`}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Exams Quota This Month</div>
            <div className="text-2xl font-extrabold text-[#005C53] mt-1">
              {quota.usedExams} / {quota.totalExamLimit === 'unlimited' ? '∞' : quota.totalExamLimit}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {quota.remainingExams === 'unlimited' ? 'Unlimited Exams' : `${quota.remainingExams} exams remaining`}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Primary Org Admin</div>
            <div className="text-base font-bold text-slate-900 mt-1">{org.orgAdminName}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{org.orgAdminEmail}</div>
          </div>
        </div>
      </div>

      {/* Tenant Exam Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
          <BookCheck className="w-5 h-5 text-[#005C53]" />
          <span>Recent Student Exam Attempts from {org.name}</span>
        </h2>

        {orgLogs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {orgLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{log.studentName} ({log.studentId})</div>
                  <div className="text-xs text-slate-500">{log.testTitle}</div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-100 text-[#005C53] text-xs px-2.5 py-1 rounded-full font-bold">
                    Band {log.overallBand}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{log.completedAt}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed exam logs recorded for this coaching center in the current billing cycle.
          </div>
        )}
      </div>
    </div>
  );
}
