'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organization, Package, Student, PlatformManager, ExamLog, SpeakingRequest, MOCK_TESTS_CATALOG } from '@/lib/mock-data';
import { getStoredTests, saveTestToStorage, deleteTestFromStorage } from '@/lib/test-store';
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
          const mappedLogs = logs.map((l: any) => ({
            ...l,
            studentName: l.student_name,
            studentId: l.student_id,
            orgName: l.org_name,
            orgId: l.org_id,
            testTitle: l.test_title,
            testId: l.test_id,
            completedAt: l.completed_at,
            modulesTaken: l.modules_taken,
            overallBand: l.overall_band,
            writingFeedback: l.writing_feedback
          }));
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
          setTests(tsts.map((t: any) => ({
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
    setTenants([...tenants, tenant]);
    const dbInsert: any = { ...tenant };
    if (tenant.contactEmail) dbInsert.contact_email = tenant.contactEmail;
    if (tenant.subscriptionTier) dbInsert.subscription_tier = tenant.subscriptionTier;
    if (tenant.maxSeats) dbInsert.max_seats = tenant.maxSeats;
    if (tenant.maxExamsPerMonth) dbInsert.max_exams_per_month = tenant.maxExamsPerMonth;
    if (tenant.examsUsedThisMonth) dbInsert.exams_used_this_month = tenant.examsUsedThisMonth;
    if (tenant.studentCount) dbInsert.student_count = tenant.studentCount;
    if (tenant.activeTests) dbInsert.active_tests = tenant.activeTests;
    if (tenant.createdDate) dbInsert.created_date = tenant.createdDate;
    if (tenant.orgAdminName) dbInsert.org_admin_name = tenant.orgAdminName;
    if (tenant.orgAdminEmail) dbInsert.org_admin_email = tenant.orgAdminEmail;
    if (tenant.packageIds) dbInsert.package_ids = tenant.packageIds;
    ['contactEmail', 'subscriptionTier', 'maxSeats', 'maxExamsPerMonth', 'examsUsedThisMonth', 'studentCount', 'activeTests', 'createdDate', 'orgAdminName', 'orgAdminEmail', 'packageIds'].forEach(k => delete dbInsert[k]);
    try { await supabase.from('organizations').insert(dbInsert); } catch (e) { console.warn(e); }
  };

  const updateTenant = async (id: string, updates: Partial<Organization>) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, ...updates } : t));
    const dbUpdates: any = { ...updates };
    if (updates.contactEmail) dbUpdates.contact_email = updates.contactEmail;
    if (updates.subscriptionTier) dbUpdates.subscription_tier = updates.subscriptionTier;
    if (updates.maxSeats) dbUpdates.max_seats = updates.maxSeats;
    if (updates.maxExamsPerMonth) dbUpdates.max_exams_per_month = updates.maxExamsPerMonth;
    if (updates.examsUsedThisMonth) dbUpdates.exams_used_this_month = updates.examsUsedThisMonth;
    if (updates.studentCount) dbUpdates.student_count = updates.studentCount;
    if (updates.activeTests) dbUpdates.active_tests = updates.activeTests;
    if (updates.createdDate) dbUpdates.created_date = updates.createdDate;
    if (updates.orgAdminName) dbUpdates.org_admin_name = updates.orgAdminName;
    if (updates.orgAdminEmail) dbUpdates.org_admin_email = updates.orgAdminEmail;
    if (updates.packageIds) dbUpdates.package_ids = updates.packageIds;
    ['contactEmail', 'subscriptionTier', 'maxSeats', 'maxExamsPerMonth', 'examsUsedThisMonth', 'studentCount', 'activeTests', 'createdDate', 'orgAdminName', 'orgAdminEmail', 'packageIds'].forEach(k => delete dbUpdates[k]);
    try { await supabase.from('organizations').update(dbUpdates).eq('id', id); } catch (e) { console.warn(e); }
  };

  const deleteTenant = async (id: string) => {
    setTenants(tenants.filter(t => t.id !== id));
    try { await supabase.from('organizations').delete().eq('id', id); } catch (e) { console.warn(e); }
  };

  const addPackage = async (pkg: Package) => {
    setPackages([...packages, pkg]);
    const dbInsert: any = { ...pkg };
    if (pkg.idLimit !== undefined) dbInsert.id_limit = pkg.idLimit;
    if (pkg.examLimit !== undefined) dbInsert.exam_limit = pkg.examLimit;
    ['idLimit', 'examLimit', 'testsIncluded'].forEach(k => delete dbInsert[k]);
    try { await supabase.from('packages').insert(dbInsert); } catch (e) { console.warn(e); }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    setPackages(packages.map(p => p.id === id ? { ...p, ...updates } : p));
    const dbUpdates: any = { ...updates };
    if (updates.idLimit !== undefined) dbUpdates.id_limit = updates.idLimit;
    if (updates.examLimit !== undefined) dbUpdates.exam_limit = updates.examLimit;
    ['idLimit', 'examLimit', 'testsIncluded'].forEach(k => delete dbUpdates[k]);
    try { await supabase.from('packages').update(dbUpdates).eq('id', id); } catch (e) { console.warn(e); }
  };

  const deletePackage = async (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
    try { await supabase.from('packages').delete().eq('id', id); } catch (e) { console.warn(e); }
  };

  const addStudent = async (student: Student) => {
    setStudents([...students, student]);
    const dbInsert: any = { ...student };
    if (student.studentId) dbInsert.student_id = student.studentId;
    if (student.orgId) dbInsert.org_id = student.orgId;
    if (student.assignedTests) dbInsert.assigned_tests = student.assignedTests;
    if (student.completedTests !== undefined) dbInsert.completed_tests = student.completedTests;
    if (student.averageBand !== undefined) dbInsert.average_band = student.averageBand;
    ['studentId', 'orgId', 'assignedTests', 'completedTests', 'averageBand'].forEach(k => delete dbInsert[k]);
    try { await supabase.from('students').insert(dbInsert); } catch (e) { console.warn(e); }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    setStudents(students.map(s => s.id === id ? { ...s, ...updates } : s));
    const dbUpdates: any = { ...updates };
    if (updates.studentId) dbUpdates.student_id = updates.studentId;
    if (updates.orgId) dbUpdates.org_id = updates.orgId;
    if (updates.assignedTests) dbUpdates.assigned_tests = updates.assignedTests;
    if (updates.completedTests !== undefined) dbUpdates.completed_tests = updates.completedTests;
    if (updates.averageBand !== undefined) dbUpdates.average_band = updates.averageBand;
    ['studentId', 'orgId', 'assignedTests', 'completedTests', 'averageBand'].forEach(k => delete dbUpdates[k]);
    try { await supabase.from('students').update(dbUpdates).eq('id', id); } catch (e) { console.warn(e); }
  };

  const addManager = async (manager: PlatformManager) => {
    setManagers([...managers, manager]);
    try { await supabase.from('managers').insert(manager); } catch (e) { console.warn(e); }
  };

  const deleteManager = async (id: string) => {
    setManagers(managers.filter(m => m.id !== id));
    try { await supabase.from('managers').delete().eq('id', id); } catch (e) { console.warn(e); }
  };

  const addExamLog = async (log: ExamLog) => {
    setExamLogs([...examLogs, log]);
    const dbInsert: any = { ...log };
    if (log.studentName) dbInsert.student_name = log.studentName;
    if (log.studentId) dbInsert.student_id = log.studentId;
    if (log.orgName) dbInsert.org_name = log.orgName;
    if (log.orgId) dbInsert.org_id = log.orgId;
    if (log.testTitle) dbInsert.test_title = log.testTitle;
    if (log.testId) dbInsert.test_id = log.testId;
    if (log.completedAt) dbInsert.completed_at = log.completedAt;
    if (log.modulesTaken) dbInsert.modules_taken = log.modulesTaken;
    if (log.overallBand !== undefined) dbInsert.overall_band = log.overallBand;
    if (log.writingFeedback) dbInsert.writing_feedback = log.writingFeedback;
    ['studentName', 'studentId', 'orgName', 'orgId', 'testTitle', 'testId', 'completedAt', 'modulesTaken', 'overallBand', 'writingFeedback'].forEach(k => delete dbInsert[k]);
    try { await supabase.from('exam_logs').insert(dbInsert); } catch (e) { console.warn(e); }
  };

  const updateExamLog = async (id: string, updates: Partial<ExamLog>) => {
    setExamLogs(examLogs.map(l => l.id === id ? { ...l, ...updates } : l));
    const dbUpdates: any = { ...updates };
    if (updates.studentName) dbUpdates.student_name = updates.studentName;
    if (updates.studentId) dbUpdates.student_id = updates.studentId;
    if (updates.orgName) dbUpdates.org_name = updates.orgName;
    if (updates.orgId) dbUpdates.org_id = updates.orgId;
    if (updates.testTitle) dbUpdates.test_title = updates.testTitle;
    if (updates.testId) dbUpdates.test_id = updates.testId;
    if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;
    if (updates.modulesTaken) dbUpdates.modules_taken = updates.modulesTaken;
    if (updates.overallBand !== undefined) dbUpdates.overall_band = updates.overallBand;
    if (updates.writingFeedback) dbUpdates.writing_feedback = updates.writingFeedback;
    ['studentName', 'studentId', 'orgName', 'orgId', 'testTitle', 'testId', 'completedAt', 'modulesTaken', 'overallBand', 'writingFeedback'].forEach(k => delete dbUpdates[k]);
    try { await supabase.from('exam_logs').update(dbUpdates).eq('id', id); } catch (e) { console.warn(e); }
  };

  const addSpeakingRequest = async (req: SpeakingRequest) => {
    setSpeakingRequests([...speakingRequests, req]);
    const dbInsert: any = { ...req };
    if (req.studentId) dbInsert.student_id = req.studentId;
    if (req.orgId) dbInsert.org_id = req.orgId;
    if (req.testId) dbInsert.test_id = req.testId;
    if (req.scheduledDate) dbInsert.scheduled_date = req.scheduledDate;
    if (req.requestedAt) dbInsert.requested_at = req.requestedAt;
    ['studentId', 'orgId', 'testId', 'scheduledDate', 'requestedAt', 'feedback', 'bandScore'].forEach(k => delete dbInsert[k]);
    try { await supabase.from('speaking_requests').insert(dbInsert); } catch (e) { console.warn(e); }
  };

  const updateSpeakingRequest = async (id: string, updates: Partial<SpeakingRequest>) => {
    setSpeakingRequests(speakingRequests.map(r => r.id === id ? { ...r, ...updates } : r));
    const dbUpdates: any = { ...updates };
    if (updates.studentId) dbUpdates.student_id = updates.studentId;
    if (updates.orgId) dbUpdates.org_id = updates.orgId;
    if (updates.testId) dbUpdates.test_id = updates.testId;
    if (updates.scheduledDate) dbUpdates.scheduled_date = updates.scheduledDate;
    if (updates.requestedAt) dbUpdates.requested_at = updates.requestedAt;
    ['studentId', 'orgId', 'testId', 'scheduledDate', 'requestedAt', 'feedback', 'bandScore'].forEach(k => delete dbUpdates[k]);
    try { await supabase.from('speaking_requests').update(dbUpdates).eq('id', id); } catch (e) { console.warn(e); }
  };

  const addTest = async (test: any) => {
    setTests([test, ...tests]);
    saveTestToStorage(test);
    const dbInsert: any = { ...test };
    if (test.totalDurationMinutes !== undefined) dbInsert.total_duration_minutes = test.totalDurationMinutes;
    if (test.tierAccess !== undefined) dbInsert.tier_access = test.tierAccess;
    if (test.questionCount !== undefined) dbInsert.question_count = test.questionCount;
    if (test.createdDate !== undefined) dbInsert.created_date = test.createdDate;
    if (test.listeningAudioUrl !== undefined) dbInsert.listening_audio_url = test.listeningAudioUrl;
    ['totalDurationMinutes', 'tierAccess', 'questionCount', 'createdDate', 'listeningAudioUrl'].forEach(k => delete dbInsert[k]);
    try {
      await supabase.from('tests').insert(dbInsert);
    } catch (e) {
      console.warn('Supabase test insert failed, persisted locally:', e);
    }
  };

  const updateTest = async (id: string, updates: Partial<any>) => {
    const updatedList = tests.map(t => t.id === id ? { ...t, ...updates } : t);
    setTests(updatedList);
    const target = updatedList.find(t => t.id === id);
    if (target) saveTestToStorage(target);
    const dbUpdates: any = { ...updates };
    if (updates.totalDurationMinutes !== undefined) dbUpdates.total_duration_minutes = updates.totalDurationMinutes;
    if (updates.tierAccess !== undefined) dbUpdates.tier_access = updates.tierAccess;
    if (updates.questionCount !== undefined) dbUpdates.question_count = updates.questionCount;
    if (updates.createdDate !== undefined) dbUpdates.created_date = updates.createdDate;
    if (updates.listeningAudioUrl !== undefined) dbUpdates.listening_audio_url = updates.listeningAudioUrl;
    ['totalDurationMinutes', 'tierAccess', 'questionCount', 'createdDate', 'listeningAudioUrl'].forEach(k => delete dbUpdates[k]);
    try {
      await supabase.from('tests').update(dbUpdates).eq('id', id);
    } catch (e) {
      console.warn('Supabase test update failed, persisted locally:', e);
    }
  };

  const deleteTest = async (id: string) => {
    setTests(tests.filter(t => t.id !== id));
    deleteTestFromStorage(id);
    try {
      await supabase.from('tests').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase test delete failed, removed locally:', e);
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
