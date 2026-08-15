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
            <Link href="#skills" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Skills</Link>
            <Link href="#centers" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">For coaching centers</Link>
            <Link href="#payments" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Pricing</Link>
            <Link href="/login" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Log in</Link>
          </div>
          <Link href="/login" className="hidden md:inline-block text-[14px] font-medium text-white bg-[var(--brick)] hover:bg-[var(--brick-dark)] px-5 py-2.5 rounded-[3px] transition-colors whitespace-nowrap">
            Start free
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
              Free practice tests · Real band scores
            </div>
            <h1 className="font-display font-normal text-[42px] lg:text-[56px] leading-[1.08] tracking-[-0.01em] text-[var(--ink)] max-w-none lg:max-w-[12ch]">
              Know your band <em className="italic text-[var(--brick)]">before</em> test day.
            </h1>
            <p className="mt-6 text-[16px] lg:text-[17.5px] text-[var(--ink-soft)] max-w-[44ch] leading-[1.65]">
              Full-length IELTS mock tests with timed sections, proctored writing and speaking, and scoring you can trust — built for students preparing in Bangladesh, and the coaching centers that teach them.
            </p>
            <div className="flex items-center gap-5 mt-9 flex-wrap">
              <Link href="/login" className="bg-[var(--ink)] hover:bg-[#25384f] text-[var(--paper)] text-[15px] font-medium px-6 py-3.5 rounded-[3px] transition-colors">
                Take a free mock test
              </Link>
              <Link href="#centers" className="text-[14.5px] text-[var(--ink)] border-b border-[var(--ink)] pb-[2px]">
                For coaching centers →
              </Link>
            </div>
            <div className="mt-8 flex gap-7 font-mono text-[12px] lg:text-[12.5px] text-[var(--ink-faint)] flex-wrap">
              <span><b className="text-[var(--ink-soft)] font-medium">4</b> sections scored</span>
              <span><b className="text-[var(--ink-soft)] font-medium">AI + human</b> writing review</span>
              <span><b className="text-[var(--ink-soft)] font-medium">bKash · Nagad · Rocket</b> supported</span>
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
              Each mock follows official timing and format. Listening and Reading are marked instantly. Writing and Speaking get a first pass from AI, then a final review from a real teacher.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--line)] border border-[var(--line)]">
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="1.5" y="14" width="5" height="7" rx="1.5"/><rect x="17.5" y="14" width="5" height="7" rx="1.5"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Listening</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Four recorded sections, one listen, real exam pacing — from everyday conversation to an academic lecture.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--forest)] flex items-center gap-1.5">Instant score</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4h7v17H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M20 4h-7v17h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Reading</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Three passages, forty questions, sixty minutes. Passage difficulty and question types match the real test.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--forest)] flex items-center gap-1.5">Instant score</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 20l1.4-4.9L16.6 3.9a2 2 0 0 1 2.8 0l0.7.7a2 2 0 0 1 0 2.8L9.9 18.6z"/><path d="M13.5 6.5l4 4"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Writing</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Task 1 and Task 2, typed or handwritten. Get an instant AI band estimate, then written feedback from a teacher.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--gold)] flex items-center gap-1.5">AI + teacher scored</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Speaking</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">A recorded three-part interview with a real examiner or through our booth, reviewed and scored by a teacher.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--gold)] flex items-center gap-1.5">Teacher scored</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="py-[100px]">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="max-w-[56ch] mb-12">
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--ink-faint)] mb-3">Getting started</div>
            <h2 className="font-display font-normal text-[28px] lg:text-[34px] leading-[1.2] text-[var(--ink)]">From sign-up to score report in one sitting.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-11 mt-3">
            <div className="pt-5 border-t border-[var(--line)]">
              <div className="font-mono text-[13px] text-[var(--brick)] mb-3.5">01</div>
              <div className="font-display text-[22px] mb-2.5">Register free</div>
              <div className="text-[15px] text-[var(--ink-soft)] leading-[1.6]">Create an account and get free credits to start — no card required. Coaching center students log in with credentials their center sets up.</div>
            </div>
            <div className="pt-5 border-t border-[var(--line)]">
              <div className="font-mono text-[13px] text-[var(--brick)] mb-3.5">02</div>
              <div className="font-display text-[22px] mb-2.5">Sit the mock</div>
              <div className="text-[15px] text-[var(--ink-soft)] leading-[1.6]">Take all four sections in one timed session. Fullscreen and webcam checks keep the test conditions honest, the same as exam day.</div>
            </div>
            <div className="pt-5 border-t border-[var(--line)]">
              <div className="font-mono text-[13px] text-[var(--brick)] mb-3.5">03</div>
              <div className="font-display text-[22px] mb-2.5">Get your band</div>
              <div className="text-[15px] text-[var(--ink-soft)] leading-[1.6]">Listening and Reading are scored the moment you finish. Writing and Speaking follow within days, with a teacher's notes attached.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- COACHING CENTERS ---------- */}
      <section className="py-[100px] bg-[var(--ink)] text-[var(--paper)]" id="centers">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
            <div>
              <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[#8CA0B8] mb-3">For coaching centers</div>
              <h2 className="font-display font-normal text-[28px] lg:text-[34px] leading-[1.2] text-[var(--paper)]">Run mocks for every batch, without building it yourself.</h2>
              <p className="mt-3.5 text-[16px] text-[#B9C4D2] leading-[1.65]">
                We set up your center's account, roster, and staff access. Your teachers score Writing and Speaking; we handle the testing platform.
              </p>
              <ul className="list-none mt-9 flex flex-col gap-5">
                <li className="flex gap-3.5 text-[15px] text-[#DCE3EA] leading-[1.55]">
                  <span className="font-mono text-[12px] text-[var(--gold)] shrink-0 pt-[3px]">→</span>
                  Provision an unlimited number of student accounts per batch, enrolled across as many centers as you run.
                </li>
                <li className="flex gap-3.5 text-[15px] text-[#DCE3EA] leading-[1.55]">
                  <span className="font-mono text-[12px] text-[var(--gold)] shrink-0 pt-[3px]">→</span>
                  Set fine-grained access per staff member — who can score, who can view results, who manages billing.
                </li>
                <li className="flex gap-3.5 text-[15px] text-[#DCE3EA] leading-[1.55]">
                  <span className="font-mono text-[12px] text-[var(--gold)] shrink-0 pt-[3px]">→</span>
                  Pay by prepaid credit wallet, topped up through bKash, Nagad, or Rocket.
                </li>
                <li className="flex gap-3.5 text-[15px] text-[#DCE3EA] leading-[1.55]">
                  <span className="font-mono text-[12px] text-[var(--gold)] shrink-0 pt-[3px]">→</span>
                  Track every batch's band progress in one gradebook, exportable when parents ask.
                </li>
              </ul>
              <Link href="/login" className="mt-9 inline-block bg-[var(--paper)] text-[var(--ink)] px-6 py-3.5 rounded-[3px] text-[15px] font-medium transition-transform hover:scale-105 active:scale-95">
                Talk to us about your center
              </Link>
            </div>
            
            <div className="dash">
              <div className="dash-head">
                <span className="dash-title">Batch 14 — evening</span>
                <span className="dash-badge">42 students</span>
              </div>
              <table className="roster w-full border-collapse font-mono text-[12.5px]">
                <thead>
                  <tr>
                    <th className="text-left font-normal text-[#7C8FA6] px-2.5 py-2 border-b border-[#33455F] text-[11px] uppercase tracking-[0.04em]">Student</th>
                    <th className="text-left font-normal text-[#7C8FA6] px-2.5 py-2 border-b border-[#33455F] text-[11px] uppercase tracking-[0.04em]">Last mock</th>
                    <th className="text-left font-normal text-[#7C8FA6] px-2.5 py-2 border-b border-[#33455F] text-[11px] uppercase tracking-[0.04em]">Band</th>
                    <th className="text-left font-normal text-[#7C8FA6] px-2.5 py-2 border-b border-[#33455F] text-[11px] uppercase tracking-[0.04em]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">Rima T.</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">Aug 12</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">7.0</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]"><span className="pill pass">On target</span></td></tr>
                  <tr><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">Farhan K.</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">Aug 12</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">6.0</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]"><span className="pill mid">Needs writing</span></td></tr>
                  <tr><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">Anika S.</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">Aug 10</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">7.5</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]"><span className="pill pass">On target</span></td></tr>
                  <tr><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">Tanvir H.</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">Aug 9</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]">5.5</td><td className="px-2.5 py-2.5 border-b border-[#2A3B54] text-[#DCE3EA]"><span className="pill mid">Needs speaking</span></td></tr>
                  <tr><td className="px-2.5 py-2.5 text-[#DCE3EA]">Nusrat J.</td><td className="px-2.5 py-2.5 text-[#DCE3EA]">Aug 9</td><td className="px-2.5 py-2.5 text-[#DCE3EA]">6.5</td><td className="px-2.5 py-2.5 text-[#DCE3EA]"><span className="pill pass">On target</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PAYMENTS ---------- */}
      <section className="py-[96px] border-t border-[var(--line-soft)]" id="payments">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--ink-faint)] mb-3">Credits, not subscriptions</div>
              <h2 className="font-display font-normal text-[28px] lg:text-[34px] leading-[1.2] text-[var(--ink)]">Pay for the mocks you take.</h2>
              <p className="mt-3.5 text-[16px] text-[var(--ink-soft)] leading-[1.65]">
                Students start with free credits. Need more, or want to book Writing and Speaking review? Top up your wallet with any local payment method — no card, no recurring charge.
              </p>
              <div className="flex gap-2.5 mt-6">
                <span className="font-mono text-[11.5px] px-3 py-1.5 border border-[var(--line)] rounded-[3px] text-[var(--ink-soft)]">bKash</span>
                <span className="font-mono text-[11.5px] px-3 py-1.5 border border-[var(--line)] rounded-[3px] text-[var(--ink-soft)]">Nagad</span>
                <span className="font-mono text-[11.5px] px-3 py-1.5 border border-[var(--line)] rounded-[3px] text-[var(--ink-soft)]">Rocket</span>
              </div>
            </div>
            
            <div className="bg-[var(--paper-card)] border border-[var(--line)] rounded-[4px] p-7">
              <div className="flex justify-between items-center py-3.5 border-b border-[var(--line-soft)]"><span className="text-[14.5px] text-[var(--ink-soft)]">Sign-up credit</span><span className="font-mono text-[14.5px] text-[var(--ink)] font-medium">1 free mock</span></div>
              <div className="flex justify-between items-center py-3.5 border-b border-[var(--line-soft)]"><span className="text-[14.5px] text-[var(--ink-soft)]">Full mock (4 sections)</span><span className="font-mono text-[14.5px] text-[var(--ink)] font-medium">1 credit</span></div>
              <div className="flex justify-between items-center py-3.5 border-b border-[var(--line-soft)]"><span className="text-[14.5px] text-[var(--ink-soft)]">Writing review only</span><span className="font-mono text-[14.5px] text-[var(--ink)] font-medium">0.5 credit</span></div>
              <div className="flex justify-between items-center py-3.5 border-b border-[var(--line-soft)]"><span className="text-[14.5px] text-[var(--ink-soft)]">Speaking review only</span><span className="font-mono text-[14.5px] text-[var(--ink)] font-medium">0.5 credit</span></div>
              <div className="flex justify-between items-center py-3.5"><span className="text-[14.5px] text-[var(--ink-soft)]">Center batch package</span><span className="font-mono text-[14.5px] text-[var(--ink)] font-medium">Custom quote</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="py-[110px] text-center">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--ink-faint)] mb-3">No card. No catch.</div>
          <h2 className="font-display font-normal text-[32px] lg:text-[40px] leading-[1.2] text-[var(--ink)] max-w-[16ch] mx-auto">Take your first mock this week.</h2>
          <p className="mt-3.5 text-[16px] text-[var(--ink-soft)] max-w-[44ch] mx-auto leading-[1.65]">
            Register free, sit a full test, and see where your band actually stands.
          </p>
          <div className="flex justify-center gap-5 mt-8 flex-wrap">
            <Link href="/login" className="bg-[var(--ink)] hover:bg-[#25384f] text-[var(--paper)] text-[15px] font-medium px-6 py-3.5 rounded-[3px] transition-colors">
              Start free
            </Link>
            <Link href="#centers" className="text-[14.5px] text-[var(--ink)] border-b border-[var(--ink)] pb-[2px]">
              Set up your coaching center
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-[var(--line-soft)] py-11">
        <div className="max-w-[1120px] mx-auto px-8 flex justify-between items-center flex-wrap gap-4">
          <div className="font-display text-[17px]">IELTSSync</div>
          <div className="flex gap-7 text-[13.5px] text-[var(--ink-soft)]">
            <Link href="#skills" className="hover:text-[var(--ink)] transition-colors">Skills</Link>
            <Link href="#centers" className="hover:text-[var(--ink)] transition-colors">Coaching centers</Link>
            <Link href="#payments" className="hover:text-[var(--ink)] transition-colors">Pricing</Link>
          </div>
          <div className="font-mono text-[12px] text-[var(--ink-faint)]">Dhaka, Bangladesh</div>
        </div>
      </footer>
    </div>
  );
}
