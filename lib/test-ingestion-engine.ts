import { Test, Passage, ListeningSection, WritingTask, SpeakingPart, Question, QuestionType, MOCK_IELTS_TEST } from './mock-data';

/**
 * Universal JSON Normalizer & Ingestion Engine for IELTS Mock Test Platform
 * Parses any incoming JSON payload (Full 4-module test, Reading-only, Listening-only, etc.)
 * and transforms it into a standard, fully-formed Test object ready for database storage.
 */

export interface IngestionResult {
  success: boolean;
  test?: Test;
  error?: string;
  summary?: {
    passagesCount: number;
    listeningSectionsCount: number;
    writingTasksCount: number;
    speakingPartsCount: number;
    totalQuestionsCount: number;
  };
}

export function parseAndNormalizeTestJson(input: string | object, metadata?: { title?: string; category?: 'Academic' | 'General Training' }): IngestionResult {
  try {
    let raw: any = typeof input === 'string' ? JSON.parse(input) : input;

    if (!raw || typeof raw !== 'object') {
      return { success: false, error: 'Input must be a valid JSON object or string.' };
    }

    const testId = raw.id || `test-ingested-${Date.now()}`;
    const testTitle = metadata?.title || raw.title || 'Ingested IELTS Mock Test';
    const testCategory = metadata?.category || raw.category || 'Academic';

    // 1. Normalize Reading Passages
    const readingPassages: Passage[] = normalizeReadingData(raw.reading || (Array.isArray(raw) ? raw : [raw]));

    // 2. Normalize Listening Sections
    const listeningSections: ListeningSection[] = normalizeListeningData(raw.listening || []);

    // 3. Normalize Writing Tasks
    const writingTasks: WritingTask[] = normalizeWritingData(raw.writing || []);

    // 4. Normalize Speaking Parts
    const speakingParts: SpeakingPart[] = normalizeSpeakingData(raw.speaking || []);

    // Fill missing modules with default structure if incomplete
    const finalReading = readingPassages.length > 0 ? readingPassages : MOCK_IELTS_TEST.reading;
    const finalListening = listeningSections.length > 0 ? listeningSections : MOCK_IELTS_TEST.listening;
    const finalWriting = writingTasks.length > 0 ? writingTasks : MOCK_IELTS_TEST.writing;
    const finalSpeaking = speakingParts.length > 0 ? speakingParts : MOCK_IELTS_TEST.speaking;

    // Calculate total questions count across modules
    const totalReadingQs = finalReading.reduce((acc, p) => acc + (p.questions?.length || 0), 0);
    const totalListeningQs = finalListening.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
    const totalQs = totalReadingQs + totalListeningQs;

    const completedTest: Test = {
      id: testId,
      title: testTitle,
      category: testCategory,
      tierAccess: raw.tierAccess || 'All Orgs',
      status: raw.status || 'published',
      totalDurationMinutes: raw.totalDurationMinutes || 165,
      questionCount: totalQs > 0 ? totalQs : 40,
      createdDate: new Date().toISOString().split('T')[0],
      reading: finalReading,
      listening: finalListening,
      listeningAudioUrl: raw.listeningAudioUrl || (raw.listening && raw.listening[0]?.audioUrl) || 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c2680a424e.mp3?filename=ambient-piano-amp-strings-10711.mp3',
      writing: finalWriting,
      speaking: finalSpeaking,
    };

    return {
      success: true,
      test: completedTest,
      summary: {
        passagesCount: finalReading.length,
        listeningSectionsCount: finalListening.length,
        writingTasksCount: finalWriting.length,
        speakingPartsCount: finalSpeaking.length,
        totalQuestionsCount: totalQs,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: `JSON Parse / Validation Error: ${err.message}`,
    };
  }
}

/* ---------------- Helper Normalizer Functions ---------------- */

function normalizeReadingData(rawReading: any): Passage[] {
  let list: any[] = [];
  if (Array.isArray(rawReading)) {
    list = rawReading;
  } else if (rawReading && typeof rawReading === 'object') {
    list = [rawReading];
  }

  if (list.length === 0) return [];

  return list.map((p: any, pIdx: number) => {
    // Body text normalization
    let contentStr = '';
    if (typeof p.content === 'string' && p.content.trim()) {
      contentStr = p.content;
    } else if (typeof p.text === 'string' && p.text.trim()) {
      contentStr = p.text;
    } else if (p.paragraphs) {
      if (Array.isArray(p.paragraphs)) {
        contentStr = p.paragraphs.join('\n\n');
      } else if (typeof p.paragraphs === 'object') {
        contentStr = Object.entries(p.paragraphs)
          .map(([k, v]) => `[Paragraph ${k}] ${v}`)
          .join('\n\n');
      }
    }

    // Questions normalization
    const questions: Question[] = [];
    let qCounter = pIdx * 13 + 1;

    if (Array.isArray(p.questions)) {
      p.questions.forEach((block: any) => {
        const typeStr = (block.type || block.question_type || '').toUpperCase();
        let mappedType: QuestionType = 'multiple_choice_single';

        if (typeStr.includes('YES/NO') || typeStr.includes('YES / NO')) mappedType = 'yes_no_ng';
        else if (typeStr.includes('TRUE/FALSE') || typeStr.includes('TRUE / FALSE')) mappedType = 'true_false_ng';
        else if (typeStr.includes('MATCHING INFO')) mappedType = 'matching_information';
        else if (typeStr.includes('MATCHING HEADING')) mappedType = 'matching_headings';
        else if (typeStr.includes('MATCHING FEATURE')) mappedType = 'matching_features';
        else if (typeStr.includes('SUMMARY')) mappedType = 'summary_completion';
        else if (typeStr.includes('DIAGRAM')) mappedType = 'flow_chart_completion';
        else if (typeStr.includes('NOTE')) mappedType = 'note_completion';
        else if (typeStr.includes('TABLE')) mappedType = 'table_completion';
        else if (typeStr.includes('MULTIPLE CHOICE')) mappedType = typeStr.includes('FIVE') || typeStr.includes('MULTI') ? 'multiple_choice_multi' : 'multiple_choice_single';
        else if (typeStr.includes('SHORT')) mappedType = 'short_answer';
        else if (typeStr.includes('SENTENCE')) mappedType = 'sentence_completion';

        let optionsArr: string[] | undefined = undefined;
        if (block.options) {
          if (Array.isArray(block.options)) optionsArr = block.options;
          else if (typeof block.options === 'object') optionsArr = Object.entries(block.options).map(([k, v]) => `${k}. ${v}`);
        }

        if (Array.isArray(block.items) && block.items.length > 0) {
          block.items.forEach((item: any, itemIdx: number) => {
            const num = typeof item.number === 'number' ? item.number : (typeof item.number === 'string' && !isNaN(parseInt(item.number)) ? parseInt(item.number) : qCounter++);
            const promptText = item.statement || item.question || item.description || (item.number ? `Question ${item.number}` : block.title || block.instructions || 'Question');

            questions.push({
              id: `q-ing-r-${pIdx + 1}-${num}-${itemIdx}-${Math.random().toString(36).substring(2, 6)}`,
              questionNumber: num,
              type: mappedType,
              prompt: promptText,
              instruction: block.instructions || block.title || '',
              options: optionsArr || (mappedType === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : mappedType === 'yes_no_ng' ? ['YES', 'NO', 'NOT GIVEN'] : undefined),
              correctAnswer: item.correctAnswer || item.answer || 'Answer Key',
            });
          });
        } else {
          const num = typeof block.number === 'number' ? block.number : qCounter++;
          const promptText = block.prompt || block.question || block.statement || `Question ${num}`;

          questions.push({
            id: block.id ? `${block.id}-${Math.random().toString(36).substring(2, 6)}` : `q-ing-r-${pIdx + 1}-${num}-${Math.random().toString(36).substring(2, 6)}`,
            questionNumber: num,
            type: mappedType,
            prompt: promptText,
            instruction: block.instructions || '',
            options: optionsArr || (mappedType === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : mappedType === 'yes_no_ng' ? ['YES', 'NO', 'NOT GIVEN'] : undefined),
            correctAnswer: block.correctAnswer || block.answer || 'Answer Key',
          });
        }
      });
    }

    const passageNum = (pIdx === 0 ? 1 : pIdx === 1 ? 2 : 3) as 1 | 2 | 3;

    return {
      id: p.id || `pas-${pIdx + 1}`,
      passageNumber: passageNum,
      title: p.title || `Passage ${pIdx + 1}`,
      content: contentStr,
      diagramUrl: p.diagramUrl || p.diagram_url || undefined,
      questions,
    };
  });
}

function normalizeListeningData(rawListening: any[]): ListeningSection[] {
  if (!Array.isArray(rawListening) || rawListening.length === 0) return [];
  return rawListening.map((sec, idx) => ({
    id: sec.id || `sec-${idx + 1}`,
    title: sec.title || `Section ${idx + 1}`,
    audioUrl: sec.audioUrl,
    duration: sec.duration || sec.audioDurationSeconds || 450,
    questions: Array.isArray(sec.questions) ? sec.questions : [],
  }));
}

function normalizeWritingData(rawWriting: any[]): WritingTask[] {
  if (!Array.isArray(rawWriting) || rawWriting.length === 0) return [];
  return rawWriting.map((t, idx) => ({
    id: t.id || `task-${idx + 1}`,
    taskNumber: (idx === 0 ? 1 : 2) as 1 | 2,
    title: t.title || (idx === 0 ? 'Task 1: Academic Report' : 'Task 2: Essay'),
    prompt: t.prompt || 'Write a detailed response based on the prompt...',
    diagramUrl: t.diagramUrl || t.imageUrl || undefined,
    minWords: t.minWords || t.minWordCount || (idx === 0 ? 150 : 250),
    recommendedTime: t.recommendedTime || t.recommendedMinutes || (idx === 0 ? 20 : 40),
  }));
}

function normalizeSpeakingData(rawSpeaking: any[]): SpeakingPart[] {
  if (!Array.isArray(rawSpeaking) || rawSpeaking.length === 0) return [];
  return rawSpeaking.map((part, idx) => {
    const partNum = (idx === 0 ? 1 : idx === 1 ? 2 : 3) as 1 | 2 | 3;
    return {
      id: part.id || `part-${idx + 1}`,
      partNumber: partNum,
      topic: part.topic || part.title || `Part ${idx + 1}`,
      prompts: Array.isArray(part.prompts) ? part.prompts : Array.isArray(part.questions) ? part.questions.map((q: any) => q.prompt || q) : ['Answer examiner questions.'],
      prepTime: part.prepTime || (partNum === 2 ? 60 : undefined),
      speakTime: part.speakTime || (partNum === 2 ? 120 : undefined),
    };
  });
}
