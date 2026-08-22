'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getTestById } from '@/lib/test-store';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { ReadingModule } from '@/components/exam/ReadingModule';
import { ListeningModule } from '@/components/exam/ListeningModule';
import { WritingModule } from '@/components/exam/WritingModule';
import { SpeakingModule } from '@/components/exam/SpeakingModule';
import { AccessibilityBar } from '@/components/exam/AccessibilityBar';
import { FloatingNotepad } from '@/components/exam/FloatingNotepad';
import { BookOpen, Headphones, Edit3, Mic, LogOut, CheckCircle2, ChevronRight, AlertCircle, Clock, StickyNote } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { rawToBandScore } from '@/lib/ielts-grading';
import { getOrgQuota } from '@/lib/quota-manager';
import { ExamLog, SpeakingRequest, MOCK_IELTS_TEST } from '@/lib/mock-data';

type ModuleType = 'reading' | 'listening' | 'writing' | 'speaking';
type ExamState = 'setup' | 'warning' | 'taking' | 'completed';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const testId = typeof params?.id === 'string' ? params.id : '';
  const { currentUser, setCurrentUser, examLogs, updateExamLog, addExamLog, addSpeakingRequest, updateStudent, students, tests, tenants, packages } = useStore();


  const [isMounted, setIsMounted] = useState(false);
  const [test, setTest] = useState<any>(null);
  
  const [examState, setExamState] = useState<ExamState>('setup');
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [currentModuleIdx, setCurrentModuleIdx] = useState<number>(0);
  
  const [answers, setAnswers] = useState({
    reading: {} as Record<string, any>,
    listening: {} as Record<string, any>,
    writing: {} as Record<string, any>,
    speaking: {} as Record<string, any>
  });

  const [toast, setToast] = useState<{ msg: string; color: 'amber' | 'red' } | null>(null);
  const [globalVolume, setGlobalVolume] = useState<number>(1);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState<boolean>(false);
  const [listeningDuration, setListeningDuration] = useState<number>(0);

  const existingLog = examLogs.find(l => l.studentId === currentUser?.id && l.testId === testId);




  useEffect(() => {
    setIsMounted(true);
    // Find test from store, getTestById, or fallback to default mock test
    const foundTest = tests.find((t: any) => t.id === testId) || getTestById(testId) || MOCK_IELTS_TEST;
    setTest(foundTest);

    // If no currentUser is logged in, auto-create a fallback candidate session so test is never blocked
    if (!currentUser) {
      const defaultUser = { id: 'std-1', role: 'student', name: 'Candidate', studentId: 'STU-8821' };
      setCurrentUser(defaultUser);
    }

    // Pre-fill answers from existing log if available
    if (existingLog) {
      setAnswers(prev => ({
        ...prev,
        reading: existingLog.answers?.reading || {},
        listening: existingLog.answers?.listening || {},
        writing: existingLog.answers?.writing || {},
        speaking: existingLog.answers?.speaking || {},
      }));
    }
  }, [testId, existingLog, tests, currentUser, setCurrentUser]);

  const activeTest = test || tests.find((t: any) => t.id === testId) || getTestById(testId) || MOCK_IELTS_TEST;

  if (!isMounted) {
    return <div className="p-10 text-center text-[var(--ink-faint)] font-mono text-[11px] uppercase tracking-wider">Loading test environment...</div>;
  }


  const handleModuleSelection = (mod: ModuleType) => {
    if (selectedModules.includes(mod)) {
      setSelectedModules(selectedModules.filter(m => m !== mod));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const handleStartExam = () => {
    if (selectedModules.length === 0) return;
    // Sort to enforce order: Listening -> Reading -> Writing -> Speaking
    const order: ModuleType[] = ['listening', 'reading', 'writing', 'speaking'];
    const sorted = [...selectedModules].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    setSelectedModules(sorted);
    setCurrentModuleIdx(0);
    setExamState('warning');

  };

  const activeModule = selectedModules[currentModuleIdx];

  const handleModuleComplete = () => {
    if (currentModuleIdx + 1 < selectedModules.length) {
      setCurrentModuleIdx(currentModuleIdx + 1);
      setExamState('warning');
    } else {
      finishExam();
    }
  };

  const calculateModuleScore = (module: 'reading' | 'listening') => {
    let score = 0;
    if (!activeTest) return score;
    const moduleData = activeTest[module] || [];
    const moduleAnswers = answers[module] || {};

    // Walk top-level sections (Listening parts / Reading passages)
    moduleData.forEach((topLevel: any) => {
      // Collect all QuestionSection objects (nested inside passages/parts)
      const questionSections: any[] = topLevel.sections || [];

      questionSections.forEach((sec: any) => {
        const qs: any[] = sec.questions || [];

        if (sec.type === 'multiple_choice_multi') {
          // Each placeholder question holds one student-selected option.
          // 1 mark per selection that appears in multiCorrectAnswers.
          const correctSet: string[] = sec.multiCorrectAnswers || [];
          qs.forEach((q: any) => {
            const userAns = moduleAnswers[q.id];
            if (userAns && typeof userAns === 'string' && correctSet.some(c => c.toLowerCase().trim() === userAns.toLowerCase().trim())) {
              score++;
            }
          });
        } else {
          qs.forEach((q: any) => {
            const userAns = moduleAnswers[q.id];
            if (!userAns) return;
            const correct = q.correctAnswer;
            if (Array.isArray(correct)) {
              if (Array.isArray(userAns) && correct.length === userAns.length && correct.every((val: string, index: number) => val === userAns[index])) {
                score++;
              }
            } else if (typeof correct === 'string') {
              if (typeof userAns === 'string' && userAns.toLowerCase().trim() === correct.toLowerCase().trim()) {
                score++;
              }
            }
          });
        }
      });

      // Fallback: also score any flat questions directly on the top-level (legacy data)
      const flatQs: any[] = (topLevel.questions || []).filter((q: any) =>
        !questionSections.some((sec: any) => sec.questions?.some((sq: any) => sq.id === q.id))
      );
      flatQs.forEach((q: any) => {
        const userAns = moduleAnswers[q.id];
        if (!userAns) return;
        const correct = q.correctAnswer;
        if (typeof correct === 'string' && typeof userAns === 'string' && userAns.toLowerCase().trim() === correct.toLowerCase().trim()) {
          score++;
        }
      });
    });

    return score;
  };

  const finishExam = () => {
    const studentInfo = students.find(s => s.id === currentUser?.id);
    
    const rawScores: Record<string, number> = existingLog?.rawScores ? { ...existingLog.rawScores } : {};
    const computedScores: Record<string, number> = existingLog?.scores ? { ...existingLog.scores } : {};

    if (selectedModules.includes('reading')) {
      const rawR = calculateModuleScore('reading');
      rawScores.reading = rawR;
      computedScores.reading = rawToBandScore(rawR, 'reading', activeTest?.category || 'Academic');
    }
    if (selectedModules.includes('listening')) {
      const rawL = calculateModuleScore('listening');
      rawScores.listening = rawL;
      computedScores.listening = rawToBandScore(rawL, 'listening', activeTest?.category || 'Academic');
    }

    const mergedModulesTaken = Array.from(new Set([...(existingLog?.modulesTaken || []), ...selectedModules]));
    
    if (existingLog) {
      updateExamLog(existingLog.id, {
        modulesTaken: mergedModulesTaken,
        answers: answers,
        rawScores: rawScores,
        scores: computedScores,
        status: 'Pending Review',
        isPublished: false,
      });
    } else {
      const newLog: ExamLog = {
        id: `log-${Date.now()}`,
        studentId: currentUser?.id || 'std-1',
        studentName: currentUser?.name || 'Candidate',
        orgId: studentInfo?.orgId || 'org-1',
        orgName: 'Apex IELTS Academy',
        testId: activeTest.id,
        testTitle: activeTest.title,
        completedAt: new Date().toISOString(),
        status: 'Pending Review',
        isPublished: false,
        modulesTaken: selectedModules,
        answers: answers,
        rawScores: rawScores,
        scores: computedScores
      };
      addExamLog(newLog);
      
      if (studentInfo) {
        updateStudent(studentInfo.id, { completedTests: (studentInfo.completedTests || 0) + 1 });
      }
    }

    setExamState('completed');
  };


  const getModuleTimer = (mod: ModuleType) => {
    if (mod === 'reading') return 60 * 60; // 60 mins
    if (mod === 'writing') return 60 * 60; // 60 mins
    if (mod === 'listening') {
      return listeningDuration || activeTest?.listening?.[0]?.duration || 1800; // Same as audio duration
    }
    return 0; // Speaking has no strict timer in this practice mode
  };


  const handleTimerWarning = (type: 'warning' | 'critical', mins: number) => {

    setToast({
      msg: `${mins} minutes remaining!`,
      color: type === 'warning' ? 'amber' : 'red'
    });
    // Auto-dismiss after 5 seconds
    setTimeout(() => setToast(null), 5000);
  };

  const readingPassages = activeTest?.reading && activeTest.reading.length > 0 ? activeTest.reading : MOCK_IELTS_TEST.reading;
  const listeningSections = activeTest?.listening && activeTest.listening.length > 0 ? activeTest.listening : MOCK_IELTS_TEST.listening;
  const writingTasks = activeTest?.writing && activeTest.writing.length > 0 ? activeTest.writing : MOCK_IELTS_TEST.writing;
  const speakingParts = activeTest?.speaking && activeTest.speaking.length > 0 ? activeTest.speaking : MOCK_IELTS_TEST.speaking;

  const studentInfo = students.find(s => s.id === currentUser?.id);
  const studentOrg = tenants.find(t => t.id === studentInfo?.orgId) || tenants[0];
  const studentQuota = getOrgQuota(studentOrg, packages, students, examLogs);

  if (examState === 'setup') {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex flex-col font-sans">
        <header className="h-16 bg-[var(--sidebar)] px-8 flex items-center shadow-md shrink-0">
          <h1 className="font-display text-[20px] text-white">IELTS Mock Test Setup</h1>
        </header>
        <div className="flex-1 max-w-4xl w-full mx-auto p-8 flex flex-col justify-center">
          <div className="panel p-10 text-center">
            <h2 className="font-display text-[32px] text-[var(--ink)] mb-2">{activeTest.title}</h2>
            <p className="text-[15px] text-[var(--ink-soft)] mb-8">Select the modules you wish to take in this session. The system will automatically sequence them.</p>

            {/* QUOTA WARNING FOR CANDIDATE */}
            {studentQuota.isExamQuotaFull && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs text-left flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-red-950 font-bold mb-0.5">Mock Exam Allocation Reached</strong>
                  Your coaching center has reached its monthly exam quota ({studentQuota.usedExams} / {studentQuota.totalExamLimit}). Please contact your center administrator to renew the mock test allocation.
                </div>
              </div>
            )}

            {studentQuota.isNearExamLimit && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs text-left flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Center Notice: Your coaching center has <strong>{studentQuota.remainingExams} mock exam(s)</strong> remaining in this cycle.</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 text-left">
              {[
                { id: 'listening', label: 'Listening', icon: Headphones, desc: 'Audio + 10 Mins' },
                { id: 'reading', label: 'Reading', icon: BookOpen, desc: '60 Minutes' },
                { id: 'writing', label: 'Writing', icon: Edit3, desc: '60 Minutes' },
                { id: 'speaking', label: 'Speaking', icon: Mic, desc: 'Practice Mode' }
              ].map(mod => {
                const isSel = selectedModules.includes(mod.id as ModuleType);
                const isPreviouslyTaken = existingLog?.modulesTaken?.includes(mod.id as ModuleType);
                
                return (
                  <div key={mod.id} onClick={() => !studentQuota.isExamQuotaFull && handleModuleSelection(mod.id as ModuleType)} className={`panel p-5 transition-all border-2 ${studentQuota.isExamQuotaFull ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50' : 'cursor-pointer'} ${isSel ? 'border-[var(--ink)] bg-[var(--paper)] ring-4 ring-[var(--ink)]/10' : 'border-[var(--line)] bg-[var(--paper-card)] hover:border-[var(--ink-faint)]'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <mod.icon className={`w-6 h-6 ${isSel ? 'text-[var(--brick)]' : 'text-[var(--ink-faint)]'}`} />
                      <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center ${isSel ? 'bg-[var(--ink)] border-[var(--ink)]' : 'border-[var(--line-soft)]'}`}>
                        {isSel && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div className="font-medium text-[var(--ink)] text-[16px]">{mod.label}</div>
                    <div className="text-[12px] text-[var(--ink-soft)] mt-1 flex justify-between items-center">
                      <span>{mod.desc}</span>
                      {isPreviouslyTaken && <span className="text-[10px] uppercase font-bold text-[var(--forest)] bg-[var(--forest)]/10 px-1.5 py-0.5 rounded">Retake</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={handleStartExam} disabled={selectedModules.length === 0 || studentQuota.isExamQuotaFull} className="btn btn-fill px-12 py-4 text-[16px] disabled:opacity-50 disabled:cursor-not-allowed">
              Proceed to Exam <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (examState === 'warning') {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex flex-col font-sans">
        <header className="h-14 bg-white border-b border-[var(--line)] flex items-center justify-center">
          <span className="font-medium text-[var(--ink)] capitalize">IELTS {activeModule}</span>
        </header>
        
        <div className="bg-white border-b border-[var(--line)] py-6 flex flex-col items-center justify-center">
          <Clock className="w-8 h-8 text-[var(--ink-soft)] mb-2" />
          <div className="font-mono text-[18px] font-bold text-[var(--ink)]">
            {activeModule === 'speaking' ? 'Practice' : `${Math.floor(getModuleTimer(activeModule)/60)} : 00`}
          </div>
        </div>

        <div className="flex-1 w-full max-w-4xl mx-auto p-8 mt-4">
          <div className="text-center mb-8">
            <h2 className="font-medium text-[22px] text-[var(--ink)]">You have chosen to practice {activeModule} questions.</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-[14px] text-[var(--ink-soft)] leading-relaxed relative">
            <div className="space-y-4">
              <div className="font-bold text-[var(--ink)]">What is in Practice {activeModule.charAt(0).toUpperCase() + activeModule.slice(1)} Questions</div>
              <ol className="list-decimal pl-5 space-y-3 marker:text-[var(--ink-faint)]">
                <li>There is a {activeModule} section from a practice test.</li>
                <li>There are questions about the text or audio.</li>
                <li>Read/Listen and answer the questions.</li>
                {activeModule === 'listening' && <li className="text-[var(--brick)] font-medium">The audio will start immediately. You will have 10 minutes at the end to transfer answers.</li>}
              </ol>
            </div>
            
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--line-soft)]"></div>

            <div className="space-y-6">
              <div>When you finish, you can review your work. There is feedback for your right and wrong answers.</div>
              <div className="font-bold text-[var(--ink)]">Your work will be reported to the Results Page.</div>
              <div className="text-[12px] text-[var(--ink-faint)]">This system is not the same as the IELTS on computer test, it has been optimised for a wide range of devices.</div>
              <button onClick={() => setExamState('taking')} className="btn btn-fill w-full max-w-[200px] justify-center py-3 bg-[var(--sidebar)] border-[var(--sidebar)] text-white hover:bg-[var(--ink)]">
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'completed') {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center font-sans p-6">
        <div className="panel p-8 max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 bg-[var(--forest)]/10 text-[var(--forest)] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display text-[26px] text-[var(--ink)] m-0">Exam Submitted for Evaluation</h2>
          
          <div className="bg-amber-50 border border-amber-200 rounded-[3px] p-4 text-xs text-amber-950 text-left space-y-2.5">
            <div className="font-bold text-[13px] flex items-center gap-1.5 text-amber-900">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Pending Teacher & Examiner Review</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Your test has been forwarded to your coaching center examiners for grading and quality moderation.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800 font-medium">
              <li>Writing tasks are evaluated with individual criteria feedback.</li>
              <li>Reading and Listening answers are verified by center instructors.</li>
              <li>Official results and band scores will be published on your dashboard once approved.</li>
            </ul>
          </div>

          <button onClick={() => router.push('/student/tests')} className="btn btn-fill px-8 py-3 w-full justify-center">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--paper-alt)] font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-xl font-bold text-white flex items-center space-x-3 ${toast.color === 'amber' ? 'bg-amber-500' : 'bg-red-600'}`}>
            <AlertCircle className="w-5 h-5" />
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        </div>
      )}

      <header className="h-16 bg-[var(--sidebar)] text-white px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-4 flex-1">
          <div>
            <h1 className="font-medium text-[15px] text-white leading-tight">{activeTest.title}</h1>
            <span className="text-[11px] text-[var(--sidebar-text-dim)] font-mono">Candidate: {currentUser?.name || 'Candidate'} ({students.find(s=>s.id===currentUser?.id)?.studentId || 'STU-8821'})</span>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="flex-1 flex justify-center">
          {activeModule !== 'speaking' && (
            <ExamTimer 
              key={`${activeModule}-${currentModuleIdx}-${activeModule === 'listening' ? listeningDuration : 0}`}
              initialSeconds={getModuleTimer(activeModule)} 
              onTimeUp={handleModuleComplete}
              onWarning={handleTimerWarning} 
            />
          )}
        </div>

        {/* Right side: Accessibility + Notepad + Submit */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          <div className="hidden md:flex items-center gap-2 bg-[#16233A] px-3 py-1 rounded-[2px] border border-slate-700">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Module</span>
            <span className="font-semibold text-white capitalize text-xs">{activeModule}</span>
          </div>

          <AccessibilityBar onVolumeChange={setGlobalVolume} />

          {/* Floating Notepad Toggle Button */}
          <button
            onClick={() => setIsNotepadOpen(!isNotepadOpen)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-[2px] text-xs font-mono font-semibold border transition-colors ${
              isNotepadOpen
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-[#16233A] text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="Candidate Notepad for rough notes"
          >
            <StickyNote className={`w-3.5 h-3.5 ${isNotepadOpen ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>Notepad</span>
          </button>

          <button
            onClick={() => {
              if (activeModule === 'reading' || activeModule === 'listening') {
                setShowReviewModal(true);
              } else {
                handleModuleComplete();
              }
            }}
            className="px-3.5 py-1.5 bg-[#B23A2A] hover:bg-[#8C2C1F] text-white font-semibold text-xs rounded-[2px] border border-[#8C2C1F] transition-colors"
          >
            Submit {activeModule}
          </button>
        </div>
      </header>


      {/* 📋 OFFICIAL CBT PRE-SUBMISSION REVIEW MODAL */}
      {showReviewModal && (() => {
        const moduleQuestions: any[] = activeModule === 'reading'
          ? readingPassages.flatMap((p: any) => (p.sections || [{ questions: p.questions || [] }]).flatMap((s: any) => s.questions || []))
          : activeModule === 'listening'
          ? listeningSections.flatMap((s: any) => (s.sections || [{ questions: s.questions || [] }]).flatMap((qSec: any) => qSec.questions || []))
          : [];


        const currentAns = answers[activeModule as 'reading' | 'listening'] || {};
        const answeredCount = moduleQuestions.filter(q => {
          const val = currentAns[q.id];
          return val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0);
        }).length;
        const unansweredCount = Math.max(0, moduleQuestions.length - answeredCount);

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2px] max-w-2xl w-full border border-slate-400 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-sans">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
                <div>
                  <h3 className="font-bold text-sm tracking-wide uppercase">
                    Review {activeModule} Questions
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    Total: {moduleQuestions.length} Questions | Answered: {answeredCount} | Incomplete: {unansweredCount}
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 border border-slate-700 rounded-[2px]"
                >
                  ✕ Close
                </button>
              </div>

              {/* Status Summary & Question Grid */}
              <div className="p-6 overflow-y-auto space-y-5">
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-[2px] bg-slate-800 border border-slate-700 inline-block" />
                    <span className="text-slate-700">Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-[2px] bg-white border border-slate-400 inline-block" />
                    <span className="text-slate-700">Not Answered ({unansweredCount})</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {moduleQuestions.map((q) => {
                    const val = currentAns[q.id];
                    const isAnswered = val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0);
                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          setShowReviewModal(false);
                          setTimeout(() => {
                            const el = document.getElementById(`question-card-${q.id}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 150);
                        }}
                        className={`p-2 text-center rounded-[2px] border text-xs font-mono font-semibold cursor-pointer transition-colors ${
                          isAnswered
                            ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                            : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                        }`}
                        title={`Click to go to Question ${q.questionNumber || '-'}`}
                      >
                        <div className="text-[11px]">{q.questionNumber || '-'}</div>
                        <div className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">
                          {isAnswered ? 'Saved' : 'Empty'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-300 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-[2px] border border-slate-300 transition-colors"
                >
                  ← Return to Questions
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    handleModuleComplete();
                  }}
                  className="px-5 py-1.5 bg-[#B23A2A] hover:bg-[#8C2C1F] text-white text-xs font-semibold rounded-[2px] border border-[#8C2C1F] transition-colors"
                >
                  Confirm & Submit {activeModule} →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex-1 overflow-hidden relative">
        {activeModule === 'reading' && (
          <ReadingModule 
            passage={readingPassages[0]} 
            allPassages={readingPassages} 
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, reading: { ...prev.reading, ...ans } }))} 
          />
        )}
        {activeModule === 'listening' && (
          <ListeningModule 
            allSections={listeningSections} 
            audioUrl={activeTest.listeningAudioUrl || MOCK_IELTS_TEST.listeningAudioUrl}
            volume={globalVolume}
            onAudioDurationLoaded={(dur) => {
              if (dur > 0 && dur !== listeningDuration) {
                setListeningDuration(dur);
              }
            }}
            onAudioEnded={handleModuleComplete}
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, listening: { ...prev.listening, ...ans } }))}
          />
        )}
        {activeModule === 'writing' && (
          <WritingModule 
            allTasks={writingTasks} 
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, writing: { ...prev.writing, ...ans } }))}
          />
        )}
        {activeModule === 'speaking' && (
          <SpeakingModule 
            parts={speakingParts} 
            testId={activeTest.id}
          />
        )}
      </div>

      {/* Floating Candidate Notepad */}
      <FloatingNotepad
        testId={testId}
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
      />
    </div>
  );
}



