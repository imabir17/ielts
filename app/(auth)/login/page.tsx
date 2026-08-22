'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { 
  ArrowLeft, Headphones, BookOpen, Edit3, Mic, 
  GraduationCap, ShieldCheck, Award, Building2, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { tenants, students, managers, teachers, setCurrentUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Superadmin / Platform Manager Auth
      const manager = managers.find(m => m.email?.toLowerCase() === cleanEmail && m.password === password);
      if (manager) {
        setCurrentUser({ id: manager.id, role: manager.role, name: manager.name });
        router.push('/admin');
        return;
      }

      // 2. Tenant Auth (Coaching Center Admin)
      const tenant = tenants.find(t => t.contactEmail?.toLowerCase() === cleanEmail && t.password === password);
      if (tenant) {
        setCurrentUser({ id: tenant.id, role: 'tenant', name: tenant.name });
        router.push('/org');
        return;
      }

      // 3. Teacher / Examiner Auth
      const teacher = teachers.find(t => t.email?.toLowerCase() === cleanEmail && (t.password === password || (!t.password && password === 'teacher123')));
      if (teacher) {
        setCurrentUser({
          id: teacher.id,
          role: 'teacher',
          name: teacher.name,
          email: teacher.email,
          orgId: teacher.orgId,
          specialization: teacher.specialization
        });
        router.push('/org/results');
        return;
      }

      // 4. Student Candidate Auth
      const student = students.find(s => 
        ( (s.email && s.email.toLowerCase() === cleanEmail) || 
          (s.studentId && s.studentId.toLowerCase() === cleanEmail) ) && 
        s.password === password
      );
      if (student) {
        setCurrentUser({
          id: student.id,
          role: 'student',
          name: student.name,
          studentId: student.studentId,
          email: student.email,
          orgId: student.orgId,
          assignedTests: student.assignedTests || []
        });
        router.push('/student');
        return;
      }

      setError('Invalid email/candidate ID or password. Please check your credentials and try again.');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brick)] selection:text-white">
      
      {/* --- Left Column: Platform Features & Architecture --- */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 lg:p-16 bg-[var(--ink)] text-[var(--paper)] border-r border-[var(--ink-soft)] relative overflow-hidden">
        
        {/* Subtle top metadata */}
        <div className="flex items-center justify-between z-10">
          <Link href="/" className="font-display text-[26px] flex items-baseline gap-1.5 hover:opacity-85 transition-opacity">
            IELTSSync <span className="font-mono text-[12px] text-[var(--brick)] border border-[var(--brick)] rounded-[3px] px-1.5 py-[1px] tracking-[0.04em]">BD</span>
          </Link>
          <div className="font-mono text-[11px] text-[#8E9DB2] tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Testing Engine
          </div>
        </div>

        {/* Center Content: Headline & Feature Highlights */}
        <div className="z-10 my-10 max-w-xl">
          <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--gold)] mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--gold)]" />
            Standardized IELTS Assessment System
          </div>
          <h1 className="font-display text-[42px] xl:text-[46px] leading-[1.12] mb-5 text-white">
            Computer-Delivered Testing &amp; Faculty Evaluation.
          </h1>
          <p className="text-[15.5px] text-[#B9C4D2] leading-[1.65] mb-8">
            Complete institutional testing infrastructure designed for students, certified IELTS faculties, and coaching center administrators.
          </p>

          {/* Feature Grid */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border border-white/10 rounded-[4px]">
              <div className="w-8 h-8 rounded bg-[var(--forest)]/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white text-[14px]">Full 4-Module Examination Suite</div>
                <div className="text-[12.5px] text-[#A2B1C6] mt-0.5 leading-snug">
                  Official computer-delivered format with synchronized audio listening, split-screen reading passages, timed writing, and speaking mock interviews.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border border-white/10 rounded-[4px]">
              <div className="w-8 h-8 rounded bg-[var(--brick)]/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white text-[14px]">Faculty Examiner Evaluation &amp; Moderation</div>
                <div className="text-[12.5px] text-[#A2B1C6] mt-0.5 leading-snug">
                  Certified teachers grade writing tasks with criterion-based bands, override automated answers, and stamp official evaluator nametags.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 bg-white/5 border border-white/10 rounded-[4px]">
              <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white text-[14px]">Coaching Center Management &amp; Dispatch</div>
                <div className="text-[12.5px] text-[#A2B1C6] mt-0.5 leading-snug">
                  Generate student candidate IDs, dispatch assigned mock test batches, track monthly quotas, and publish verified result sheets.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-[12.5px] text-[#7C8FA6] font-mono flex items-center justify-between pt-6 border-t border-white/10">
          <span>© 2026 IELTSSync BD · Examination Suite</span>
          <Link href="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </Link>
        </div>
      </div>

      {/* --- Right Column: Sign In Form --- */}
      <div className="lg:col-span-5 flex flex-col justify-center px-8 py-14 sm:px-14 xl:px-20 bg-[var(--paper)]">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="font-display text-[26px] flex items-baseline gap-1.5 w-fit">
            IELTSSync <span className="font-mono text-[12px] text-[var(--brick)] border border-[var(--brick)] rounded-[3px] px-1.5 py-[1px] tracking-[0.04em]">BD</span>
          </Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto">
          <div className="mb-8">
            <div className="eyebrow mb-1.5"><span className="dot"></span>Portal Authentication</div>
            <h2 className="font-display text-[34px] leading-tight text-[var(--ink)] m-0">Sign in</h2>
            <p className="text-[14.5px] text-[var(--ink-soft)] mt-1.5">
              Please sign in with your credentials to access your portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1.5">
                Email Address or Candidate ID
              </label>
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-3 bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] text-[14.5px] focus:outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition-colors placeholder:text-[var(--ink-faint)]"
                placeholder="e.g. STU-8821 or examiner@apex.edu"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1.5">
                Password
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] text-[14.5px] focus:outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition-colors placeholder:text-[var(--ink-faint)]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[3px] text-[13px] text-red-700 font-medium leading-snug">
                {error}
              </div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-[var(--brick)] hover:bg-[var(--brick-dark)] text-white py-3.5 rounded-[3px] text-[14.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[48px] shadow-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign in to Portal"
              )}
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-8 pt-6 border-t border-[var(--line-soft)]">
            <div className="text-[11px] font-mono uppercase tracking-[0.06em] text-[var(--ink-faint)] mb-3 text-center">
              Quick Test Accounts
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail('STU-8821'); setPassword('student123'); }}
                className="p-2.5 bg-[var(--paper-card)] hover:bg-slate-100 border border-[var(--line)] rounded text-left transition-colors"
              >
                <div className="font-bold text-[var(--ink)]">Student Candidate</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">STU-8821</div>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('sarah.ielts@apex.edu'); setPassword('password123'); }}
                className="p-2.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded text-left transition-colors"
              >
                <div className="font-bold text-blue-950">Teacher / Examiner</div>
                <div className="text-[10px] text-blue-700 font-mono mt-0.5">sarah.ielts@apex.edu</div>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('rashid@apex.com'); setPassword('password123'); }}
                className="p-2.5 bg-[var(--paper-card)] hover:bg-slate-100 border border-[var(--line)] rounded text-left transition-colors"
              >
                <div className="font-bold text-[var(--ink)]">Center Admin</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">rashid@apex.com</div>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('admin@mockielts.com'); setPassword('admin123'); }}
                className="p-2.5 bg-[var(--paper-card)] hover:bg-slate-100 border border-[var(--line)] rounded text-left transition-colors"
              >
                <div className="font-bold text-[var(--ink)]">Super Admin HQ</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">admin@mockielts.com</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
