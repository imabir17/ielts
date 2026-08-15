'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MonitorPlay, Users, LayoutDashboard, Sparkles, BookOpen, Clock, PenTool } from 'lucide-react';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Framer Motion spring config based on Apple Design principles
  const springConfig = { type: 'spring' as const, bounce: 0, duration: 0.8 };
  const floatAnimation: any = {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-[#020806] text-white font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* --- Navigation --- */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfig}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-[#005C53] flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(0,196,167,0.3)] border border-emerald-300/20">
              I
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
              MockIELTS
            </span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
            className="hidden md:flex items-center space-x-8 text-sm font-semibold text-emerald-200/60"
          >
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.2 }}
          >
            <Link 
              href="/login" 
              className="group relative inline-flex items-center justify-center px-6 py-2.5 font-bold text-white transition-all duration-200 bg-[#005C53] border border-emerald-400/20 rounded-full hover:bg-[#004A42] hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,92,83,0.5)]"
            >
              <span>Sign In</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div style={{ y: y1, opacity }} className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full bg-emerald-600/10 blur-[120px]" />
          <motion.div style={{ y: y2, opacity }} className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#005C53]/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' as const, bounce: 0, duration: 1 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-red-400" />
            <span>Built for Modern IELTS Coaching Centers</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-emerald-200/50 leading-[1.1] tracking-tight mb-8"
          >
            Deploy Official<br/>IELTS Simulations.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.2 }}
            className="text-lg md:text-2xl text-emerald-100/60 max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
          >
            The ultimate white-label SaaS platform. Issue student IDs, assign official computer-delivered mock tests, and track analytics instantly.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#002A25] font-black rounded-2xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center group"
            >
              <span>Get Started</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-emerald-950/30 text-white border border-emerald-800/50 font-bold rounded-2xl hover:bg-emerald-900/40 transition-all hover:scale-105 active:scale-95 text-lg backdrop-blur-md">
              View Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- Visual Showcase --- */}
      <section className="relative px-6 pb-32">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            animate={floatAnimation}
            className="relative rounded-[2.5rem] border border-emerald-800/30 bg-gradient-to-b from-[#003831]/80 to-[#020806] shadow-2xl p-2 backdrop-blur-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-red-500/10 opacity-50" />
            
            {/* Fake Browser Chrome */}
            <div className="h-12 border-b border-emerald-800/30 flex items-center px-6 space-x-2 bg-[#020806]/50">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Simulated UI Content */}
            <div className="aspect-[16/9] lg:aspect-[21/9] bg-[#020806] p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
               <div className="flex-1 space-y-4">
                 <div className="w-1/3 h-6 rounded-lg bg-emerald-900/30 animate-pulse" />
                 <div className="w-full h-4 rounded-lg bg-emerald-900/20 animate-pulse delay-75" />
                 <div className="w-5/6 h-4 rounded-lg bg-emerald-900/20 animate-pulse delay-100" />
                 <div className="w-4/6 h-4 rounded-lg bg-emerald-900/20 animate-pulse delay-150" />
                 <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="h-24 rounded-2xl bg-emerald-950/40 border border-emerald-800/30" />
                   <div className="h-24 rounded-2xl bg-emerald-950/40 border border-emerald-800/30" />
                 </div>
               </div>
               <div className="flex-1 hidden md:block border border-emerald-800/30 rounded-2xl bg-[#00140F]/50 p-6 relative">
                  <div className="absolute top-4 right-4 text-xs font-bold bg-red-900/40 text-red-400 px-3 py-1 rounded-full border border-red-800/30 flex items-center space-x-2">
                    <Clock className="w-3 h-3" /> <span>29:59</span>
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className="w-full h-12 rounded-xl border border-emerald-800/30 flex items-center px-4 space-x-4">
                      <div className="w-4 h-4 rounded-full border border-emerald-600" />
                      <div className="w-1/2 h-2 rounded bg-emerald-900/40" />
                    </div>
                    <div className="w-full h-12 rounded-xl border-2 border-emerald-600 bg-emerald-900/20 flex items-center px-4 space-x-4">
                      <div className="w-4 h-4 rounded-full border-4 border-emerald-500 bg-emerald-950" />
                      <div className="w-2/3 h-2 rounded bg-emerald-400/60" />
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-24 px-6 bg-[#00140F]/30 border-y border-emerald-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Built for authenticity.</h2>
            <p className="text-emerald-200/60 text-lg max-w-2xl mx-auto">
              Every pixel is designed to exactly mirror the official computer-delivered IELTS exam, giving your students the psychological edge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Split-Screen Reading",
                desc: "Passage on the left, questions on the right. Independent scroll zones just like the real exam."
              },
              {
                icon: MonitorPlay,
                title: "Locked Audio Scrubber",
                desc: "Listening module audio plays once with no rewinding, enforcing strict exam conditions."
              },
              {
                icon: PenTool,
                title: "Writing Word Counter",
                desc: "Real-time character and word counting in a distraction-free text editor interface."
              },
              {
                icon: LayoutDashboard,
                title: "10 Official Types",
                desc: "Drag-and-drop, matching, map labelling, and form completion precisely replicated."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={springConfig}
                className="bg-[#020806] border border-emerald-800/30 p-8 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-900/30 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-emerald-500 group-hover:text-white">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-emerald-200/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 px-6 border-t border-emerald-900/30 bg-[#020806]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm font-medium text-emerald-200/40">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-emerald-900/50 flex items-center justify-center text-emerald-500 font-bold text-xs">
              I
            </div>
            <span>© 2026 MockIELTS Enterprise. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
