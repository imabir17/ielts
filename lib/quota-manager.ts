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

  // Find active packages assigned to this org
  const orgPackages = (org.packageIds || [])
    .map((pkgId: string) => packages.find((p) => p.id === pkgId))
    .filter(Boolean) as Package[];

  const isEnterprise = org.subscriptionTier === 'Enterprise';

  // Check unlimited flags
  const hasUnlimitedIds = (isEnterprise && (!org.packageIds || org.packageIds.length === 0)) ||
    orgPackages.some((p) => p.idLimit === 'unlimited');
  const hasUnlimitedExams = (isEnterprise && (!org.packageIds || org.packageIds.length === 0)) ||
    orgPackages.some((p) => p.examLimit === 'unlimited');

  // 1. Compute Total ID Limit
  let totalIdLimit: number | 'unlimited';
  if (hasUnlimitedIds) {
    totalIdLimit = 'unlimited';
  } else if (orgPackages.length > 0) {
    const packageIdSum = orgPackages.reduce((acc, p) => {
      if (p.idLimit === 'unlimited') return acc;
      return acc + (typeof p.idLimit === 'number' ? p.idLimit : 0);
    }, 0);
    totalIdLimit = packageIdSum > 0 ? packageIdSum : (org.maxSeats || 50);
  } else {
    totalIdLimit = org.maxSeats || (isEnterprise ? 300 : org.subscriptionTier === 'Premium' ? 150 : 50);
  }

  // 2. Compute Total Exam Limit
  let totalExamLimit: number | 'unlimited';
  if (hasUnlimitedExams) {
    totalExamLimit = 'unlimited';
  } else if (orgPackages.length > 0) {
    const packageExamSum = orgPackages.reduce((acc, p) => {
      if (p.examLimit === 'unlimited') return acc;
      return acc + (typeof p.examLimit === 'number' ? p.examLimit : 0);
    }, 0);
    totalExamLimit = packageExamSum > 0 ? packageExamSum : (org.maxExamsPerMonth || 100);
  } else {
    totalExamLimit = org.maxExamsPerMonth || (isEnterprise ? 600 : org.subscriptionTier === 'Premium' ? 300 : 100);
  }

  // Real-time Student Count (Active IDs issued)
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
    tierName: org.subscriptionTier || 'Standard',
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
