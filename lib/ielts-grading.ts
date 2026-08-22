/**
 * Official IELTS Band Score conversion and calculation utilities
 */

export function rawToBandScore(rawScore: number, module: 'reading' | 'listening', category: 'Academic' | 'General Training' = 'Academic'): number {
  const score = Math.max(0, Math.min(40, rawScore));

  if (module === 'listening') {
    if (score >= 39) return 9.0;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8.0;
    if (score >= 32) return 7.5;
    if (score >= 30) return 7.0;
    if (score >= 26) return 6.5;
    if (score >= 23) return 6.0;
    if (score >= 18) return 5.5;
    if (score >= 16) return 5.0;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4.0;
    if (score >= 8) return 3.5;
    if (score >= 6) return 3.0;
    if (score >= 4) return 2.5;
    return score > 0 ? 2.0 : 0.0;
  }

  // Academic Reading
  if (category === 'Academic') {
    if (score >= 39) return 9.0;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8.0;
    if (score >= 33) return 7.5;
    if (score >= 30) return 7.0;
    if (score >= 27) return 6.5;
    if (score >= 23) return 6.0;
    if (score >= 19) return 5.5;
    if (score >= 15) return 5.0;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4.0;
    if (score >= 8) return 3.5;
    if (score >= 6) return 3.0;
    if (score >= 4) return 2.5;
    return score > 0 ? 2.0 : 0.0;
  }

  // General Training Reading
  if (score >= 40) return 9.0;
  if (score >= 39) return 8.5;
  if (score >= 37) return 8.0;
  if (score >= 36) return 7.5;
  if (score >= 34) return 7.0;
  if (score >= 32) return 6.5;
  if (score >= 30) return 6.0;
  if (score >= 27) return 5.5;
  if (score >= 23) return 5.0;
  if (score >= 19) return 4.5;
  if (score >= 15) return 4.0;
  if (score >= 12) return 3.5;
  if (score >= 9) return 3.0;
  if (score >= 6) return 2.5;
  return score > 0 ? 2.0 : 0.0;
}

/**
 * Calculates the official IELTS overall band score from module band scores.
 * Rule: Average of 4 modules, rounded to nearest 0.5 (e.g. 6.25 -> 6.5, 6.75 -> 7.0, 6.125 -> 6.0).
 */
export function calculateOverallBand(scores: {
  reading?: number;
  listening?: number;
  writing?: number;
  speaking?: number;
}): number {
  const parts: number[] = [];
  if (scores.reading !== undefined && scores.reading > 0) parts.push(scores.reading);
  if (scores.listening !== undefined && scores.listening > 0) parts.push(scores.listening);
  if (scores.writing !== undefined && scores.writing > 0) parts.push(scores.writing);
  if (scores.speaking !== undefined && scores.speaking > 0) parts.push(scores.speaking);

  if (parts.length === 0) return 0;

  const average = parts.reduce((a, b) => a + b, 0) / parts.length;
  
  // Official IELTS rounding logic:
  // Decimal ending in .25 or higher rounds UP to .5
  // Decimal ending in .75 or higher rounds UP to next whole band
  const floor = Math.floor(average);
  const fraction = average - floor;

  if (fraction < 0.25) {
    return floor;
  } else if (fraction < 0.75) {
    return floor + 0.5;
  } else {
    return floor + 1.0;
  }
}

/**
 * Checks if candidate's answer matches the correct key
 */
export function evaluateAnswerCorrectness(userAns: any, correctAns: any): boolean {
  if (userAns === undefined || userAns === null || userAns === '') return false;
  if (correctAns === undefined || correctAns === null || correctAns === '') return false;

  const normalize = (s: any) => String(s).trim().toLowerCase();

  // Multi-choice array
  if (Array.isArray(correctAns)) {
    if (Array.isArray(userAns)) {
      if (correctAns.length === 0 || userAns.length === 0) return false;
      const normCorrect = correctAns.map(normalize).sort();
      const normUser = userAns.map(normalize).sort();
      return normCorrect.every(k => normUser.includes(k));
    }
    return correctAns.map(normalize).includes(normalize(userAns));
  }

  if (Array.isArray(userAns)) {
    return userAns.map(normalize).includes(normalize(correctAns));
  }

  return normalize(userAns) === normalize(correctAns);
}
