'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organization, Package, Student, PlatformManager, ExamLog, SpeakingRequest, MOCK_TESTS_CATALOG } from '@/lib/mock-data';
import { getStoredTests, saveTestToStorage, deleteTestFromStorage } from '@/lib/test-store';
import { normalizeTest } from '@/lib/test-normalizer';
import { supabase } from '@/lib/supabase';


function safeJsonParse<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
    return val as T;
  }
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch (e) {
      console.warn('safeJsonParse failed, using fallback:', e);
      return fallback;
    }
  }
  return fallback;
}

const DEFAULT_TENANTS: Organization[] = [
  {
    id: 'org-1',
    name: 'Apex IELTS Academy',
    code: 'APEX-DHK',
    location: 'Dhanmondi, Dhaka',
    contactEmail: 'contact@apex-dkl.com',
    subscriptionTier: 'Enterprise',
    maxSeats: 250,
    maxExamsPerMonth: 500,
    examsUsedThisMonth: 0,
    studentCount: 1,
    activeTests: 1,
    status: 'active',
    createdDate: '2025-11-10',
    orgAdminName: 'Rashid Khan',
    orgAdminEmail: 'rashid@apex.com',
    password: 'password123',
    packageIds: ['pkg-3']
  }
];

const DEFAULT_PACKAGES: Package[] = [
  { id: 'pkg-1', name: 'Starter Plan', price: 49, testsIncluded: 10, idLimit: 50, examLimit: 100, description: 'Up to 50 students.' },
  { id: 'pkg-2', name: 'Growth Plan', price: 99, testsIncluded: 25, idLimit: 150, examLimit: 300, description: 'Up to 150 students.' },
  { id: 'pkg-3', name: 'Enterprise Plan', price: 199, testsIncluded: 100, idLimit: -1, examLimit: -1, description: 'Unlimited students and exams.' }
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Sarah Jenkins',
    studentId: 'STU-8821',
    email: 'sarah.j@example.com',
    orgId: 'org-1',
    assignedTests: ['test-ielts-01'],
    completedTests: 0,
    averageBand: 7.5,
    password: 'student123'
  }
];

const DEFAULT_MANAGERS: PlatformManager[] = [
  {
    id: 'superadmin',
    name: 'Super Admin HQ',
    email: 'admin@mockielts.com',
    password: 'admin123',
    role: 'superadmin'
  }
];

