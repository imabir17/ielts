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
import { BookOpen, Headphones, Edit3, Mic, LogOut, CheckCircle2, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { ExamLog, SpeakingRequest } from '@/lib/mock-data';

type ModuleType = 'reading' | 'listening' | 'writing' | 'speaking';
type ExamState = 'setup' | 'warning' | 'taking' | 'completed';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const testId = typeof params?.id === 'string' ? params.id : '';
  const { currentUser, examLogs, updateExamLog, addExamLog, addSpeakingRequest, updateStudent, students } = useStore();

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

  const existingLog = examLogs.find(l => l.studentId === currentUser?.id && l.testId === testId);

  useEffect(() => {
    setIsMounted(true);
    setTest(getTestById(testId));
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
  }, [testId, existingLog]);

  if (!isMounted || !test || !currentUser) {
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
    // Sort to enforce order: Reading -> Writing -> Listening -> Speaking
    const order: ModuleType[] = ['reading', 'writing', 'listening', 'speaking'];
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
          // Each placeholder question corresponds to one selected option.
          // 1 mark per correctly selected option.
          qs.forEach((q: any) => {
            const userAns = moduleAnswers[q.id];
            const correct = q.correctAnswer;
            if (userAns && correct && typeof userAns === 'string' && typeof correct === 'string') {
              if (userAns.toLowerCase().trim() === correct.toLowerCase().trim()) {
                score++;
              }
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
    const studentInfo = students.find(s => s.id === currentUser.id);
    
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
        studentId: currentUser.id,
        studentName: currentUser.name || 'Unknown',
        orgId: studentInfo?.orgId || '',
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
        updateStudent(studentInfo.id, { completedTests: studentInfo.completedTests + 1 });
      }
    }

    setExamState('completed');
  };

  const getModuleTimer = (mod: ModuleType) => {
    if (mod === 'reading') return 60 * 60; // 60 mins
    if (mod === 'writing') return 60 * 60; // 60 mins
    if (mod === 'listening') {
      const audioDuration = test.listening[0]?.duration || 180;
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
            <p className="text-[15px] text-[var(--ink-soft)] mb-8">Select the modules you wish to take in this session. The system will automatically sequence them.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 text-left">
              {[
                { id: 'reading', label: 'Reading', icon: BookOpen, desc: '60 Minutes' },
                { id: 'listening', label: 'Listening', icon: Headphones, desc: 'Audio + 10 Mins' },
                { id: 'writing', label: 'Writing', icon: Edit3, desc: '60 Minutes' },
                { id: 'speaking', label: 'Speaking', icon: Mic, desc: 'Practice Mode' }
              ].map(mod => {
                const isSel = selectedModules.includes(mod.id as ModuleType);
                const isPreviouslyTaken = existingLog?.modulesTaken?.includes(mod.id as ModuleType);
                
                return (
                  <div key={mod.id} onClick={() => handleModuleSelection(mod.id as ModuleType)} className={`panel p-5 cursor-pointer transition-all border-2 ${isSel ? 'border-[var(--ink)] bg-[var(--paper)] ring-4 ring-[var(--ink)]/10' : 'border-[var(--line)] bg-[var(--paper-card)] hover:border-[var(--ink-faint)]'}`}>
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

            <button onClick={handleStartExam} disabled={selectedModules.length === 0} className="btn btn-fill px-12 py-4 text-[16px] disabled:opacity-50">
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

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--paper-alt)] font-sans">
      <header className="h-16 bg-[var(--sidebar)] text-white px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="font-medium text-[15px] text-white leading-tight">{test.title}</h1>
            <span className="text-[11px] text-[var(--sidebar-text-dim)] font-mono">Candidate: {currentUser.name} ({students.find(s=>s.id===currentUser.id)?.studentId})</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[var(--ink)] px-4 py-1.5 rounded-[3px] border border-[var(--sidebar-line)]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--sidebar-text-dim)]">Current Module</span>
            <span className="font-bold text-white capitalize">{activeModule}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {activeModule !== 'speaking' && (
            <ExamTimer initialSeconds={getModuleTimer(activeModule)} onTimeUp={handleModuleComplete} />
          )}

          <button onClick={handleModuleComplete} className="btn btn-fill bg-[var(--brick)] border-[var(--brick)] text-[12px] px-4 py-1.5">
            Submit {activeModule}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        {activeModule === 'reading' && (
          <ReadingModule 
            passage={test.reading[0]} 
            allPassages={test.reading} 
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, reading: { ...prev.reading, ...ans } }))} 
          />
        )}
        {activeModule === 'listening' && (
          <ListeningModule 
            allSections={test.listening} 
            audioUrl={test.listeningAudioUrl} 
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, listening: { ...prev.listening, ...ans } }))}
          />
        )}
        {activeModule === 'writing' && (
          <WritingModule 
            allTasks={test.writing} 
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, writing: { ...prev.writing, ...ans } }))}
          />
        )}
        {activeModule === 'speaking' && (
          <SpeakingModule 
            parts={test.speaking} 
            testId={test.id}
          />
        )}
      </div>
    </div>
  );
}
