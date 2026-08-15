'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organization, Package, Student, PlatformManager, MOCK_ORGANIZATIONS, MOCK_PACKAGES, MOCK_STUDENTS, MOCK_MANAGERS } from '@/lib/mock-data';

interface StoreContextType {
  tenants: Organization[];
  packages: Package[];
  students: Student[];
  managers: PlatformManager[];
  currentUser: any | null; // e.g. { id, role: 'superadmin' | 'tenant' | 'student' | 'manager', name }
  setTenants: React.Dispatch<React.SetStateAction<Organization[]>>;
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setManagers: React.Dispatch<React.SetStateAction<PlatformManager[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<any | null>>;
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Organization[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [managers, setManagers] = useState<PlatformManager[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedTenants = localStorage.getItem('mockielts_tenants');
    const storedPackages = localStorage.getItem('mockielts_packages');
    const storedStudents = localStorage.getItem('mockielts_students');
    const storedManagers = localStorage.getItem('mockielts_managers');
    const storedUser = localStorage.getItem('mockielts_user');

    if (storedTenants) setTenants(JSON.parse(storedTenants));
    else { setTenants(MOCK_ORGANIZATIONS); localStorage.setItem('mockielts_tenants', JSON.stringify(MOCK_ORGANIZATIONS)); }

    if (storedPackages) setPackages(JSON.parse(storedPackages));
    else { setPackages(MOCK_PACKAGES); localStorage.setItem('mockielts_packages', JSON.stringify(MOCK_PACKAGES)); }

    if (storedStudents) setStudents(JSON.parse(storedStudents));
    else { setStudents(MOCK_STUDENTS); localStorage.setItem('mockielts_students', JSON.stringify(MOCK_STUDENTS)); }

    if (storedManagers) setManagers(JSON.parse(storedManagers));
    else { setManagers(MOCK_MANAGERS); localStorage.setItem('mockielts_managers', JSON.stringify(MOCK_MANAGERS)); }

    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    setIsInitialized(true);
  }, []);

  // Sync to LocalStorage on change
  useEffect(() => { if (isInitialized) localStorage.setItem('mockielts_tenants', JSON.stringify(tenants)); }, [tenants, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem('mockielts_packages', JSON.stringify(packages)); }, [packages, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem('mockielts_students', JSON.stringify(students)); }, [students, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem('mockielts_managers', JSON.stringify(managers)); }, [managers, isInitialized]);
  useEffect(() => {
    if (isInitialized) {
      if (currentUser) localStorage.setItem('mockielts_user', JSON.stringify(currentUser));
      else localStorage.removeItem('mockielts_user');
    }
  }, [currentUser, isInitialized]);

  const addTenant = (tenant: Organization) => setTenants([tenant, ...tenants]);
  const updateTenant = (id: string, updates: Partial<Organization>) => setTenants(tenants.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTenant = (id: string) => setTenants(tenants.filter(t => t.id !== id));

  const addPackage = (pkg: Package) => setPackages([pkg, ...packages]);
  const updatePackage = (id: string, updates: Partial<Package>) => setPackages(packages.map(p => p.id === id ? { ...p, ...updates } : p));
  const deletePackage = (id: string) => setPackages(packages.filter(p => p.id !== id));

  const addStudent = (student: Student) => setStudents([student, ...students]);
  const updateStudent = (id: string, updates: Partial<Student>) => setStudents(students.map(s => s.id === id ? { ...s, ...updates } : s));

  const addManager = (manager: PlatformManager) => setManagers([...managers, manager]);
  const deleteManager = (id: string) => setManagers(managers.filter(m => m.id !== id));

  if (!isInitialized) return null; // Avoid hydration mismatch

  return (
    <StoreContext.Provider value={{
      tenants, packages, students, managers, currentUser,
      setTenants, setPackages, setStudents, setManagers, setCurrentUser,
      addTenant, updateTenant, deleteTenant,
      addPackage, updatePackage, deletePackage,
      addStudent, updateStudent,
      addManager, deleteManager
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
