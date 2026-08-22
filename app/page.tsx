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
          <div className={`md:flex items-center gap-8 ${navOpen ? 'absolute top-full left-0 right-0 flex-col bg-[var(--paper)] p-8 border-b border-[var(--line-soft)] items-start' : 'hidden'}`}>
            <Link href="#about-ielts" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">About IELTS</Link>
            <Link href="#skills" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Test Modules</Link>
            <Link href="#scoring" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Scoring System</Link>
            <Link href="#features" className="text-[14.5px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Evaluation Workflow</Link>
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
              <Link href="#about-ielts" className="text-[14.5px] text-[var(--ink)] border-b border-[var(--ink)] pb-[2px]">
                About the IELTS Exam →
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

      {/* ---------- ABOUT IELTS & HISTORY ---------- */}
      <section className="py-[100px] bg-[var(--paper-card)] border-y border-[var(--line-soft)]" id="about-ielts">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="max-w-[68ch] mb-12">
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--forest)] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--forest)]"></span>
              The Global Standard in English Proficiency
            </div>
            <h2 className="font-display font-normal text-[32px] lg:text-[40px] leading-[1.15] text-[var(--ink)]">
              What is IELTS? History &amp; Global Heritage.
            </h2>
            <p className="mt-4 text-[16px] text-[var(--ink-soft)] leading-[1.7]">
              The <strong>International English Language Testing System (IELTS)</strong> is the world’s most recognized high-stakes English proficiency test. Established in <strong>1989</strong> through a joint partnership between the <strong>British Council</strong>, <strong>IDP: IELTS Australia</strong>, and <strong>Cambridge Assessment English</strong>, it evaluates authentic communication skills for international education, migration, and professional accreditation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-[var(--paper)] border border-[var(--line)] rounded-[3px]">
              <div className="font-mono text-[11.5px] uppercase tracking-wider text-[var(--gold)] mb-2">12,000+ Organizations</div>
              <h3 className="font-display text-[20px] text-[var(--ink)] mb-2">Universal Recognition</h3>
              <p className="text-[13.5px] text-[var(--ink-soft)] leading-[1.6]">
                Accepted across 140+ countries by world-class universities in the UK, USA, Canada, Australia, and New Zealand, as well as multinational employers and immigration departments.
              </p>
            </div>

            <div className="p-6 bg-[var(--paper)] border border-[var(--line)] rounded-[3px]">
              <div className="font-mono text-[11.5px] uppercase tracking-wider text-[var(--forest)] mb-2">3.5M+ Tests Yearly</div>
              <h3 className="font-display text-[20px] text-[var(--ink)] mb-2">Fair &amp; Standardized</h3>
              <p className="text-[13.5px] text-[var(--ink-soft)] leading-[1.6]">
                Developed by international teams of linguists to eliminate cultural bias, reflecting real-world English used in higher education and international workplaces.
              </p>
            </div>

            <div className="p-6 bg-[var(--paper)] border border-[var(--line)] rounded-[3px]">
              <div className="font-mono text-[11.5px] uppercase tracking-wider text-[var(--brick)] mb-2">Academic vs General</div>
              <h3 className="font-display text-[20px] text-[var(--ink)] mb-2">Two Distinct Formats</h3>
              <p className="text-[13.5px] text-[var(--ink-soft)] leading-[1.6]">
                <strong>Academic</strong> tests suitability for undergraduate/postgraduate study and professional registration. <strong>General Training</strong> focuses on workplace and migration context.
              </p>
            </div>
          </div>

          {/* Test Format Breakdown Table */}
          <div className="p-6 md:p-8 bg-[var(--paper)] border border-[var(--line)] rounded-[3px]">
            <h3 className="font-display text-[22px] text-[var(--ink)] mb-1">Test Format &amp; Module Overview</h3>
            <p className="text-[13.5px] text-[var(--ink-soft)] mb-6">
              The complete exam assesses all four language skills in approximately 2 hours and 45 minutes.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">
                    <th className="pb-3 pr-4">Module</th>
                    <th className="pb-3 pr-4">Duration</th>
                    <th className="pb-3 pr-4">Structure</th>
                    <th className="pb-3">Key Focus Areas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line-soft)] text-[13.5px] font-sans">
                  <tr>
                    <td className="py-3.5 pr-4 font-bold text-[var(--ink)] font-mono">Listening</td>
                    <td className="py-3.5 pr-4 font-mono text-[var(--ink-soft)]">30 mins + review</td>
                    <td className="py-3.5 pr-4 text-[var(--ink-soft)]">4 recorded sections · 40 questions</td>
                    <td className="py-3.5 text-[var(--ink-soft)]">Everyday dialogues, monologues, academic group discussions &amp; lectures.</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-bold text-[var(--ink)] font-mono">Reading</td>
                    <td className="py-3.5 pr-4 font-mono text-[var(--ink-soft)]">60 mins</td>
                    <td className="py-3.5 pr-4 text-[var(--ink-soft)]">3 long passages · 40 questions</td>
                    <td className="py-3.5 text-[var(--ink-soft)]">Skimming, scanning, identifying writer viewpoint (True/False/Not Given, Headings).</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-bold text-[var(--ink)] font-mono">Writing</td>
                    <td className="py-3.5 pr-4 font-mono text-[var(--ink-soft)]">60 mins</td>
                    <td className="py-3.5 pr-4 text-[var(--ink-soft)]">Task 1 (150 words) + Task 2 (250 words)</td>
                    <td className="py-3.5 text-[var(--ink-soft)]">Data/diagram description (Task 1) and formal discursive argument essay (Task 2).</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-bold text-[var(--ink)] font-mono">Speaking</td>
                    <td className="py-3.5 pr-4 font-mono text-[var(--ink-soft)]">11–14 mins</td>
                    <td className="py-3.5 pr-4 text-[var(--ink-soft)]">3-part interactive interview</td>
                    <td className="py-3.5 text-[var(--ink-soft)]">Part 1 (Intro), Part 2 (Cue card monologue), Part 3 (In-depth abstract discussion).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- TEST MODULES IN DETAIL ---------- */}
      <section className="py-[100px] bg-[var(--paper-alt)] border-b border-[var(--line-soft)]" id="skills">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="max-w-[56ch] mb-12">
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--ink-faint)] mb-3">Modular Structure</div>
            <h2 className="font-display font-normal text-[28px] lg:text-[34px] leading-[1.2] text-[var(--ink)]">Exam Modules Built for Accurate Simulation.</h2>
            <p className="mt-3.5 text-[16px] text-[var(--ink-soft)] leading-[1.65]">
              Our platform recreates the official computer-delivered IELTS environment with high fidelity across all four test sections.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--line)] border border-[var(--line)]">
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="1.5" y="14" width="5" height="7" rx="1.5"/><rect x="17.5" y="14" width="5" height="7" rx="1.5"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Listening</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Four audio sections played once with realistic exam pacing, British/Australian/North American accents, and 40 questions.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--forest)] flex items-center gap-1.5">Instant score</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4h7v17H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M20 4h-7v17h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Reading</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Split-screen passage reading with passage tabs, instant question navigation, and all authentic question formats.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--forest)] flex items-center gap-1.5">Instant score</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 20l1.4-4.9L16.6 3.9a2 2 0 0 1 2.8 0l0.7.7a2 2 0 0 1 0 2.8L9.9 18.6z"/><path d="M13.5 6.5l4 4"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Writing</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">Task 1 &amp; Task 2 visual prompts with real-time word counting, countdown timer alerts, and certified faculty grading.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--gold)] flex items-center gap-1.5">Faculty Examiner Scored</div>
            </div>
            
            <div className="bg-[var(--paper-alt)] p-6 lg:p-8 min-h-[250px] flex flex-col">
              <div className="w-[30px] h-[30px] mb-5 text-[var(--brick)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3"/></svg>
              </div>
              <div className="font-display text-[21px] mb-2.5">Speaking</div>
              <div className="text-[14.5px] text-[var(--ink-soft)] leading-[1.6] flex-1">3-part interview simulation scored across Fluency, Lexical Resource, Grammatical Range, and Pronunciation.</div>
              <div className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-[var(--gold)] flex items-center gap-1.5">Examiner Evaluated</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 9-BAND SCORING SYSTEM & CALCULATION ---------- */}
      <section className="py-[100px] bg-[var(--paper)] border-b border-[var(--line-soft)]" id="scoring">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="max-w-[64ch] mb-12">
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[var(--gold)] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
              Standardized Assessment
            </div>
            <h2 className="font-display font-normal text-[32px] lg:text-[38px] leading-[1.18] text-[var(--ink)]">
              The 9-Band Scoring Scale &amp; Calculation Formula.
            </h2>
            <p className="mt-4 text-[16px] text-[var(--ink-soft)] leading-[1.7]">
              IELTS scores are reported on a 9-band scale from 1 (Non-user) to 9 (Expert user). Candidates receive an individual band score for each of the four modules, as well as an <strong>Overall Band Score</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-12">
            {/* Calculation Formula Card */}
            <div className="p-7 bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] space-y-4">
              <h3 className="font-display text-[22px] text-[var(--ink)] m-0">How the Overall Band is Calculated</h3>
              <p className="text-[14px] text-[var(--ink-soft)] leading-[1.65]">
                The Overall Band Score is the arithmetic average of the four module scores, rounded to the nearest half or whole band:
              </p>
              
              <div className="p-4 bg-[var(--paper)] border border-[var(--line)] font-mono text-[13px] rounded space-y-2 text-[var(--ink)]">
                <div className="text-[var(--forest)] font-bold">Overall Band = (Listening + Reading + Writing + Speaking) ÷ 4</div>
                <div className="text-xs text-[var(--ink-soft)] border-t border-[var(--line-soft)] pt-2 space-y-1">
                  <div>• If average ends in <strong>.25</strong> → Rounds <strong>UP</strong> to <strong>.5</strong> (e.g. 6.25 → 6.5)</div>
                  <div>• If average ends in <strong>.75</strong> → Rounds <strong>UP</strong> to next whole band (e.g. 6.75 → 7.0)</div>
                  <div>• If average ends in <strong>.125</strong> or <strong>.625</strong> → Rounds down (e.g. 6.125 → 6.0, 6.625 → 6.5)</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-bold text-[13.5px] text-[var(--ink)] mb-1">Example Calculation:</div>
                <div className="text-[13px] text-[var(--ink-soft)] font-mono">
                  Listening: 7.0 | Reading: 6.5 | Writing: 6.0 | Speaking: 7.0<br />
                  Average = (7.0 + 6.5 + 6.0 + 7.0) / 4 = 6.625 → <strong>Overall Band: 6.5</strong>
                </div>
              </div>
            </div>

            {/* Assessment Criteria (4 Pillars) */}
            <div className="p-7 bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px] space-y-4">
              <h3 className="font-display text-[22px] text-[var(--ink)] m-0">Writing &amp; Speaking Assessment Pillars</h3>
              <p className="text-[14px] text-[var(--ink-soft)] leading-[1.65]">
                Examiners evaluate productive skills against four standard descriptors, each carrying an equal 25% weighting:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded text-xs">
                  <div className="font-bold text-[var(--ink)] mb-1">1. Task Achievement / Response</div>
                  <div className="text-[var(--ink-soft)] leading-snug">Addresses all parts of prompt with well-developed ideas.</div>
                </div>
                <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded text-xs">
                  <div className="font-bold text-[var(--ink)] mb-1">2. Coherence &amp; Cohesion</div>
                  <div className="text-[var(--ink-soft)] leading-snug">Logical paragraphing, seamless linking words and clear progression.</div>
                </div>
                <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded text-xs">
                  <div className="font-bold text-[var(--ink)] mb-1">3. Lexical Resource</div>
                  <div className="text-[var(--ink-soft)] leading-snug">Wide range of vocabulary, precise collocation and idiom usage.</div>
                </div>
                <div className="p-3 bg-[var(--paper)] border border-[var(--line)] rounded text-xs">
                  <div className="font-bold text-[var(--ink)] mb-1">4. Grammatical Range &amp; Accuracy</div>
                  <div className="text-[var(--ink-soft)] leading-snug">Complex structures with high accuracy and punctuation control.</div>
                </div>
              </div>
            </div>
          </div>

          {/* 9-Band Descriptors Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[12.5px]">
            <div className="p-4 bg-[var(--paper-card)] border border-[var(--line)] rounded">
              <div className="font-bold text-[var(--ink)] text-sm mb-1">Band 9 · Expert User</div>
              <div className="text-xs text-[var(--ink-soft)] font-sans">Full operational command: appropriate, fluent, and complete understanding.</div>
            </div>
            <div className="p-4 bg-[var(--paper-card)] border border-[var(--line)] rounded">
              <div className="font-bold text-[var(--ink)] text-sm mb-1">Band 8 · Very Good User</div>
              <div className="text-xs text-[var(--ink-soft)] font-sans">Fully operational command with only occasional unsystematic inaccuracies.</div>
            </div>
            <div className="p-4 bg-[var(--paper-card)] border border-[var(--line)] rounded">
              <div className="font-bold text-[var(--ink)] text-sm mb-1">Band 7 · Good User</div>
              <div className="text-xs text-[var(--ink-soft)] font-sans">Operational command with occasional inaccuracies and misunderstandings in some situations.</div>
            </div>
            <div className="p-4 bg-[var(--paper-card)] border border-[var(--line)] rounded">
              <div className="font-bold text-[var(--ink)] text-sm mb-1">Band 6 · Competent User</div>
              <div className="text-xs text-[var(--ink-soft)] font-sans">Generally effective command with some inaccuracies, inappropriate usage, and misunderstandings.</div>
            </div>
            <div className="p-4 bg-[var(--paper-card)] border border-[var(--line)] rounded">
              <div className="font-bold text-[var(--ink)] text-sm mb-1">Band 5 · Modest User</div>
              <div className="text-xs text-[var(--ink-soft)] font-sans">Partial command of the language, coping with overall meaning in most situations with errors.</div>
            </div>
            <div className="p-4 bg-[var(--paper-card)] border border-[var(--line)] rounded">
              <div className="font-bold text-[var(--ink)] text-sm mb-1">Band 4 · Limited User</div>
              <div className="text-xs text-[var(--ink-soft)] font-sans">Basic competence is limited to familiar situations; frequent problems in understanding and expression.</div>
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
            <Link href="#about-ielts" className="hover:text-[var(--ink)] transition-colors">About IELTS</Link>
            <Link href="#skills" className="hover:text-[var(--ink)] transition-colors">Test Modules</Link>
            <Link href="#scoring" className="hover:text-[var(--ink)] transition-colors">Scoring Scale</Link>
            <Link href="/login" className="hover:text-[var(--ink)] transition-colors">Portal Login</Link>
          </div>
          <div className="font-mono text-[12px] text-[var(--ink-faint)]">Computer-Delivered IELTS Testing</div>
        </div>
      </footer>
    </div>
  );
}
