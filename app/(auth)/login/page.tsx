'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/components/providers/StoreProvider';
import { Mail, Lock, Sparkles, LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { tenants, students, managers, setCurrentUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const springConfig = { type: 'spring' as const, bounce: 0, duration: 0.8 };

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
        setCurrentUser({ id: tenant.id, role: 'tenant', name: tenant.name });
        router.push('/org');
        return;
      }

      // 3. Student Auth
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#020806] font-sans selection:bg-emerald-500/30">
      
      {/* --- Left Column - Hero Banner --- */}
      <div className="lg:col-span-7 bg-gradient-to-br from-[#003831] via-[#005C53] to-[#020806] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex border-r border-emerald-900/30">
        
        {/* Dynamic Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-[100px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-32 -bottom-32 w-[500px] h-[500px] rounded-full bg-red-500/10 blur-[80px]" 
          />
        </div>

        {/* Top Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="flex items-center space-x-3 z-10"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-[#005C53] border border-emerald-300/20 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(0,196,167,0.3)]">
            I
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-white">
              MockIELTS
            </span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-300/80 block font-semibold">
              SaaS Engine
            </span>
          </div>
        </motion.div>

        {/* Hero Copy */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springConfig, delay: 0.2 }}
          className="my-12 z-10 max-w-xl"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#020806]/40 border border-emerald-500/20 text-xs text-emerald-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Multi-Tenant Coaching Platform</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-100 leading-[1.1] mb-6 tracking-tight">
            Next-Gen IELTS Simulation Platform.
          </h1>
          <p className="text-emerald-100/70 text-lg leading-relaxed font-medium">
            Empower coaching institutions to host realistic computer-delivered IELTS exam simulations with precise module interfaces and instant analytics.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs font-medium text-emerald-200/40 z-10 flex items-center justify-between"
        >
          <span>© 2026 MockIELTS Enterprise Platform.</span>
          <Link href="/" className="hover:text-emerald-300 transition-colors flex items-center group">
            <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
        </motion.div>
      </div>

      {/* --- Right Column - Login Form --- */}
      <div className="lg:col-span-5 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="absolute inset-0 bg-[#020806] z-0" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
          className="w-full max-w-md space-y-8 z-10 relative"
        >
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-emerald-100/60 mt-2 text-sm">
              Sign in to access your dashboard and active exams.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-emerald-200/70 uppercase tracking-wider">Email / Student ID</label>
              <div className="relative group">
                <Mail className="w-5 h-5 text-emerald-500/50 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-emerald-400" />
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#00140F]/50 border border-emerald-900/50 text-white text-sm focus:ring-2 focus:ring-[#005C53] focus:border-[#005C53] focus:bg-[#00140F] transition-all placeholder:text-emerald-700/50 shadow-inner"
                  placeholder="admin@mockielts.com or STU-1234"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-emerald-200/70 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="w-5 h-5 text-emerald-500/50 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-emerald-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#00140F]/50 border border-emerald-900/50 text-white text-sm focus:ring-2 focus:ring-[#005C53] focus:border-[#005C53] focus:bg-[#00140F] transition-all placeholder:text-emerald-700/50 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center space-x-2 text-sm text-red-400 backdrop-blur-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full bg-[#005C53] hover:bg-[#004A42] text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,92,83,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-emerald-400/20 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-emerald-900/30">
            <div className="bg-[#00140F]/80 border border-emerald-900/50 p-5 rounded-2xl text-xs space-y-3 backdrop-blur-sm">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider mb-2">Test Credentials</h4>
              <div className="flex items-center justify-between text-emerald-100/70 p-2 rounded-lg hover:bg-emerald-900/20 transition-colors">
                <span>Superadmin</span>
                <span className="font-mono font-medium text-emerald-300">admin@mockielts.com / admin123</span>
              </div>
              <div className="flex items-center justify-between text-emerald-100/70 p-2 rounded-lg hover:bg-emerald-900/20 transition-colors">
                <span>Tenant (Org)</span>
                <span className="font-mono font-medium text-emerald-300">admin@apex.com / password123</span>
              </div>
              <div className="flex items-center justify-between text-emerald-100/70 p-2 rounded-lg hover:bg-emerald-900/20 transition-colors">
                <span>Student</span>
                <span className="font-mono font-medium text-emerald-300">Issue an ID from tenant dashboard</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
