import { Test, Passage, ListeningSection, QuestionSection, Question, TableCell, FlowStep, DiagramPin } from './mock-data';

/**
 * Normalizes a Test structure by ensuring that all completion modules (table_completion,
 * flow_chart_completion, diagram_labeling, multiple_choice_multi, note_completion, summary_completion, form_completion)
 * have their answer keys synchronized directly into `questions` with correct sequential numbering.
 */
export function normalizeTest(test: Test): Test {
  if (!test) return test;

  const normalized: Test = { ...test };

  // 1. Normalize Listening Sections
  if (Array.isArray(normalized.listening)) {
    let globalListeningQNum = 1;
    normalized.listening = normalized.listening.map((part, pIdx) => {
      const sections = part.sections || [];
      const updatedSections = sections.map((sec, sIdx) => {
        const normalizedSec = normalizeSection(sec);
        // Renumber questions sequentially
        normalizedSec.questions = normalizedSec.questions.map((q) => ({
          ...q,
          questionNumber: globalListeningQNum++,
        }));
        normalizedSec.orderIndex = sIdx;
        return normalizedSec;
      });

      const allFlatQuestions = updatedSections.flatMap((s) => s.questions);
      return {
        ...part,
        sections: updatedSections,
        questions: allFlatQuestions,
      };
    });
  }

  // 2. Normalize Reading Passages
  if (Array.isArray(normalized.reading)) {
    let globalReadingQNum = 1;
    normalized.reading = normalized.reading.map((passage, pIdx) => {
      const sections = passage.sections || [];
      const updatedSections = sections.map((sec, sIdx) => {
        const normalizedSec = normalizeSection(sec);
        // Renumber questions sequentially
        normalizedSec.questions = normalizedSec.questions.map((q) => ({
          ...q,
          questionNumber: globalReadingQNum++,
        }));
        normalizedSec.orderIndex = sIdx;
        return normalizedSec;
      });

      const allFlatQuestions = updatedSections.flatMap((s) => s.questions);
      return {
        ...passage,
        sections: updatedSections,
        questions: allFlatQuestions,
      };
    });
  }

  // Compute total question count
  let totalQ = 0;
  if (normalized.listening) {
    totalQ += normalized.listening.reduce((acc, p) => acc + (p.questions?.length || 0), 0);
  }
  if (normalized.reading) {
    totalQ += normalized.reading.reduce((acc, p) => acc + (p.questions?.length || 0), 0);
  }
  normalized.questionCount = totalQ;

  return normalized;
}

/**
 * Normalizes an individual QuestionSection, synchronizing tableGrid, flowSteps,
 * diagramPins, and multiple_choice_multi answer keys into the section's `questions` array.
 */
