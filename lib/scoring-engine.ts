import { Question, Passage, QuestionSection, QuestionType } from './mock-data';

/**
 * Universal IELTS Automated Scoring Engine
 * Checks student answers against answer keys and alternate spellings
 * with support for all 14 official section & question types.
 */

export interface ScoreResult {
  totalScore: number;
  maxScore: number;
  bandScore: number;
  breakdown: Record<string, number>; // questionId -> score (0, 0.5, 1)
}

function normalizeText(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
}

function countWords(str: string): number {
  const clean = str.trim();
  if (!clean) return 0;
  return clean.split(/\s+/).length;
}

function extractMaxWordsFromLimit(wordLimitStr?: string): number | null {
  if (!wordLimitStr) return null;
  const lower = wordLimitStr.toLowerCase();
  if (lower.includes('one word') || lower.includes('1 word')) return 1;
  if (lower.includes('two words') || lower.includes('2 words')) return 2;
  if (lower.includes('three words') || lower.includes('3 words')) return 3;
  if (lower.includes('four words') || lower.includes('4 words')) return 4;
  return null;
}

/**
 * Core checkAnswer function for a single question
 */
export function checkAnswer(
  question: Question,
  studentAnswer: string | string[],
  sectionWordLimit?: string
): number {
  if (studentAnswer === undefined || studentAnswer === null || studentAnswer === '') {
    return 0;
  }

  const qType = question.type;

  // 1. Multiple Choice Single
  if (qType === 'multiple_choice_single' || qType === 'multiple-choice') {
    const sAns = normalizeText(Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer);
    const cAns = normalizeText(Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer);
    
    // Also check if student selected option letter (e.g. "A") and correct answer is "A" or "A. Option Text"
    if (sAns === cAns) return 1;
    if (sAns.length === 1 && cAns.startsWith(sAns)) return 1;
    if (cAns.length === 1 && sAns.startsWith(cAns)) return 1;
    return 0;
  }

  // 2. Multiple Choice Multi (Set Equality / List Selection)
  if (qType === 'multiple_choice_multi') {
    // OLD FALLBACK: If student answer is an array with multiple items, grade it as a single block.
    if (Array.isArray(studentAnswer) && Array.isArray(question.correctAnswer) && studentAnswer.length > 1) {
      const sArr = studentAnswer.map(normalizeText).filter(Boolean);
      const cArr = question.correctAnswer.map(normalizeText).filter(Boolean);
      if (sArr.length !== cArr.length) return 0;
      const sSet = new Set(sArr);
      return cArr.every((item) => sSet.has(item)) ? 1 : 0;
    }

    // NEW LOGIC: 1 point per slot. Student answer is a single string mapped to this question ID.
    const sAnsStr = normalizeText(Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer);
    const cArr = (Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer]).map(normalizeText).filter(Boolean);

    return cArr.includes(sAnsStr) ? 1 : 0;
  }

  // 3. True / False / Not Given & Yes / No / Not Given
  if (qType === 'true_false_ng' || qType === 'yes_no_ng') {
    const sAns = normalizeText(Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer);
    const cAns = normalizeText(Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer);

    // Support single letter shortcuts e.g. "t" for TRUE, "f" for FALSE, "ng" for NOT GIVEN
    if (sAns === cAns) return 1;
    if (sAns === 't' && cAns === 'true') return 1;
    if (sAns === 'f' && cAns === 'false') return 1;
    if (sAns === 'ng' && cAns === 'not given') return 1;
    if (sAns === 'y' && cAns === 'yes') return 1;
    if (sAns === 'n' && cAns === 'no') return 1;
    return 0;
  }

  // 4. Free-text & Gap Fill Types (Sentence, Summary, Note, Table, Flowchart, Diagram, Short Answer)
  const isFreeText =
    qType === 'sentence_completion' ||
    qType === 'summary_completion' ||
    qType === 'note_completion' ||
    qType === 'table_completion' ||
    qType === 'flow_chart_completion' ||
    qType === 'short_answer' ||
    qType === 'text-input';

  if (isFreeText) {
    // MULTI-GAP SUPPORT (Array vs Array)
    if (Array.isArray(studentAnswer) && Array.isArray(question.correctAnswer)) {
      const maxWords = extractMaxWordsFromLimit(sectionWordLimit);
      
      let correctMatches = 0;
      const totalGaps = question.correctAnswer.length;
      
      const sArr = studentAnswer;
      // We will check each gap's answer against the corresponding slot in correctAnswer
      for (let i = 0; i < totalGaps; i++) {
        const gapStudentAns = sArr[i] || '';
        const gapCorrectAns = question.correctAnswer[i] || '';
        
        const gapNormStudent = normalizeText(gapStudentAns);
        const gapNormCorrect = normalizeText(gapCorrectAns);
        
        // Word limit validation per gap
        if (maxWords !== null && countWords(gapStudentAns) > maxWords) {
          continue; // Wrong
        }
        
        if (gapNormStudent === gapNormCorrect) {
          correctMatches++;
        } else if (question.acceptedAlternates) {
          // If the admin provided alternate answers, check if any match
          // Note: In a multi-gap scenario, alternate answers might apply generally or be specific.
          // For simplicity, we check if the normalized student answer is in the normalized alternates array.
          const normAlternates = question.acceptedAlternates.map(normalizeText);
          if (normAlternates.includes(gapNormStudent)) {
            correctMatches++;
          }
        }
      }
      
      // Calculate fractional score (e.g., 1/2 = 0.5)
      return totalGaps > 0 ? correctMatches / totalGaps : 0;
    }

    const rawStudentStr = Array.isArray(studentAnswer) ? studentAnswer.join(' ') : String(studentAnswer);
    const normStudent = normalizeText(rawStudentStr);

    // Word count validation if section has wordLimit
    const maxWords = extractMaxWordsFromLimit(sectionWordLimit);
    if (maxWords !== null && countWords(rawStudentStr) > maxWords) {
      return 0; // Rejected for exceeding word count limit
    }

    // Build target acceptable answers list
    const primaryKey = Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer;
    const allAcceptableKeys = [
      primaryKey,
      ...(Array.isArray(question.correctAnswer) ? question.correctAnswer.slice(1) : []),
      ...(question.acceptedAlternates || []),
    ].map(normalizeText).filter(Boolean);

    return allAcceptableKeys.includes(normStudent) ? 1 : 0;
  }

  // 5. Matching Types (Headings, Features, Sentence Endings, Information)
  const sAns = normalizeText(Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer);
  const cAns = normalizeText(Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer);

  if (sAns === cAns) return 1;
  // Support matching option key shortcuts (e.g. "iii" or "A")
  if (sAns.length > 0 && (cAns.startsWith(sAns) || sAns.startsWith(cAns))) return 1;

  return 0;
}

