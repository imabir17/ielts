'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organization, Package, Student, PlatformManager, ExamLog, SpeakingRequest } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';

interface StoreContextType {
  tenants: Organization[];
  packages: Package[];
  students: Student[];
  managers: PlatformManager[];
  tests: any[];
  currentUser: any | null;
  examLogs: ExamLog[];
  speakingRequests: SpeakingRequest[];
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Organization[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [managers, setManagers] = useState<PlatformManager[]>([]);
  const [examLogs, setExamLogs] = useState<ExamLog[]>([]);
  const [speakingRequests, setSpeakingRequests] = useState<SpeakingRequest[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function fetchData() {
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

      if (orgs) {
        // map snake_case to camelCase
        setTenants(orgs.map((o: any) => ({
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
        })));
      }
      
      if (pkgs) {
        setPackages(pkgs.map((p: any) => ({
          ...p,
          idLimit: p.id_limit,
          examLimit: p.exam_limit
        })));
      }

      if (stds) {
        setStudents(stds.map((s: any) => ({
          ...s,
          studentId: s.student_id,
          orgId: s.org_id,
          assignedTests: s.assigned_tests,
          completedTests: s.completed_tests,
          averageBand: s.average_band
        })));
      }

      if (mgrs) {
        setManagers(mgrs);
      }

      if (logs) {
        setExamLogs(logs.map((l: any) => ({
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
        })));
      }

      if (reqs) {
        setSpeakingRequests(reqs.map((r: any) => ({
          ...r,
          studentId: r.student_id,
          orgId: r.org_id,
          testId: r.test_id,
          scheduledDate: r.scheduled_date,
          requestedAt: r.requested_at,
          feedback: r.feedback,
          bandScore: r.band_score
        })));
      }

      if (tsts) {
        setTests(tsts.map((t: any) => ({
          ...t,
          totalDurationMinutes: t.total_duration_minutes,
          tierAccess: t.tier_access,
          questionCount: t.question_count,
          createdDate: t.created_date,
          listeningAudioUrl: t.listening_audio_url
        })));
      }

      const storedUser = localStorage.getItem('mockielts_user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      setIsInitialized(true);
    }

    fetchData();
  }, []);

  useEffect(() => { if (isInitialized && tests.length > 0) localStorage.setItem('ielts_custom_tests_catalog_v1', JSON.stringify(tests)); }, [tests, isInitialized]);
  useEffect(() => {
    if (isInitialized) {
      if (currentUser) localStorage.setItem('mockielts_user', JSON.stringify(currentUser));
      else localStorage.removeItem('mockielts_user');
    }
  }, [currentUser, isInitialized]);

  // MUTATIONS (Optimistic UI + Supabase sync)
  
  const addTenant = async (tenant: Organization) => {
    setTenants([tenant, ...tenants]);
    await supabase.from('organizations').insert({
      id: tenant.id, name: tenant.name, code: tenant.code, location: tenant.location,
      contact_email: tenant.contactEmail, subscription_tier: tenant.subscriptionTier,
      max_seats: tenant.maxSeats, max_exams_per_month: tenant.maxExamsPerMonth,
      exams_used_this_month: tenant.examsUsedThisMonth, student_count: tenant.studentCount,
      active_tests: tenant.activeTests, status: tenant.status, created_date: tenant.createdDate,
      org_admin_name: tenant.orgAdminName, org_admin_email: tenant.orgAdminEmail, package_ids: tenant.packageIds,
      password: tenant.password
    });
  };
  
  const updateTenant = async (id: string, updates: Partial<Organization>) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, ...updates } : t));
    const dbUpdates: any = { ...updates };
    if (updates.contactEmail) dbUpdates.contact_email = updates.contactEmail;
    if (updates.subscriptionTier) dbUpdates.subscription_tier = updates.subscriptionTier;
    if (updates.maxSeats !== undefined) dbUpdates.max_seats = updates.maxSeats;
    if (updates.maxExamsPerMonth !== undefined) dbUpdates.max_exams_per_month = updates.maxExamsPerMonth;
    if (updates.examsUsedThisMonth !== undefined) dbUpdates.exams_used_this_month = updates.examsUsedThisMonth;
    if (updates.studentCount !== undefined) dbUpdates.student_count = updates.studentCount;
    if (updates.activeTests !== undefined) dbUpdates.active_tests = updates.activeTests;
    if (updates.createdDate) dbUpdates.created_date = updates.createdDate;
    if (updates.orgAdminName) dbUpdates.org_admin_name = updates.orgAdminName;
    if (updates.orgAdminEmail) dbUpdates.org_admin_email = updates.orgAdminEmail;
    if (updates.packageIds) dbUpdates.package_ids = updates.packageIds;
    
    // remove camelCase keys
    ['contactEmail', 'subscriptionTier', 'maxSeats', 'maxExamsPerMonth', 'examsUsedThisMonth', 'studentCount', 'activeTests', 'createdDate', 'orgAdminName', 'orgAdminEmail', 'packageIds'].forEach(k => delete dbUpdates[k]);
    
    await supabase.from('organizations').update(dbUpdates).eq('id', id);
  };
  
  const deleteTenant = async (id: string) => {
    setTenants(tenants.filter(t => t.id !== id));
    await supabase.from('organizations').delete().eq('id', id);
  };

  const addPackage = async (pkg: Package) => {
    setPackages([pkg, ...packages]);
    await supabase.from('packages').insert({
      id: pkg.id, name: pkg.name, price: pkg.price, id_limit: pkg.idLimit, exam_limit: pkg.examLimit, description: pkg.description
    });
  };
  
  const updatePackage = async (id: string, updates: Partial<Package>) => {
    setPackages(packages.map(p => p.id === id ? { ...p, ...updates } : p));
    const dbUpdates: any = { ...updates };
    if (updates.idLimit !== undefined) dbUpdates.id_limit = updates.idLimit;
    if (updates.examLimit !== undefined) dbUpdates.exam_limit = updates.examLimit;
    delete dbUpdates.idLimit; delete dbUpdates.examLimit;
    await supabase.from('packages').update(dbUpdates).eq('id', id);
  };
  
  const deletePackage = async (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
    await supabase.from('packages').delete().eq('id', id);
  };

  const addStudent = async (student: Student) => {
    setStudents([student, ...students]);
    await supabase.from('students').insert({
      id: student.id, name: student.name, student_id: student.studentId, email: student.email,
      password: student.password,
      org_id: student.orgId, assigned_tests: student.assignedTests, completed_tests: student.completedTests, average_band: student.averageBand
    });
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
    await supabase.from('students').update(dbUpdates).eq('id', id);
  };

  const addManager = async (manager: PlatformManager) => {
    setManagers([...managers, manager]);
    await supabase.from('managers').insert(manager);
  };
  
  const deleteManager = async (id: string) => {
    setManagers(managers.filter(m => m.id !== id));
    await supabase.from('managers').delete().eq('id', id);
  };

  const addExamLog = async (log: ExamLog) => {
    setExamLogs([...examLogs, log]);
    await supabase.from('exam_logs').insert({
      id: log.id, student_name: log.studentName, student_id: log.studentId,
      org_name: log.orgName, org_id: log.orgId, test_title: log.testTitle, test_id: log.testId,
      completed_at: log.completedAt, status: log.status, modules_taken: log.modulesTaken,
      answers: log.answers, scores: log.scores, overall_band: log.overallBand, writing_feedback: log.writingFeedback
    });
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
    await supabase.from('exam_logs').update(dbUpdates).eq('id', id);
  };

  const addSpeakingRequest = async (req: SpeakingRequest) => {
    setSpeakingRequests([...speakingRequests, req]);
    await supabase.from('speaking_requests').insert({
      id: req.id, student_id: req.studentId, org_id: req.orgId, test_id: req.testId,
      status: req.status, scheduled_date: req.scheduledDate, type: req.type, link: req.link, requested_at: req.requestedAt
    });
  };
  
  const updateSpeakingRequest = async (id: string, updates: Partial<SpeakingRequest>) => {
    setSpeakingRequests(speakingRequests.map(r => r.id === id ? { ...r, ...updates } : r));
    const dbUpdates: any = { ...updates };
    if (updates.studentId) dbUpdates.student_id = updates.studentId;
    if (updates.orgId) dbUpdates.org_id = updates.orgId;
    if (updates.testId) dbUpdates.test_id = updates.testId;
    if (updates.scheduledDate) dbUpdates.scheduled_date = updates.scheduledDate;
    if (updates.requestedAt) dbUpdates.requested_at = updates.requestedAt;
    if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
    if (updates.bandScore !== undefined) dbUpdates.band_score = updates.bandScore;
    ['studentId', 'orgId', 'testId', 'scheduledDate', 'requestedAt', 'bandScore'].forEach(k => delete dbUpdates[k]);
    await supabase.from('speaking_requests').update(dbUpdates).eq('id', id);
  };

  if (!isInitialized) return null;

  return (
    <StoreContext.Provider value={{
      tenants, packages, students, managers, tests, currentUser, examLogs, speakingRequests,
      setTenants, setPackages, setStudents, setManagers, setTests, setCurrentUser, setExamLogs, setSpeakingRequests,
      addTenant, updateTenant, deleteTenant,
      addPackage, updatePackage, deletePackage,
      addStudent, updateStudent,
      addManager, deleteManager,
      addExamLog, updateExamLog,
      addSpeakingRequest, updateSpeakingRequest
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
