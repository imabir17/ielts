'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [bandPct, setBandPct] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetBand = 7.5;
    const minBand = 4, maxBand = 9;
    const pct = ((targetBand - minBand) / (maxBand - minBand)) * 100;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          requestAnimationFrame(() => {
            setBandPct(pct);
          });
        }
      });
    }, { threshold: 0.3 });
    
    if (panelRef.current) {
      observer.observe(panelRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen text-[var(--ink)] font-sans selection:bg-[var(--brick)] selection:text-white">
      
      {/* ---------- NAV ---------- */}
      <header className="sticky top-0 z-50 bg-[var(--paper)]/90 backdrop-blur-md border-b border-[var(--line-soft)]">
        <nav className="flex items-center justify-between px-8 py-5 max-w-[1120px] mx-auto">
          <div className="font-display text-[22px] tracking-[0.01em] flex items-baseline gap-1.5">
            IELTSSync <span className="font-mono text-[12px] text-[var(--brick)] border border-[var(--brick)] rounded-[3px] px-1.5 py-[1px] tracking-[0.04em]">BD</span>
          </div>
          <div className={`md:flex items-center gap-9 ${navOpen ? 'absolute top-full left-0 right-0 flex-col bg-[var(--paper)] p-8 border-b border-[var(--line-soft)] items-start' : 'hidden'}`}>
            <Link href="#skills" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Test Modules</Link>
            <Link href="#features" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Evaluation &amp; Band Grading</Link>
            <Link href="/login" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Sign in</Link>
          </div>
          <Link href="/login" className="hidden md:inline-block text-[14px] font-medium text-white bg-[var(--brick)] hover:bg-[var(--brick-dark)] px-5 py-2.5 rounded-[3px] transition-colors whitespace-nowrap">
            Sign in to Portal
          </Link>
          <button className="md:hidden bg-transparent border-none cursor-pointer p-1" onClick={() => setNavOpen(!navOpen)} aria-label="Menu">
            <span className="block w-[22px] h-[2px] bg-[var(--ink)] my-1.5"></span>
            <span className="block w-[22px] h-[2px] bg-[var(--ink)] my-1.5"></span>
            <span className="block w-[22px] h-[2px] bg-[var(--ink)] my-1.5"></span>
          </button>
        </nav>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="pt-[88px] pb-[96px]">
        <div className="max-w-[1120px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1.05fr_0.75fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="font-mono text-[12.5px] tracking-[0.08em] uppercase text-[var(--forest)] flex items-center gap-2 mb-5">
              <div className="w-[7px] h-[7px] rounded-full bg-[var(--forest)] inline-block"></div>
              Computer-Delivered Assessment Engine · Real Exam Band Scores
            </div>
            <h1 className="font-display font-normal text-[42px] lg:text-[56px] leading-[1.08] tracking-[-0.01em] text-[var(--ink)] max-w-none lg:max-w-[12ch]">
              Know your band <em className="italic text-[var(--brick)]">before</em> test day.
            </h1>
            <p className="mt-6 text-[16px] lg:text-[17.5px] text-[var(--ink-soft)] max-w-[44ch] leading-[1.65]">
              Full-length IELTS mock exams with timed sections, certified teacher evaluation, and official band calculation — built for candidates and institutions in Bangladesh.
            </p>
            <div className="flex items-center gap-5 mt-9 flex-wrap">
              <Link href="/login" className="bg-[var(--ink)] hover:bg-[#25384f] text-[var(--paper)] text-[15px] font-medium px-6 py-3.5 rounded-[3px] transition-colors">
                Sign in to Portal
              </Link>
              <Link href="#skills" className="text-[14.5px] text-[var(--ink)] border-b border-[var(--ink)] pb-[2px]">
                Explore Modules →
              </Link>
            </div>
            <div className="mt-8 flex gap-7 font-mono text-[12px] lg:text-[12.5px] text-[var(--ink-faint)] flex-wrap">
              <span><b className="text-[var(--ink-soft)] font-medium">4</b> sections scored</span>
              <span><b className="text-[var(--ink-soft)] font-medium">Faculty</b> evaluation console</span>
              <span><b className="text-[var(--ink-soft)] font-medium">0.0 - 9.0</b> IELTS band standard</span>
            </div>
          </div>

          <div className="band-panel" ref={panelRef}>
            <div className="band-panel-head">
              <span className="band-panel-title">Your band scale</span>
              <span className="band-target">Target: 7.5</span>
            </div>
            <div className="band-scale">
              <div className="band-track">
                <div className="band-fill" style={{ height: `${bandPct}%` }}></div>
                <div className="band-marker" style={{ bottom: `${bandPct}%` }} data-band="7.5"></div>
              </div>
              <div className="band-ticks">
                <div className="band-tick"><b>9</b> <span className="desc">Expert user</span></div>
                <div className="band-tick"><b>8</b> <span className="desc">Very good user</span></div>
                <div className="band-tick"><b>7</b> <span className="desc">Good user</span></div>
                <div className="band-tick"><b>6</b> <span className="desc">Competent user</span></div>
                <div className="band-tick"><b>5</b> <span className="desc">Modest user</span></div>
                <div className="band-tick"><b>4</b> <span className="desc">Limited user</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SKILLS ---------- */}
      <section className="py-[100px] bg-[var(--paper-alt)] border-y border-[var(--line-soft)]" id="skills">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="max-w-[56ch] mb-12">
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--ink-faint)] mb-3">All four sections</div>
            <h2 className="font-display font-normal text-[28px] lg:text-[34px] leading-[1.2] text-[var(--ink)]">One test, scored the way the real exam is.</h2>
            <p className="mt-3.5 text-[16px] text-[var(--ink-soft)] leading-[1.65]">
              Each mock follows official timing and computer-delivered format. Listening and Reading are marked instantly, while Writing and Speaking are thoroughly evaluated by certified faculty examiners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--line)] border border-[var(--line)]">
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="1.5" y="14" width="5" height="7" rx="1.5"/><rect x="17.5" y="14" width="5" height="7" rx="1.5"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Listening</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Four recorded sections, synchronized audio, real exam pacing — from everyday conversations to academic lectures.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--forest)] flex items-center gap-1.5">Instant score</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4h7v17H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M20 4h-7v17h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Reading</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Three passages, forty questions, sixty minutes. Passage difficulty and question types match the computer-delivered exam.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--forest)] flex items-center gap-1.5">Instant score</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 20l1.4-4.9L16.6 3.9a2 2 0 0 1 2.8 0l0.7.7a2 2 0 0 1 0 2.8L9.9 18.6z"/><path d="M13.5 6.5l4 4"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Writing</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Task 1 and Task 2 with live word counting, timer alerts, and comprehensive band grading by certified faculty examiners.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--gold)] flex items-center gap-1.5">Faculty Examiner Scored</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Speaking</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Structured 3-part mock interviews conducted by certified examiners with individual criterion scoring and feedback.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--gold)] flex items-center gap-1.5">Examiner Evaluated</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="py-[100px]" id="features">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="max-w-[56ch] mb-12">
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--ink-faint)] mb-3">Structured workflow</div>
            <h2 className="font-display font-normal text-[28px] lg:text-[34px] leading-[1.2] text-[var(--ink)]">From test setup to certified result report.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-11 mt-3">
            <div className="pt-5 border-t border-[var(--line)]">
              <div className="font-mono text-[13px] text-[var(--brick)] mb-3.5">01</div>
              <div className="font-display text-[22px] mb-2.5">Candidate Setup</div>
              <div className="text-[15px] text-[var(--ink-soft)] leading-[1.6]">Candidates log in with credentials issued by their coaching center or institute to access assigned mock exams.</div>
            </div>
            <div className="pt-5 border-t border-[var(--line)]">
              <div className="font-mono text-[13px] text-[var(--brick)] mb-3.5">02</div>
              <div className="font-display text-[22px] mb-2.5">Sit the Mock Exam</div>
              <div className="text-[15px] text-[var(--ink-soft)] leading-[1.6]">Take full-length tests in timed exam conditions replicating the actual computer-delivered IELTS testing interface.</div>
            </div>
            <div className="pt-5 border-t border-[var(--line)]">
              <div className="font-mono text-[13px] text-[var(--brick)] mb-3.5">03</div>
              <div className="font-display text-[22px] mb-2.5">Examiner Evaluation</div>
              <div className="text-[15px] text-[var(--ink-soft)] leading-[1.6]">Objective sections are graded immediately. Writing and Speaking receive teacher moderation with attributed examiner nametags.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="py-[110px] text-center bg-[var(--ink)] text-[var(--paper)]">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[#8CA0B8] mb-3">Authentic Assessment</div>
          <h2 className="font-display font-normal text-[32px] lg:text-[40px] leading-[1.2] text-[var(--paper)] max-w-[18ch] mx-auto">Standardized IELTS Mock Testing.</h2>
          <p className="mt-3.5 text-[16px] text-[#B9C4D2] max-w-[44ch] mx-auto leading-[1.65]">
            Access your student exam portal or center dashboard to begin your evaluation session.
          </p>
          <div className="flex justify-center gap-5 mt-8 flex-wrap">
            <Link href="/login" className="bg-[var(--paper)] hover:bg-[#eaecee] text-[var(--ink)] text-[15px] font-medium px-8 py-3.5 rounded-[3px] transition-colors">
              Sign in to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-[var(--line-soft)] py-11 bg-[var(--paper)]">
        <div className="max-w-[1120px] mx-auto px-8 flex justify-between items-center flex-wrap gap-4">
          <div className="font-display text-[17px]">IELTSSync BD</div>
          <div className="flex gap-7 text-[13.5px] text-[var(--ink-soft)]">
            <Link href="#skills" className="hover:text-[var(--ink)] transition-colors">Test Modules</Link>
            <Link href="#features" className="hover:text-[var(--ink)] transition-colors">Evaluation &amp; Grading</Link>
            <Link href="/login" className="hover:text-[var(--ink)] transition-colors">Portal Login</Link>
          </div>
          <div className="font-mono text-[12px] text-[var(--ink-faint)]">Computer-Delivered IELTS Testing</div>
        </div>
      </footer>
    </div>
  );
}
