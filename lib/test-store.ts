import { Test, MOCK_TESTS_CATALOG, MOCK_IELTS_TEST } from './mock-data';


const STORAGE_KEY = 'ielts_custom_tests_catalog_v1';

/**
 * Get all tests saved in localStorage + default catalog
 */
export function getStoredTests(): Test[] {
  if (typeof window === 'undefined') return MOCK_TESTS_CATALOG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading tests from localStorage', e);
  }
  return MOCK_TESTS_CATALOG;
}

/**
 * Save or Update a Test in localStorage
 */
export function saveTestToStorage(test: Test): Test[] {
  if (typeof window === 'undefined') return [test];
  try {
    const current = getStoredTests();
    const existingIdx = current.findIndex((t) => t.id === test.id);
    let updated: Test[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = test;
    } else {
      updated = [test, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage_tests_updated'));
    return updated;
  } catch (e) {
    console.error('Error saving test to localStorage', e);
    return [];
  }
}

/**
 * Delete a Test from localStorage
 */
export function deleteTestFromStorage(testId: string): Test[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredTests();
    const updated = current.filter((t) => t.id !== testId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage_tests_updated'));
    return updated;
  } catch (e) {
    console.error('Error deleting test from localStorage', e);
    return [];
  }
}

/**
 * Get a specific Test by ID
 */
export function getTestById(testId: string): Test | undefined {
  const tests = getStoredTests();
  const found = tests.find((t) => t.id === testId);
  if (found) return found;
  
  if (testId === 'test-ielts-01' || testId === 'test-1') {
    return MOCK_IELTS_TEST;
  }
  
  return tests[0] || MOCK_IELTS_TEST;
}

