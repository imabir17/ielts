'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_STUDENTS } from '@/lib/mock-data';
import { Users, Send, GraduationCap, Award, Plus, ArrowRight } from 'lucide-react';

export default function OrgDashboardPage() {
  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Coaching Center Dashboard</span>
            <span className="text-xs bg-emerald-100 text-[#005C53] font-bold px-2.5 py-1 rounded-full uppercase">
              Apex Academy
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your student cohort, generate mock exam IDs, and assign test series.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/org/students"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#005C53]" />
            <span>Generate Student ID</span>
          </Link>
          <Link
            href="/org/assign"
            className="inline-flex items-center space-x-2 bg-[#005C53] hover:bg-[#003831] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
          >
            <Send className="w-4 h-4 text-red-300" />
            <span>Assign Test</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#005C53] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{MOCK_STUDENTS.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-2">Active mock test takers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Exams Assigned</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">2</div>
          <div className="text-xs text-slate-400 mt-2">Ready for student attempt</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Cohort Avg Band</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#005C53] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#005C53]">7.3</div>
          <div className="text-xs text-emerald-600 font-medium mt-2">Target: Band 7.5+</div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-[#003831] to-[#005C53] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="font-bold text-lg text-emerald-200">Prepare for Upcoming Mock Exam Session</h3>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
            Students can log in via their generated Student ID (e.g. STU-8821) and take their assigned IELTS practice test.
          </p>
        </div>
        <Link
          href="/org/assign"
          className="whitespace-nowrap px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-2"
        >
          <span>Assign IELTS Test 01</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Student List preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">Student Roster</h2>
          <Link href="/org/students" className="text-xs font-semibold text-[#005C53] hover:underline">
            View All ({MOCK_STUDENTS.length})
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {MOCK_STUDENTS.map((std) => (
            <div key={std.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div>
                <div className="font-semibold text-slate-900 text-sm">{std.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{std.studentId} • {std.email}</div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">
                  Band {std.averageBand}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
