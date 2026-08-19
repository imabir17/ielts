'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchTestByIdAsync, getTestById } from '@/lib/test-store';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { AccessibilityBar } from '@/components/exam/AccessibilityBar';
import { ReadingModule } from '@/components/exam/ReadingModule';
import { ListeningModule } from '@/components/exam/ListeningModule';
import { WritingModule } from '@/components/exam/WritingModule';
import { SpeakingModule } from '@/components/exam/SpeakingModule';
import { BookOpen, Headphones, Edit3, Mic, LogOut, CheckCircle2, ChevronRight, AlertCircle, AlertTriangle, Clock, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { ExamLog, SpeakingRequest, Test } from '@/lib/mock-data';

type ModuleType = 'reading' | 'listening' | 'writing' | 'speaking';
type ExamState = 'setup' | 'warning' | 'taking' | 'completed';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const testId = typeof params?.id === 'string' ? params.id : '';
  const { currentUser, setCurrentUser, examLogs, updateExamLog, addExamLog, addSpeakingRequest, updateStudent, students, tests } = useStore();

  const [isMounted, setIsMounted] = useState(false);
  const [test, setTest] = useState<Test | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(true);
  
  const [examState, setExamState] = useState<ExamState>('setup');
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [currentModuleIdx, setCurrentModuleIdx] = useState<number>(0);
  
  // Accessibility & Audio State
  const [audioVolume, setAudioVolume] = useState<number>(0.8);
  const [toastAlert, setToastAlert] = useState<{ message: string; type: 'warning' | 'critical' } | null>(null);

  const [answers, setAnswers] = useState({
    reading: {} as Record<string, any>,
    listening: {} as Record<string, any>,
    writing: {} as Record<string, any>,
    speaking: {} as Record<string, any>
  });

  const activeStudent = currentUser || (students && students.length > 0 ? students[0] : {
    id: 'student-1',
    studentId: 'STD-1001',
    name: 'Candidate Student',
    role: 'student',
    orgId: 'tenant-1'
  });

  const existingLog = examLogs.find(l => l.studentId === activeStudent?.id && l.testId === testId);

  // Robust test loader - runs once per testId change
  useEffect(() => {
    setIsMounted(true);
    let isMountedLocal = true;

    async function loadTest() {
      if (!testId) {
        setIsLoadingTest(false);
        return;
      }
      setIsLoadingTest(true);
      try {
        const fetchedTest = await fetchTestByIdAsync(testId, tests);
        if (isMountedLocal) {
          if (fetchedTest) {
            setTest(fetchedTest);
            const testAny = fetchedTest as any;
            const availableModules = testAny.moduleTypes && testAny.moduleTypes.length > 0 
              ? testAny.moduleTypes 
              : ['listening', 'reading', 'writing', 'speaking'];
            const fixedOrder: ModuleType[] = ['listening', 'reading', 'writing', 'speaking'];
            setSelectedModules(fixedOrder.filter(m => availableModules.includes(m)));
          }
        }
      } catch (err) {
        console.error('Failed to load test:', err);
      } finally {
        if (isMountedLocal) {
          setIsLoadingTest(false);
        }
      }
    }

    loadTest();

    return () => {
      isMountedLocal = false;
    };
  }, [testId, tests]);

  // Pre-fill answers from existing log if available
  useEffect(() => {
    if (existingLog?.answers) {
      setAnswers(prev => ({
        ...prev,
        reading: existingLog.answers?.reading || {},
        listening: existingLog.answers?.listening || {},
        writing: existingLog.answers?.writing || {},
        speaking: existingLog.answers?.speaking || {},
      }));
    }
  }, [existingLog]);


  if (!isMounted || isLoadingTest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--paper)] p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#005C53] mb-4" />
        <div className="font-display text-lg text-slate-800 font-bold">Loading Test Environment...</div>
        <p className="text-xs text-slate-500 font-mono mt-1">Synchronizing exam materials & question items ({testId})</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--paper)] p-6 text-center font-sans">
        <div className="panel max-w-md w-full p-8 text-center bg-white shadow-xl rounded-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Test Not Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The requested test <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-800">{testId}</code> could not be located in the exam catalog or database.
          </p>
          <div className="pt-2">
            <Link
              href="/student/tests"
              className="px-6 py-2.5 bg-[#005C53] hover:bg-[#004740] text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Available Tests</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }


  const handleStartExam = () => {
    if (selectedModules.length === 0) return;
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
    if (!test) return score;
    const moduleData = test[module] || [];
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
    const studentInfo = students.find(s => s.id === activeStudent?.id);
    
    const computedScores: Record<string, number> = existingLog ? { ...existingLog.scores } : {};
    if (selectedModules.includes('reading')) computedScores.reading = calculateModuleScore('reading');
    if (selectedModules.includes('listening')) computedScores.listening = calculateModuleScore('listening');

    const mergedModulesTaken = Array.from(new Set([...(existingLog?.modulesTaken || []), ...selectedModules]));
    
    // Overall band could be average of taken modules if we want, but keeping simple for now.
    
    if (existingLog) {
      updateExamLog(existingLog.id, {
        modulesTaken: mergedModulesTaken,
        answers: answers,
        scores: computedScores,
        status: mergedModulesTaken.includes('writing') ? 'Completed' : 'Graded'
      });
    } else {
      const newLog: ExamLog = {
        id: `log-${Date.now()}`,
        studentId: activeStudent?.id || 'student-1',
        studentName: activeStudent?.name || 'Candidate Student',
        orgId: studentInfo?.orgId || activeStudent?.orgId || '',
        orgName: 'Unknown',
        testId: test.id,
        testTitle: test.title,
        completedAt: new Date().toISOString(),
        status: selectedModules.includes('writing') ? 'Completed' : 'Graded',
        modulesTaken: selectedModules,
        answers: answers,
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
      const audioDuration = test.listening?.[0]?.duration || 180;
      return audioDuration + (10 * 60); // Audio + 10 mins transfer time
    }
    return 0; // Speaking has no strict timer in this practice mode
  };

  if (examState === 'setup') {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex flex-col font-sans">
        <header className="h-16 bg-[var(--sidebar)] px-8 flex items-center shadow-md shrink-0">
          <h1 className="font-display text-[20px] text-white">IELTS Mock Test Setup</h1>
        </header>
        <div className="flex-1 max-w-4xl w-full mx-auto p-8 flex flex-col justify-center">
          <div className="panel p-10 text-center">
            <h2 className="font-display text-[32px] text-[var(--ink)] mb-2">{test.title}</h2>
            <p className="text-[15px] text-[var(--ink-soft)] mb-8">You are about to begin the full mock exam. The modules will be administered in the official sequence.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 text-left">
              {[
                { id: 'listening', label: 'Listening', icon: Headphones, desc: 'Audio + 10 Mins' },
                { id: 'reading', label: 'Reading', icon: BookOpen, desc: '60 Minutes' },
                { id: 'writing', label: 'Writing', icon: Edit3, desc: '60 Minutes' },
                { id: 'speaking', label: 'Speaking', icon: Mic, desc: 'Practice Mode' }
              ].map(mod => {
                const isAvailable = selectedModules.includes(mod.id as ModuleType);
                if (!isAvailable) return null;

                const isPreviouslyTaken = existingLog?.modulesTaken?.includes(mod.id as ModuleType);
                
                return (
                  <div key={mod.id} className={`panel p-5 transition-all border-2 border-[var(--ink)] bg-[var(--paper)] ring-2 ring-[var(--ink)]/10`}>
                    <div className="flex justify-between items-start mb-3">
                      <mod.icon className="w-6 h-6 text-[var(--brick)]" />
                      <div className="w-5 h-5 rounded-[4px] border-2 flex items-center justify-center bg-[var(--ink)] border-[var(--ink)]">
                        <CheckCircle2 className="w-3 h-3 text-white" />
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

            <button onClick={handleStartExam} disabled={selectedModules.length === 0} className="btn btn-fill px-12 py-4 text-[16px] disabled:opacity-50">
              Start Full Exam <ChevronRight className="w-5 h-5 ml-2" />
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
        <div className="panel p-10 max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 bg-[var(--forest)]/10 text-[var(--forest)] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="font-display text-[32px] text-[var(--ink)] m-0">Exam Submitted</h2>
          <p className="text-[15px] text-[var(--ink-soft)] leading-relaxed">
            Your answers have been saved successfully. 
            {selectedModules.includes('reading') || selectedModules.includes('listening') ? ' Reading and Listening scores are available immediately.' : ''}
            {selectedModules.includes('writing') ? ' Awaiting score for writing. It may take around 1 hour.' : ''}
          </p>
          <button onClick={() => router.push('/student/tests')} className="btn btn-fill px-8 py-3 w-full justify-center">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleWarningThreshold = (threshold: 10 | 5) => {
    if (threshold === 10) {
      setToastAlert({
        message: '10 Minutes Remaining: Please begin reviewing your answers and checking remaining questions.',
        type: 'warning'
      });
    } else if (threshold === 5) {
      setToastAlert({
        message: '5 Minutes Remaining: Final warning! Ensure all responses are completed before submission.',
        type: 'critical'
      });
    }
  };

  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => {
        setToastAlert(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--paper-alt)] font-sans relative exam-root">
      {/* FLOATING TIMER WARNING TOAST */}
      {toastAlert && (
        <div
          className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300 max-w-lg w-full ${
            toastAlert.type === 'critical'
              ? 'bg-red-600 text-white border-red-700 ring-4 ring-red-500/30'
              : 'bg-amber-500 text-slate-950 border-amber-600 ring-4 ring-amber-400/30'
          }`}
        >
          {toastAlert.type === 'critical' ? (
            <AlertCircle className="w-5 h-5 text-white animate-bounce shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-slate-950 shrink-0" />
          )}
          <div className="flex-1 font-sans leading-snug">
            {toastAlert.message}
          </div>
          <button
            onClick={() => setToastAlert(null)}
            className="p-1 hover:bg-black/10 rounded-lg text-current"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP EXAM HEADER */}
      <header className="h-16 bg-[var(--sidebar)] text-white px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-40 border-b border-slate-800 shadow-md">
        {/* Left: Test Title & Candidate Info */}
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-sm text-white leading-tight">{test.title}</h1>
              <span className="hidden sm:inline-block bg-[#005C53] text-emerald-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded capitalize">
                {activeModule}
              </span>
            </div>
            <span className="text-[11px] text-[var(--sidebar-text-dim)] font-mono">
              Candidate: {activeStudent?.name || 'Candidate'} ({activeStudent?.studentId || 'STD'})
            </span>
          </div>
        </div>

        {/* Center: TOP-CENTER STOPWATCH / TIMER */}
        <div className="flex items-center justify-center">
          {activeModule !== 'speaking' && (
            <ExamTimer
              initialSeconds={getModuleTimer(activeModule)}
              onTimeUp={handleModuleComplete}
              onWarningThreshold={handleWarningThreshold}
            />
          )}
        </div>

        {/* Right: ACCESSIBILITY CONTROLS (Font, Contrast, Volume) & SUBMIT BUTTON */}
        <div className="flex items-center space-x-3">
          <AccessibilityBar
            volume={audioVolume}
            onVolumeChange={(v) => setAudioVolume(v)}
            showVolume={activeModule === 'listening'}
          />

          <button
            onClick={handleModuleComplete}
            className="btn btn-fill bg-[#B23A2A] hover:bg-[#8C2C1F] border-none text-[12px] px-3.5 py-1.5 font-bold shadow-sm"
          >
            Submit {activeModule}
          </button>
        </div>
      </header>

      {/* ACTIVE MODULE CONTAINER */}
      <div className="flex-1 overflow-hidden relative">
        {activeModule === 'reading' && (
          <ReadingModule 
            passage={test.reading?.[0] || undefined} 
            allPassages={test.reading || []} 
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, reading: { ...prev.reading, ...ans } }))} 
          />
        )}
        {activeModule === 'listening' && (
          <ListeningModule 
            allSections={test.listening || []} 
            audioUrl={test.listeningAudioUrl} 
            volume={audioVolume}
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, listening: { ...prev.listening, ...ans } }))}
          />
        )}
        {activeModule === 'writing' && (
          <WritingModule 
            allTasks={test.writing || []} 
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, writing: { ...prev.writing, ...ans } }))}
          />
        )}
        {activeModule === 'speaking' && (
          <SpeakingModule 
            parts={test.speaking || []} 
            testId={test.id}
          />
        )}
      </div>
    </div>
  );
}