export function normalizeSection(sec: QuestionSection): QuestionSection {
  const normalizedSec: QuestionSection = {
    ...sec,
    questions: [...(sec.questions || [])],
  };

  // Case A: Table Completion
  if (normalizedSec.type === 'table_completion' && normalizedSec.tableGrid) {
    const table = normalizedSec.tableGrid;
    const tableQuestions: Question[] = [];
    const updatedRows: TableCell[][] = (table.rows || []).map((row, rIdx) => {
      return row.map((cell, cIdx): TableCell => {
        if (!cell.isGap) return cell;

        const qId = cell.questionId || `q-${normalizedSec.id}-tbl-${rIdx}-${cIdx}`;
        const existingQ = (normalizedSec.questions || []).find((q) => q.id === qId);

        const rawCorrect = cell.correctAnswer !== undefined && cell.correctAnswer !== ''
          ? cell.correctAnswer
          : (existingQ?.correctAnswer || '');

        const correctAnsStr = Array.isArray(rawCorrect) ? rawCorrect.join('/') : String(rawCorrect || '');
        const promptText = cell.text || existingQ?.prompt || '';

        const syncedQ: Question = {
          id: qId,
          type: 'table_completion',
          prompt: promptText,
          sectionId: normalizedSec.id,
          correctAnswer: correctAnsStr,
          questionNumber: existingQ?.questionNumber || (tableQuestions.length + 1),
        };

        tableQuestions.push(syncedQ);

        return {
          ...cell,
          questionId: qId,
          correctAnswer: correctAnsStr,
        };
      });
    });

    normalizedSec.tableGrid = {
      ...table,
      rows: updatedRows,
    };

    if (tableQuestions.length > 0) {
      normalizedSec.questions = tableQuestions;
    }
  }

  // Case B: Flow-chart Completion
  if (normalizedSec.type === 'flow_chart_completion' && normalizedSec.flowSteps) {
    const flowQuestions: Question[] = [];
    const updatedSteps: FlowStep[] = normalizedSec.flowSteps.map((step, sIdx): FlowStep => {
      if (!step.isGap) return step;

      const qId = step.questionId || `q-${normalizedSec.id}-flw-${sIdx}`;
      const existingQ = (normalizedSec.questions || []).find((q) => q.id === qId);

      const rawCorrect = step.correctAnswer !== undefined && step.correctAnswer !== ''
        ? step.correctAnswer
        : (existingQ?.correctAnswer || '');

      const correctAnsStr = Array.isArray(rawCorrect) ? rawCorrect.join('/') : String(rawCorrect || '');
      const promptText = step.text || existingQ?.prompt || '';

      const syncedQ: Question = {
        id: qId,
        type: 'flow_chart_completion',
        prompt: promptText,
        sectionId: normalizedSec.id,
        correctAnswer: correctAnsStr,
        questionNumber: existingQ?.questionNumber || (flowQuestions.length + 1),
      };

      flowQuestions.push(syncedQ);

      return {
        ...step,
        questionId: qId,
        correctAnswer: correctAnsStr,
      };
    });

    normalizedSec.flowSteps = updatedSteps;

    if (flowQuestions.length > 0) {
      normalizedSec.questions = flowQuestions;
    }
  }

  // Case C: Diagram Labelling
  if (normalizedSec.type === 'diagram_labeling' && normalizedSec.diagramPins) {
    const diagramQuestions: Question[] = [];
    const updatedPins: DiagramPin[] = normalizedSec.diagramPins.map((pin, pIdx): DiagramPin => {
      const qId = pin.id || `q-${normalizedSec.id}-pin-${pIdx}`;
      const existingQ = (normalizedSec.questions || []).find((q) => q.id === qId);

      const rawCorrect = pin.correctAnswer !== undefined && pin.correctAnswer !== ''
        ? pin.correctAnswer
        : (existingQ?.correctAnswer || '');

      const correctAnsStr = Array.isArray(rawCorrect) ? rawCorrect.join('/') : String(rawCorrect || '');
      const promptText = existingQ?.prompt || `Pin ${pin.pinNumber || (pIdx + 1)}`;

      const syncedQ: Question = {
        id: qId,
        type: 'diagram_labeling',
        prompt: promptText,
        sectionId: normalizedSec.id,
        correctAnswer: correctAnsStr,
        questionNumber: pin.pinNumber || existingQ?.questionNumber || (pIdx + 1),
      };

      diagramQuestions.push(syncedQ);

      return {
        ...pin,
        id: qId,
        correctAnswer: correctAnsStr,
      };
    });

    normalizedSec.diagramPins = updatedPins;

    if (diagramQuestions.length > 0) {
      normalizedSec.questions = diagramQuestions;
    }
  }

  // Case D: Multiple Choice (Multiple Answers)
  if (normalizedSec.type === 'multiple_choice_multi') {
    const reqCount = normalizedSec.requiredSelectionCount || normalizedSec.questions?.length || 2;
    const wordBank = normalizedSec.wordBankOptions || [];
    const multiCorrect = normalizedSec.multiCorrectAnswers || [];

    // Build the resolved correct answer list (both full text, letters, and 'Letter. Text')
    const resolvedCorrectList: string[] = [];
    multiCorrect.forEach((corr) => {
      if (!corr) return;
      resolvedCorrectList.push(corr);

      const optIdx = wordBank.findIndex((opt) => opt.trim().toLowerCase() === corr.trim().toLowerCase());
      if (optIdx >= 0) {
        const letter = String.fromCharCode(65 + optIdx);
        resolvedCorrectList.push(letter);
        resolvedCorrectList.push(`${letter}. ${corr}`);
      } else if (/^[A-Z]$/i.test(corr.trim())) {
        const letter = corr.trim().toUpperCase();
        const idx = letter.charCodeAt(0) - 65;
        if (wordBank[idx]) {
          resolvedCorrectList.push(wordBank[idx]);
          resolvedCorrectList.push(`${letter}. ${wordBank[idx]}`);
        }
      }
    });

    // Ensure questions array matches reqCount
    let qList: Question[] = normalizedSec.questions || [];
    if (qList.length < reqCount) {
      qList = Array.from({ length: reqCount }, (_, i) => ({
        id: qList[i]?.id || `q-${normalizedSec.id}-multi-${i}`,
        type: 'multiple_choice_multi',
        prompt: qList[i]?.prompt || normalizedSec.instructions || normalizedSec.title || `Choose ${reqCount} options`,
        sectionId: normalizedSec.id,
        correctAnswer: resolvedCorrectList,
        questionNumber: qList[i]?.questionNumber || (i + 1),
      }));
    } else {
      qList = qList.map((q) => ({
        ...q,
        type: 'multiple_choice_multi',
        prompt: q.prompt || normalizedSec.instructions || normalizedSec.title || '',
        correctAnswer: resolvedCorrectList.length > 0 ? resolvedCorrectList : (q.correctAnswer || []),
      }));
    }

    normalizedSec.questions = qList;
  }

  return normalizedSec;
}

