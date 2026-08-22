import { Organization, Package, Student, ExamLog } from './mock-data';

export interface OrgQuotaStatus {
  orgId: string;
  orgName: string;
  tierName: string;
  
  // Student ID Quota
  totalIdLimit: number | 'unlimited';
  usedIds: number;
  remainingIds: number | 'unlimited';
  isIdQuotaFull: boolean;
  
  // Monthly Exam Quota
  totalExamLimit: number | 'unlimited';
  usedExams: number;
  remainingExams: number | 'unlimited';
  isExamQuotaFull: boolean;
  isNearExamLimit: boolean; // true when 1 <= remainingExams <= 3
  
  hasUnlimitedIds: boolean;
  hasUnlimitedExams: boolean;
}

/**
 * Single source of truth for calculating organization subscription and quota limits
 */
export function getOrgQuota(
  org: Organization | any,
  packages: Package[] = [],
  students: Student[] = [],
  examLogs: ExamLog[] = []
): OrgQuotaStatus {
  if (!org) {
    return {
      orgId: '',
      orgName: 'Unknown Center',
      tierName: 'Standard',
      totalIdLimit: 50,
      usedIds: 0,
      remainingIds: 50,
      isIdQuotaFull: false,
      totalExamLimit: 100,
      usedExams: 0,
      remainingExams: 100,
      isExamQuotaFull: false,
      isNearExamLimit: false,
      hasUnlimitedIds: false,
      hasUnlimitedExams: false,
    };
  }

  // Helper to check for explicit unlimited setting
  const isUnlimited = (val: any) =>
    val === 'unlimited' || val === -1 || (typeof val === 'number' && val >= 99999);

  // Normalize assigned package IDs
  const rawPkgIds: string[] = Array.isArray(org.packageIds)
    ? org.packageIds
    : (typeof org.packageIds === 'string' && org.packageIds.trim().startsWith('[')
        ? (() => { try { return JSON.parse(org.packageIds); } catch { return []; } })()
        : (typeof org.packageIds === 'string' && org.packageIds.trim() ? [org.packageIds.trim()] : []));

  // Find active packages assigned to this organization
  const orgPackages = rawPkgIds
    .map((pkgId: string) => packages.find((p) => p.id === pkgId))
    .filter(Boolean) as Package[];

  // Dynamic Tier Name based on assigned packages
  let tierName: string;
  if (orgPackages.length > 0) {
    tierName = orgPackages.map((p) => p.name).join(', ');
  } else {
    tierName = org.subscriptionTier || 'Standard';
  }

  // Compute Limits
  let totalIdLimit: number | 'unlimited';
  let totalExamLimit: number | 'unlimited';
  let hasUnlimitedIds = false;
  let hasUnlimitedExams = false;

  if (orgPackages.length > 0) {
    // 1. When packages are assigned, the assigned package definitions are authoritative
    hasUnlimitedIds = orgPackages.some((p) => isUnlimited(p.idLimit));
    hasUnlimitedExams = orgPackages.some((p) => isUnlimited(p.examLimit));

    if (hasUnlimitedIds) {
      totalIdLimit = 'unlimited';
    } else {
      totalIdLimit = orgPackages.reduce((acc, p) => {
        const num = typeof p.idLimit === 'number' ? p.idLimit : parseInt(p.idLimit as any, 10);
        return acc + (isNaN(num) || num <= 0 ? 0 : num);
      }, 0);
      if (totalIdLimit === 0) totalIdLimit = 50;
    }

    if (hasUnlimitedExams) {
      totalExamLimit = 'unlimited';
    } else {
      totalExamLimit = orgPackages.reduce((acc, p) => {
        const num = typeof p.examLimit === 'number' ? p.examLimit : parseInt(p.examLimit as any, 10);
        return acc + (isNaN(num) || num <= 0 ? 0 : num);
      }, 0);
      if (totalExamLimit === 0) totalExamLimit = 100;
    }
  } else {
    // 2. Fallback to organization direct limits when no package is assigned
    hasUnlimitedIds = isUnlimited(org.maxSeats);
    hasUnlimitedExams = isUnlimited(org.maxExamsPerMonth);

    totalIdLimit = hasUnlimitedIds
      ? 'unlimited'
      : (typeof org.maxSeats === 'number' && org.maxSeats > 0 ? org.maxSeats : 50);

    totalExamLimit = hasUnlimitedExams
      ? 'unlimited'
      : (typeof org.maxExamsPerMonth === 'number' && org.maxExamsPerMonth > 0 ? org.maxExamsPerMonth : 100);
  }

  // Real-time Student Count (Active candidate IDs issued for this tenant)
  const orgStudents = students.filter((s) => s.orgId === org.id);
  const usedIds = Math.max(orgStudents.length, org.studentCount || 0);

  // Real-time Exams Used
  const usedExams = org.examsUsedThisMonth || 0;

  // Remaining Calculations
  const remainingIds = totalIdLimit === 'unlimited' ? 'unlimited' : Math.max(0, totalIdLimit - usedIds);
  const remainingExams = totalExamLimit === 'unlimited' ? 'unlimited' : Math.max(0, totalExamLimit - usedExams);

  const isIdQuotaFull = totalIdLimit !== 'unlimited' && usedIds >= totalIdLimit;
  const isExamQuotaFull = totalExamLimit !== 'unlimited' && usedExams >= totalExamLimit;

  // WARNING: Only 3 or fewer exams remaining (1, 2, or 3 remaining)
  const isNearExamLimit = totalExamLimit !== 'unlimited' && typeof remainingExams === 'number' && remainingExams <= 3 && remainingExams > 0;

  return {
    orgId: org.id,
    orgName: org.name,
    tierName,
    totalIdLimit,
    usedIds,
    remainingIds,
    isIdQuotaFull,
    totalExamLimit,
    usedExams,
    remainingExams,
    isExamQuotaFull,
    isNearExamLimit,
    hasUnlimitedIds,
    hasUnlimitedExams
  };
}