interface StoreContextType {
  tenants: Organization[];
  packages: Package[];
  students: Student[];
  managers: PlatformManager[];
  tests: any[];
  currentUser: any | null;
  examLogs: ExamLog[];
  speakingRequests: SpeakingRequest[];
  isInitialized: boolean;
  setTenants: React.Dispatch<React.SetStateAction<Organization[]>>;
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setManagers: React.Dispatch<React.SetStateAction<PlatformManager[]>>;
  setTests: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<any | null>>;
  setExamLogs: React.Dispatch<React.SetStateAction<ExamLog[]>>;
  setSpeakingRequests: React.Dispatch<React.SetStateAction<SpeakingRequest[]>>;
  addTenant: (tenant: Organization) => void;
  updateTenant: (id: string, updates: Partial<Organization>) => void;
  deleteTenant: (id: string) => void;
  addPackage: (pkg: Package) => void;
  updatePackage: (id: string, updates: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  addManager: (manager: PlatformManager) => void;
  deleteManager: (id: string) => void;
  addExamLog: (log: ExamLog) => void;
  updateExamLog: (id: string, updates: Partial<ExamLog>) => void;
  addSpeakingRequest: (req: SpeakingRequest) => void;
  updateSpeakingRequest: (id: string, updates: Partial<SpeakingRequest>) => void;
  addTest: (test: any) => Promise<void>;
  updateTest: (id: string, updates: Partial<any>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Organization[]>(DEFAULT_TENANTS);
  const [packages, setPackages] = useState<Package[]>(DEFAULT_PACKAGES);
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [managers, setManagers] = useState<PlatformManager[]>(DEFAULT_MANAGERS);
  const [examLogs, setExamLogs] = useState<ExamLog[]>([]);
  const [speakingRequests, setSpeakingRequests] = useState<SpeakingRequest[]>([]);
  const [tests, setTests] = useState<any[]>(MOCK_TESTS_CATALOG);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Instant Cache Hydration (0ms load from localStorage)
        try {
          const cachedUser = localStorage.getItem('mockielts_user');
          if (cachedUser) setCurrentUser(JSON.parse(cachedUser));

          const cachedTenants = localStorage.getItem('ielts_cached_tenants');
          if (cachedTenants) setTenants(JSON.parse(cachedTenants));

          const cachedPackages = localStorage.getItem('ielts_cached_packages');
          if (cachedPackages) setPackages(JSON.parse(cachedPackages));

          const cachedStudents = localStorage.getItem('ielts_cached_students');
          if (cachedStudents) setStudents(JSON.parse(cachedStudents));

          const cachedManagers = localStorage.getItem('ielts_cached_managers');
          if (cachedManagers) setManagers(JSON.parse(cachedManagers));

          const cachedLogs = localStorage.getItem('ielts_cached_exam_logs');
          if (cachedLogs) setExamLogs(JSON.parse(cachedLogs));

          const storedTests = getStoredTests();
          if (storedTests && storedTests.length > 0) setTests(storedTests);
        } catch (e) {
          console.warn('Local cache hydration warning:', e);
        }

        const [
          { data: orgs },
          { data: pkgs },
          { data: stds },
          { data: mgrs },
          { data: logs },
          { data: reqs },
          { data: tsts }
        ] = await Promise.all([
          supabase.from('organizations').select('*'),
          supabase.from('packages').select('*'),
          supabase.from('students').select('*'),
          supabase.from('managers').select('*'),
          supabase.from('exam_logs').select('*'),
          supabase.from('speaking_requests').select('*'),
          supabase.from('tests').select('*')
        ]);

        if (orgs && orgs.length > 0) {
          const mappedOrgs = orgs.map((o: any) => ({
            ...o,
            contactEmail: o.contact_email,
            subscriptionTier: o.subscription_tier,
            maxSeats: o.max_seats,
            maxExamsPerMonth: o.max_exams_per_month,
            examsUsedThisMonth: o.exams_used_this_month,
            studentCount: o.student_count,
            activeTests: o.active_tests,
            createdDate: o.created_date,
            orgAdminName: o.org_admin_name,
            orgAdminEmail: o.org_admin_email,
            packageIds: o.package_ids
          }));
          setTenants(mappedOrgs);
          try { localStorage.setItem('ielts_cached_tenants', JSON.stringify(mappedOrgs)); } catch {}
        }

        if (pkgs && pkgs.length > 0) {
          const mappedPkgs = pkgs.map((p: any) => ({
            ...p,
            idLimit: p.id_limit,
            examLimit: p.exam_limit
          }));
          setPackages(mappedPkgs);
          try { localStorage.setItem('ielts_cached_packages', JSON.stringify(mappedPkgs)); } catch {}
        }

        if (stds && stds.length > 0) {
          const mappedStds = stds.map((s: any) => ({
            ...s,
            studentId: s.student_id,
            orgId: s.org_id,
            assignedTests: s.assigned_tests || [],
            completedTests: s.completed_tests || 0,
            averageBand: s.average_band || 0
          }));
          setStudents(mappedStds);
          try { localStorage.setItem('ielts_cached_students', JSON.stringify(mappedStds)); } catch {}
        }

        if (mgrs && mgrs.length > 0) {
          setManagers(mgrs);
          try { localStorage.setItem('ielts_cached_managers', JSON.stringify(mgrs)); } catch {}
        }

        if (logs) {
          const mappedLogs = logs.map((l: any) => {
            const parsedScores: any = safeJsonParse(l.scores, {});
            const isPub = l.status === 'Graded' || !!parsedScores?.isPublished;

            return {
              ...l,
              studentName: l.student_name,
              studentId: l.student_id,
              orgName: l.org_name,
              orgId: l.org_id,
              testTitle: l.test_title,
              testId: l.test_id,
              completedAt: l.completed_at,
              modulesTaken: safeJsonParse(l.modules_taken, []),
              answers: safeJsonParse(l.answers, {}),
              scores: parsedScores,
              overallBand: l.overall_band !== null && l.overall_band !== undefined ? Number(l.overall_band) : undefined,
              writingFeedback: l.writing_feedback,
              status: l.status,
              isPublished: isPub,
              manualOverrides: parsedScores?.manualOverrides || l.manual_overrides || {},
              rawScores: parsedScores?.rawScores || {},
              task1Feedback: parsedScores?.task1Feedback || '',
              task2Feedback: parsedScores?.task2Feedback || '',
              speakingFeedback: parsedScores?.speakingFeedback || '',
            };
          });
          setExamLogs(mappedLogs);
          try { localStorage.setItem('ielts_cached_exam_logs', JSON.stringify(mappedLogs)); } catch {}
        }


        if (reqs) {
          setSpeakingRequests(reqs.map((r: any) => ({
            ...r,
            studentId: r.student_id,
            orgId: r.org_id,
            testId: r.test_id,
            scheduledDate: r.scheduled_date,
            requestedAt: r.requested_at
          })));
        }

        if (tsts && tsts.length > 0) {
          setTests(tsts.map((t: any) => normalizeTest({
            ...t,
            totalDurationMinutes: t.total_duration_minutes,
            tierAccess: t.tier_access,
            questionCount: t.question_count,
            createdDate: t.created_date,
            listeningAudioUrl: t.listening_audio_url || t.listeningAudioUrl || '',
            reading: safeJsonParse(t.reading, []),
            listening: safeJsonParse(t.listening, []),
            writing: safeJsonParse(t.writing, []),
            speaking: safeJsonParse(t.speaking, []),
          })));
        }

      } catch (err) {
        console.error('StoreProvider: error during Supabase sync:', err);
      } finally {
        setIsInitialized(true);
      }
    }