/**
 * Extracts a flat list of questions from a Test for a given module (listening or reading),
 * guaranteeing that every question has its correct answer resolved.
 */
export function extractResolvedQuestions(test: any, module: 'reading' | 'listening'): Question[] {
  if (!test) return [];

  const rawList = module === 'listening' ? test.listening : test.reading;
  if (!Array.isArray(rawList)) return [];

  const questions: Question[] = [];

  rawList.forEach((parent) => {
    const sections: QuestionSection[] = parent.sections || [];
    if (sections.length > 0) {
      sections.forEach((sec) => {
        const normalized = normalizeSection(sec);
        (normalized.questions || []).forEach((q) => {
          questions.push(resolveQuestionAnswer(q, normalized));
        });
      });
    } else if (parent.questions && parent.questions.length > 0) {
      parent.questions.forEach((q: Question) => {
        questions.push(q);
      });
    }
  });

  return questions;
}

/**
 * Resolves the correctAnswer of a question using fallback lookups in tableGrid, flowSteps, diagramPins, multiCorrectAnswers.
 */
export function resolveQuestionAnswer(q: Question, sec?: QuestionSection): Question {
  if (q.correctAnswer !== undefined && q.correctAnswer !== null && q.correctAnswer !== '' && (!Array.isArray(q.correctAnswer) || q.correctAnswer.length > 0)) {
    return q;
  }

  if (!sec) return q;

  // Fallback 1: Look in tableGrid
  if (sec.tableGrid?.rows) {
    for (const row of sec.tableGrid.rows) {
      for (const cell of row) {
        if (cell.isGap && (cell.questionId === q.id || (!cell.questionId && cell.correctAnswer))) {
          if (cell.correctAnswer) {
            return { ...q, correctAnswer: cell.correctAnswer };
          }
        }
      }
    }
  }

  // Fallback 2: Look in flowSteps
  if (sec.flowSteps) {
    for (const step of sec.flowSteps) {
      if (step.isGap && (step.questionId === q.id || (!step.questionId && step.correctAnswer))) {
        if (step.correctAnswer) {
          return { ...q, correctAnswer: step.correctAnswer };
        }
      }
    }
  }

  // Fallback 3: Look in diagramPins
  if (sec.diagramPins) {
    for (const pin of sec.diagramPins) {
      if (pin.id === q.id || pin.pinNumber === q.questionNumber) {
        if (pin.correctAnswer) {
          return { ...q, correctAnswer: pin.correctAnswer };
        }
      }
    }
  }

  // Fallback 4: Look in multiCorrectAnswers (for multiple_choice_multi)
  if (sec.type === 'multiple_choice_multi' && sec.multiCorrectAnswers && sec.multiCorrectAnswers.length > 0) {
    const wordBank = sec.wordBankOptions || [];
    const resolved: string[] = [];
    sec.multiCorrectAnswers.forEach((corr) => {
      resolved.push(corr);
      const optIdx = wordBank.findIndex((opt) => opt.trim().toLowerCase() === corr.trim().toLowerCase());
      if (optIdx >= 0) {
        const letter = String.fromCharCode(65 + optIdx);
        resolved.push(letter);
        resolved.push(`${letter}. ${corr}`);
      }
    });
    return { ...q, correctAnswer: resolved };
  }

  return q;
}
