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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brick)] selection:text-white">
      
      {/* --- Left Column - Brand & Context --- */}
      <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-[var(--ink)] text-[var(--paper)] border-r border-[var(--ink-soft)] relative overflow-hidden">
        
        <div className="z-10">
          <Link href="/" className="font-display text-[26px] flex items-baseline gap-1.5 hover:opacity-85 transition-opacity w-fit">
            IELTSSync <span className="font-mono text-[12px] text-[var(--brick)] border border-[var(--brick)] rounded-[3px] px-1.5 py-[1px] tracking-[0.04em]">BD</span>
          </Link>
          <div className="mt-20 max-w-md">
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--gold)] mb-4 flex items-center gap-2">
              <div className="w-[6px] h-[6px] rounded-full bg-[var(--gold)]"></div>
              Official Mock Testing Platform
            </div>
            <h1 className="font-display text-[46px] leading-[1.1] mb-6 text-white">
              Enter the test environment.
            </h1>
            <p className="text-[16px] text-[#B9C4D2] leading-[1.65]">
              Please sign in with your credentials.
            </p>
          </div>
        </div>

        <div className="z-10 text-[13px] text-[#7C8FA6] font-mono flex items-center justify-between mt-12">
          <span>© 2026 IELTSSync BD</span>
          <Link href="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </Link>
        </div>
      </div>

      {/* --- Right Column: Sign In Form --- */}
      <div className="flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-20 bg-[var(--paper)]">

        
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
              className="w-full bg-[var(--brick)] hover:bg-[var(--brick-dark)] text-white py-3.5 rounded-[3px] text-[14.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[48px] shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign in to Portal"
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

