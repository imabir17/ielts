'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { tenants, students, managers, setCurrentUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // 1. Superadmin / Manager Auth
      const manager = managers.find(m => m.email === email && m.password === password);
      if (manager) {
        setCurrentUser({ id: manager.id, role: manager.role, name: manager.name });
        router.push('/admin');
        return;
      }

      // 2. Tenant Auth
      const tenant = tenants.find(t => t.contactEmail === email && t.password === password);
      if (tenant) {
        if (tenant.status === 'suspended') {
          setError('This organization account is currently suspended. Please contact Superadmin.');
          setIsLoading(false);
          return;
        }
        setCurrentUser({ id: tenant.id, role: 'tenant', name: tenant.name, orgAdminName: tenant.orgAdminName });
        router.push('/org');
        return;
      }

      // 3. Student Auth
      // Allow student to login with either email or studentId (case-insensitive)
      const loginId = email.trim().toLowerCase();
      const student = students.find(s => 
        ( (s.email && s.email.toLowerCase() === loginId) || 
          (s.studentId && s.studentId.toLowerCase() === loginId) ) && 
        s.password === password
      );
      if (student) {
        setCurrentUser({ id: student.id, role: 'student', name: student.name, studentId: student.studentId });
        router.push('/student');
        return;
      }

      setError('Invalid email/ID or password. Please try again.');
      setIsLoading(false);
    }, 600); // Fake network delay
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Column - Hero Banner */}
      <div className="lg:col-span-6 bg-gradient-to-br from-[#003831] via-[#005C53] to-[#042A25] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/20 backdrop-blur-md border border-emerald-300/30 flex items-center justify-center text-emerald-300 font-bold text-xl shadow-lg">
            I
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-white">
              MockIELTS
            </span>
            <span className="text-xs uppercase tracking-widest text-emerald-300/80 block font-semibold">
              SaaS Engine
            </span>
          </div>
        </div>

        <div className="my-12 z-10 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Multi-Tenant Coaching Platform</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
            Next-Gen IELTS Simulation Platform.
          </h1>
          <p className="text-emerald-100/80 text-lg leading-relaxed mb-8">
            Empower coaching institutions to host realistic computer-delivered IELTS exam simulations with precise module interfaces and instant analytics.
          </p>
        </div>

        <div className="text-xs text-emerald-200/60 z-10">
          © 2026 MockIELTS Enterprise Platform. Built for Coaching Centers.
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="lg:col-span-6 p-8 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Enter your credentials to access your dashboard.
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 text-left">
              <strong>Demo Credentials:</strong><br/>
              Superadmin: <code className="bg-blue-100 px-1 rounded">admin@mockielts.com</code> / <code className="bg-blue-100 px-1 rounded">admin123</code><br/>
              Tenant: Use credentials created in the Superadmin dashboard.
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email / Student ID</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53] focus:border-[#005C53]"
                  placeholder="admin@mockielts.com or STU-1234"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53] focus:border-[#005C53]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#005C53] hover:bg-[#003831] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="pt-8 text-center text-xs text-slate-400">
            Powered by Next.js 15 App Router & Phthalo Green Design System
          </div>
        </div>
      </div>
    </div>
  );
}