    fetchData();
  }, []);

  // Safe localStorage synchronization
  useEffect(() => {
    if (isInitialized && tests.length > 0) {
      try {
        localStorage.setItem('ielts_custom_tests_catalog_v1', JSON.stringify(tests));
      } catch (e) {
        console.warn('LocalStorage quota exceeded or error when persisting tests:', e);
      }
    }
  }, [tests, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      try {
        if (currentUser) localStorage.setItem('mockielts_user', JSON.stringify(currentUser));
        else localStorage.removeItem('mockielts_user');
      } catch (e) {
        console.warn('LocalStorage error when persisting user:', e);
      }
    }
  }, [currentUser, isInitialized]);

  // Mutations
  const addTenant = async (tenant: Organization) => {
    const updated = [...tenants, tenant];
    setTenants(updated);
    try { localStorage.setItem('ielts_cached_tenants', JSON.stringify(updated)); } catch {}
    
    const dbInsert: any = {
      id: tenant.id,
      name: tenant.name,
      code: tenant.code,
      location: tenant.location,
      contact_email: tenant.contactEmail,
      subscription_tier: tenant.subscriptionTier,
      max_seats: tenant.maxSeats || 250,
      max_exams_per_month: tenant.maxExamsPerMonth || 500,
      exams_used_this_month: tenant.examsUsedThisMonth || 0,
      student_count: tenant.studentCount || 0,
      active_tests: tenant.activeTests || 1,
      status: tenant.status || 'active',
      created_date: tenant.createdDate || new Date().toISOString().split('T')[0],
      org_admin_name: tenant.orgAdminName,
      org_admin_email: tenant.orgAdminEmail,
      password: tenant.password || 'password123',
      package_ids: tenant.packageIds || []
    };
    try { 
      const { error } = await supabase.from('organizations').insert(dbInsert); 
      if (error) console.error('Supabase addTenant error:', error);
    } catch (e) { console.error('Supabase addTenant exception:', e); }
  };

  const updateTenant = async (id: string, updates: Partial<Organization>) => {
    const updated = tenants.map(t => t.id === id ? { ...t, ...updates } : t);
    setTenants(updated);
    try { localStorage.setItem('ielts_cached_tenants', JSON.stringify(updated)); } catch {}

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail;
    if (updates.subscriptionTier !== undefined) dbUpdates.subscription_tier = updates.subscriptionTier;
    if (updates.maxSeats !== undefined) dbUpdates.max_seats = updates.maxSeats;
    if (updates.maxExamsPerMonth !== undefined) dbUpdates.max_exams_per_month = updates.maxExamsPerMonth;
    if (updates.examsUsedThisMonth !== undefined) dbUpdates.exams_used_this_month = updates.examsUsedThisMonth;
    if (updates.studentCount !== undefined) dbUpdates.student_count = updates.studentCount;
    if (updates.activeTests !== undefined) dbUpdates.active_tests = updates.activeTests;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.createdDate !== undefined) dbUpdates.created_date = updates.createdDate;
    if (updates.orgAdminName !== undefined) dbUpdates.org_admin_name = updates.orgAdminName;
    if (updates.orgAdminEmail !== undefined) dbUpdates.org_admin_email = updates.orgAdminEmail;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    if (updates.packageIds !== undefined) dbUpdates.package_ids = updates.packageIds;

    try { 
      const { error } = await supabase.from('organizations').update(dbUpdates).eq('id', id); 
      if (error) console.error('Supabase updateTenant error:', error);
    } catch (e) { console.error('Supabase updateTenant exception:', e); }
  };

  const deleteTenant = async (id: string) => {
    const updated = tenants.filter(t => t.id !== id);
    setTenants(updated);
    try { localStorage.setItem('ielts_cached_tenants', JSON.stringify(updated)); } catch {}
    try { await supabase.from('organizations').delete().eq('id', id); } catch (e) { console.warn(e); }
  };

  const addPackage = async (pkg: Package) => {
    const updated = [...packages, pkg];
    setPackages(updated);
    try { localStorage.setItem('ielts_cached_packages', JSON.stringify(updated)); } catch {}

    const dbInsert: any = {
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      id_limit: pkg.idLimit,
      exam_limit: pkg.examLimit,
      description: pkg.description
    };
    try { 
      const { error } = await supabase.from('packages').insert(dbInsert); 
      if (error) console.error('Supabase addPackage error:', error);
    } catch (e) { console.error('Supabase addPackage exception:', e); }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    const updated = packages.map(p => p.id === id ? { ...p, ...updates } : p);
    setPackages(updated);
    try { localStorage.setItem('ielts_cached_packages', JSON.stringify(updated)); } catch {}

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.idLimit !== undefined) dbUpdates.id_limit = updates.idLimit;
    if (updates.examLimit !== undefined) dbUpdates.exam_limit = updates.examLimit;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    try { 
      const { error } = await supabase.from('packages').update(dbUpdates).eq('id', id); 
      if (error) console.error('Supabase updatePackage error:', error);
    } catch (e) { console.error('Supabase updatePackage exception:', e); }
  };

  const deletePackage = async (id: string) => {
    const updated = packages.filter(p => p.id !== id);
    setPackages(updated);
    try { localStorage.setItem('ielts_cached_packages', JSON.stringify(updated)); } catch {}
    try { await supabase.from('packages').delete().eq('id', id); } catch (e) { console.warn(e); }
  };

  const addStudent = async (student: Student) => {
    const updated = [...students, student];
    setStudents(updated);
    try { localStorage.setItem('ielts_cached_students', JSON.stringify(updated)); } catch {}

    const dbInsert: any = {
      id: student.id,
      name: student.name,
      student_id: student.studentId,
      email: student.email,
      password: student.password || 'student123',
      org_id: student.orgId || '',
      assigned_tests: student.assignedTests || [],
      completed_tests: student.completedTests || 0,
      average_band: student.averageBand || 0
    };
    try { 
      const { error } = await supabase.from('students').insert(dbInsert); 
      if (error) console.error('Supabase addStudent error:', error);
    } catch (e) { console.error('Supabase addStudent exception:', e); }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const updated = students.map(s => s.id === id ? { ...s, ...updates } : s);
    setStudents(updated);
    try { localStorage.setItem('ielts_cached_students', JSON.stringify(updated)); } catch {}

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.studentId !== undefined) dbUpdates.student_id = updates.studentId;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    if (updates.orgId !== undefined) dbUpdates.org_id = updates.orgId;
    if (updates.assignedTests !== undefined) dbUpdates.assigned_tests = updates.assignedTests;
    if (updates.completedTests !== undefined) dbUpdates.completed_tests = updates.completedTests;
    if (updates.averageBand !== undefined) dbUpdates.average_band = updates.averageBand;

    try { 
      const { error } = await supabase.from('students').update(dbUpdates).eq('id', id); 
      if (error) console.error('Supabase updateStudent error:', error);
    } catch (e) { console.error('Supabase updateStudent exception:', e); }
  };

  const addManager = async (manager: PlatformManager) => {
    const updated = [...managers, manager];
    setManagers(updated);
    try { localStorage.setItem('ielts_cached_managers', JSON.stringify(updated)); } catch {}
    try { 
      const { error } = await supabase.from('managers').insert(manager); 
      if (error) console.error('Supabase addManager error:', error);
    } catch (e) { console.error('Supabase addManager exception:', e); }
  };

  const deleteManager = async (id: string) => {
    const updated = managers.filter(m => m.id !== id);
    setManagers(updated);
    try { localStorage.setItem('ielts_cached_managers', JSON.stringify(updated)); } catch {}
    try { await supabase.from('managers').delete().eq('id', id); } catch (e) { console.warn(e); }
  };

  const addExamLog = async (log: ExamLog) => {
    const updated = [...examLogs, log];
    setExamLogs(updated);
    try { localStorage.setItem('ielts_cached_exam_logs', JSON.stringify(updated)); } catch {}

    const dbInsert: any = {
      id: log.id,
      student_name: log.studentName,
      student_id: log.studentId,
      org_name: log.orgName,
      org_id: log.orgId,
      test_title: log.testTitle,
      test_id: log.testId,
      completed_at: log.completedAt,
      status: log.status,
      modules_taken: log.modulesTaken,
      answers: log.answers,
      scores: log.scores,
      overall_band: log.overallBand,
      writing_feedback: log.writingFeedback
    };
    try { 
      const { error } = await supabase.from('exam_logs').insert(dbInsert); 
      if (error) console.error('Supabase addExamLog error:', error);
    } catch (e) { console.error('Supabase addExamLog exception:', e); }
  };

  const updateExamLog = async (id: string, updates: Partial<ExamLog>) => {
    const existing = examLogs.find(l => l.id === id);
    const isNowPublished = updates.isPublished !== undefined 
      ? updates.isPublished 
      : (updates.status === 'Graded' ? true : existing?.isPublished);

    const merged: ExamLog = { 
      ...(existing as ExamLog), 
      ...updates,
      isPublished: isNowPublished,
    };
    const updated = examLogs.map(l => l.id === id ? merged : l);
    setExamLogs(updated);
    try { localStorage.setItem('ielts_cached_exam_logs', JSON.stringify(updated)); } catch {}

    const dbUpdates: any = {};
    if (updates.studentName !== undefined) dbUpdates.student_name = updates.studentName;
    if (updates.studentId !== undefined) dbUpdates.student_id = updates.studentId;
    if (updates.orgName !== undefined) dbUpdates.org_name = updates.orgName;
    if (updates.orgId !== undefined) dbUpdates.org_id = updates.orgId;
    if (updates.testTitle !== undefined) dbUpdates.test_title = updates.testTitle;
    if (updates.testId !== undefined) dbUpdates.test_id = updates.testId;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.modulesTaken !== undefined) dbUpdates.modules_taken = updates.modulesTaken;
    if (updates.answers !== undefined) dbUpdates.answers = updates.answers;
    if (updates.overallBand !== undefined) dbUpdates.overall_band = updates.overallBand;
    if (updates.writingFeedback !== undefined) dbUpdates.writing_feedback = updates.writingFeedback;

    // Bundle scores + overrides + feedback into the scores json object for DB persistence
    const existingScores = typeof existing?.scores === 'object' && existing?.scores !== null ? existing.scores : {};
    const newScores = typeof updates.scores === 'object' && updates.scores !== null ? updates.scores : {};
    const combinedScores = {
      ...existingScores,
      ...newScores,
      manualOverrides: updates.manualOverrides !== undefined ? updates.manualOverrides : existing?.manualOverrides,
      rawScores: updates.rawScores !== undefined ? updates.rawScores : existing?.rawScores,
      task1Feedback: updates.task1Feedback !== undefined ? updates.task1Feedback : existing?.task1Feedback,
      task2Feedback: updates.task2Feedback !== undefined ? updates.task2Feedback : existing?.task2Feedback,
      speakingFeedback: updates.speakingFeedback !== undefined ? updates.speakingFeedback : existing?.speakingFeedback,
      isPublished: isNowPublished,
    };
    dbUpdates.scores = combinedScores;

    try { 
      const { error } = await supabase.from('exam_logs').update(dbUpdates).eq('id', id); 
      if (error) console.error('Supabase updateExamLog error:', error);
    } catch (e) { console.error('Supabase updateExamLog exception:', e); }
  };


  const addSpeakingRequest = async (req: SpeakingRequest) => {
    const updated = [...speakingRequests, req];
    setSpeakingRequests(updated);

    const dbInsert: any = {
      id: req.id,
      student_id: req.studentId,
      org_id: req.orgId,
      test_id: req.testId,
      status: req.status,
      scheduled_date: req.scheduledDate,
      type: req.type,
      link: req.link,
      requested_at: req.requestedAt
    };
    try { 
      const { error } = await supabase.from('speaking_requests').insert(dbInsert); 
      if (error) console.error('Supabase addSpeakingRequest error:', error);
    } catch (e) { console.error('Supabase addSpeakingRequest exception:', e); }
  };

  const updateSpeakingRequest = async (id: string, updates: Partial<SpeakingRequest>) => {
    const updated = speakingRequests.map(r => r.id === id ? { ...r, ...updates } : r);
    setSpeakingRequests(updated);

    const dbUpdates: any = {};
    if (updates.studentId !== undefined) dbUpdates.student_id = updates.studentId;
    if (updates.orgId !== undefined) dbUpdates.org_id = updates.orgId;
    if (updates.testId !== undefined) dbUpdates.test_id = updates.testId;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.link !== undefined) dbUpdates.link = updates.link;
    if (updates.requestedAt !== undefined) dbUpdates.requested_at = updates.requestedAt;

    try { 
      const { error } = await supabase.from('speaking_requests').update(dbUpdates).eq('id', id); 
      if (error) console.error('Supabase updateSpeakingRequest error:', error);
    } catch (e) { console.error('Supabase updateSpeakingRequest exception:', e); }
  };

  const addTest = async (test: any) => {
    const normalized = normalizeTest(test);
    setTests([normalized, ...tests]);
    saveTestToStorage(normalized);
    const dbInsert: any = {
      id: normalized.id,
      title: normalized.title,
      category: normalized.category,
      total_duration_minutes: normalized.totalDurationMinutes,
      status: normalized.status,
      tier_access: normalized.tierAccess,
      question_count: normalized.questionCount,
      created_date: normalized.createdDate,
      reading: normalized.reading,
      listening: normalized.listening,
      listening_audio_url: normalized.listeningAudioUrl || '',
      writing: normalized.writing,
      speaking: normalized.speaking
    };
    try {
      const { error } = await supabase.from('tests').insert(dbInsert);
      if (error) console.error('Supabase test insert error:', error);
    } catch (e) {
      console.error('Supabase test insert exception:', e);
    }
  };

  const updateTest = async (id: string, updates: Partial<any>) => {
    const existing = tests.find(t => t.id === id) || {};
    const merged = { ...existing, ...updates };
    const normalized = normalizeTest(merged);

    const updatedList = tests.map(t => t.id === id ? normalized : t);
    setTests(updatedList);
    saveTestToStorage(normalized);

    const dbUpdates: any = {
      title: normalized.title,
      category: normalized.category,
      total_duration_minutes: normalized.totalDurationMinutes,
      status: normalized.status,
      tier_access: normalized.tierAccess,
      question_count: normalized.questionCount,
      created_date: normalized.createdDate,
      reading: normalized.reading,
      listening: normalized.listening,
      listening_audio_url: normalized.listeningAudioUrl || '',
      writing: normalized.writing,
      speaking: normalized.speaking
    };

    try {
      const { error } = await supabase.from('tests').update(dbUpdates).eq('id', id);
      if (error) console.error('Supabase test update error:', error);
    } catch (e) {
      console.error('Supabase test update exception:', e);
    }
  };


  const deleteTest = async (id: string) => {
    setTests(tests.filter(t => t.id !== id));
    deleteTestFromStorage(id);
    try {
      const { error } = await supabase.from('tests').delete().eq('id', id);
      if (error) console.error('Supabase test delete error:', error);
    } catch (e) {
      console.error('Supabase test delete exception:', e);
    }
  };

  return (
    <StoreContext.Provider value={{
      tenants, packages, students, managers, tests, currentUser, examLogs, speakingRequests, isInitialized,
      setTenants, setPackages, setStudents, setManagers, setTests, setCurrentUser, setExamLogs, setSpeakingRequests,

      addTenant, updateTenant, deleteTenant,
      addPackage, updatePackage, deletePackage,
      addStudent, updateStudent,
      addManager, deleteManager,
      addExamLog, updateExamLog,
      addSpeakingRequest, updateSpeakingRequest,
      addTest, updateTest, deleteTest
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