/**
 * Calculate Overall IELTS Reading Band Score (0 to 9.0) from Raw Score out of 40
 */
export function convertRawToBandScore(rawScore: number): number {
  if (rawScore >= 39) return 9.0;
  if (rawScore >= 37) return 8.5;
  if (rawScore >= 35) return 8.0;
  if (rawScore >= 33) return 7.5;
  if (rawScore >= 30) return 7.0;
  if (rawScore >= 27) return 6.5;
  if (rawScore >= 23) return 6.0;
  if (rawScore >= 19) return 5.5;
  if (rawScore >= 15) return 5.0;
  if (rawScore >= 13) return 4.5;
  if (rawScore >= 10) return 4.0;
  if (rawScore >= 8) return 3.5;
  if (rawScore >= 5) return 3.0;
  if (rawScore >= 3) return 2.5;
  return 0.0;
}

/**
 * Full test score calculator across all passages and sections
 */
export function calculateTestScore(passages: Passage[], userAnswers: Record<string, any>): ScoreResult {
  let totalScore = 0;
  let maxScore = 0;
  const breakdown: Record<string, number> = {};

  passages.forEach((p) => {
    // If passage uses structured sections
    if (p.sections && p.sections.length > 0) {
      p.sections.forEach((sec) => {
        sec.questions.forEach((q) => {
          maxScore++;
          const studentAns = userAnswers[q.id] || userAnswers[String(q.questionNumber)];
          const score = checkAnswer(q, studentAns, sec.wordLimit);
          breakdown[q.id] = score;
          totalScore += score;
        });
      });
    } else {
      // Flat questions array
      p.questions.forEach((q) => {
        maxScore++;
        const studentAns = userAnswers[q.id] || userAnswers[String(q.questionNumber)];
        const score = checkAnswer(q, studentAns);
        breakdown[q.id] = score;
        totalScore += score;
      });
    }
  });

  const bandScore = convertRawToBandScore(totalScore);

  return {
    totalScore,
    maxScore,
    bandScore,
    breakdown,
  };
}
