'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { ArrowLeft } from 'lucide-react';
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

      // 1. Superadmin / Manager Auth
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

      // 4. Student Auth
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

      setError('Invalid email/ID or password. Please try again.');
      setIsLoading(false);
    }, 600);
  };


  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brick)] selection:text-white">
      
      {/* --- Left Column - Brand --- */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[var(--ink)] text-[var(--paper)] border-r border-[var(--ink-soft)] relative overflow-hidden">
        {/* Subtle decorative elements matching the editorial style */}
        <div className="absolute top-0 right-0 p-8 font-mono text-[10px] text-[var(--ink-soft)] tracking-widest uppercase">
          Portal Access v2.1
        </div>

        <div className="z-10">
          <Link href="/" className="font-display text-[26px] flex items-baseline gap-1.5 hover:opacity-80 transition-opacity w-fit">
            IELTSSync <span className="font-mono text-[12px] text-[var(--brick)] border border-[var(--brick)] rounded-[3px] px-1.5 py-[1px] tracking-[0.04em]">BD</span>
          </Link>
          <div className="mt-16 max-w-sm">
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--gold)] mb-4 flex items-center gap-2">
              <div className="w-[6px] h-[6px] rounded-full bg-[var(--gold)]"></div>
              Official Mock Testing
            </div>
            <h1 className="font-display text-[46px] leading-[1.1] mb-6">
              Enter the test environment.
            </h1>
            <p className="text-[16px] text-[#B9C4D2] leading-[1.65]">
              Please sign in with your credentials.
            </p>
          </div>

        </div>

        <div className="z-10 text-[13px] text-[#7C8FA6] font-mono flex items-center justify-between mt-12">
          <span>© 2026 IELTSSync Bangladesh</span>
          <Link href="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </Link>
        </div>
      </div>

      {/* --- Right Column - Form --- */}
      <div className="flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-24">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden mb-12">
          <Link href="/" className="font-display text-[26px] flex items-baseline gap-1.5 w-fit">
            IELTSSync <span className="font-mono text-[12px] text-[var(--brick)] border border-[var(--brick)] rounded-[3px] px-1.5 py-[1px] tracking-[0.04em]">BD</span>
          </Link>
        </div>

        <div className="w-full max-w-[400px] mx-auto">
          <div className="mb-10">
            <h2 className="font-display text-[32px] mb-2">Sign in</h2>
            <p className="text-[15px] text-[var(--ink-soft)]">
              Welcome back. Enter your details below.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--ink-soft)]">
                Email / Student ID
              </label>
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] text-[15px] focus:outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition-colors placeholder:text-[var(--ink-faint)]"
                placeholder="e.g. STU-1234"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--ink-soft)]">
                  Password
                </label>
                <a href="#" className="font-mono text-[11.5px] text-[var(--brick)] hover:text-[var(--brick-dark)] transition-colors">
                  Forgot?
                </a>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] text-[15px] focus:outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition-colors placeholder:text-[var(--ink-faint)]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[3px] text-[13.5px] text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-[var(--brick)] hover:bg-[var(--brick-dark)] text-white py-3.5 rounded-[3px] text-[15px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[52px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-8 pt-6 border-t border-[var(--line-soft)]">
            <div className="text-xs font-mono uppercase tracking-[0.05em] text-[var(--ink-faint)] mb-3 text-center">
              Quick Demo Accounts
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail('rashid@apex.com'); setPassword('password123'); }}
                className="p-2 bg-[var(--paper-card)] hover:bg-slate-100 border border-[var(--line)] rounded text-left transition-colors"
              >
                <div className="font-bold text-[var(--ink)]">Center Admin</div>
                <div className="text-[10px] text-slate-500 font-mono">rashid@apex.com</div>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('sarah.ielts@apex.edu'); setPassword('password123'); }}
                className="p-2 bg-blue-50/50 hover:bg-blue-100/60 border border-blue-200 rounded text-left transition-colors"
              >
                <div className="font-bold text-blue-950 flex items-center gap-1">
                  <span>Teacher / Examiner</span>
                </div>
                <div className="text-[10px] text-blue-800 font-mono">sarah.ielts@apex.edu</div>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('STU-8821'); setPassword('student123'); }}
                className="p-2 bg-[var(--paper-card)] hover:bg-slate-100 border border-[var(--line)] rounded text-left transition-colors"
              >
                <div className="font-bold text-[var(--ink)]">Student Candidate</div>
                <div className="text-[10px] text-slate-500 font-mono">STU-8821</div>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('admin@mockielts.com'); setPassword('admin123'); }}
                className="p-2 bg-[var(--paper-card)] hover:bg-slate-100 border border-[var(--line)] rounded text-left transition-colors"
              >
                <div className="font-bold text-[var(--ink)]">Super Admin HQ</div>
                <div className="text-[10px] text-slate-500 font-mono">admin@mockielts.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
