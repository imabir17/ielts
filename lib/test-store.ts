import { Test, MOCK_TESTS_CATALOG } from './mock-data';
import { supabase } from './supabase';

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
 * Get a specific Test by ID synchronously from memory or storage
 */
export function getTestById(testId: string, inMemoryTests?: Test[]): Test | undefined {
  if (inMemoryTests && inMemoryTests.length > 0) {
    const found = inMemoryTests.find((t) => t.id === testId);
    if (found) return found;
  }
  const tests = getStoredTests();
  const matched = tests.find((t) => t.id === testId);
  if (matched) return matched;
  const mockMatched = MOCK_TESTS_CATALOG.find((t) => t.id === testId);
  return mockMatched;
}

/**
 * Robust async fetch: checks memory, storage, catalog, and finally Supabase
 */
export async function fetchTestByIdAsync(testId: string, inMemoryTests?: Test[]): Promise<Test | undefined> {
  const local = getTestById(testId, inMemoryTests);
  if (local && (local.reading || local.listening || local.writing || local.speaking)) return local;

  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .maybeSingle();

    if (data && !error) {
      const normalized: Test = {
        ...data,
        totalDurationMinutes: data.total_duration_minutes ?? data.totalDurationMinutes,
        tierAccess: data.tier_access ?? data.tierAccess,
        questionCount: data.question_count ?? data.questionCount,
        createdDate: data.created_date ?? data.createdDate,
        listeningAudioUrl: data.listening_audio_url ?? data.listeningAudioUrl
      };
      saveTestToStorage(normalized);
      return normalized;
    }
  } catch (err) {
    console.error('Error fetching test from Supabase:', err);
  }

  return undefined;
}

