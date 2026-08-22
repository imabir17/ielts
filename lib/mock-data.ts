export interface Organization {
  id: string;
  name: string;
  code: string;
  location: string;
  contactEmail: string;
  subscriptionTier: 'Standard' | 'Premium' | 'Enterprise';
  maxSeats: number;
  maxExamsPerMonth: number;
  examsUsedThisMonth: number;
  studentCount: number;
  activeTests: number;
  status: 'active' | 'suspended';
  createdDate: string;
  orgAdminName: string;
  orgAdminEmail: string;
  phone?: string;
  logoUrl?: string;
  password?: string;
  packageIds?: string[];
}

export interface Package {
  id: string;
  name: string;
  price: number;
  testsIncluded: number; // legacy, keeping for compatibility
  idLimit: number | 'unlimited';
  examLimit: number | 'unlimited';
  description: string;
}

export interface ExamLog {
  id: string;
  studentName: string;
  studentId: string;
  orgName: string;
  orgId: string;
  testTitle: string;
  testId: string;
  completedAt: string;
  status: 'Completed' | 'In Progress' | 'Disconnected' | 'Graded' | 'Pending Review' | 'Submitted';
  isPublished?: boolean;
  gradedAt?: string;
  gradedBy?: string;
  modulesTaken: string[];
  manualOverrides?: {
    reading?: Record<string, boolean>; // questionId -> boolean (true for marked correct, false for marked incorrect)
    listening?: Record<string, boolean>; // questionId -> boolean
  };
  rawScores?: {
    reading?: number;
    listening?: number;
  };
  answers: {
    reading?: Record<string, any>;
    listening?: Record<string, any>;
    writing?: Record<string, any>;
    speaking?: Record<string, any>;
  };
  scores: {
    reading?: number;
    listening?: number;
    writing?: number;
    writingTask1?: number;
    writingTask2?: number;
    speaking?: number;
  };
  overallBand?: number;
  writingFeedback?: string;
  task1Feedback?: string;
  task2Feedback?: string;
  speakingFeedback?: string;
  generalFeedback?: string;
}


export interface SpeakingRequest {
  id: string;
  studentId: string;
  orgId: string;
  testId: string;
  status: 'pending' | 'scheduled' | 'completed';
  scheduledDate?: string;
  type?: 'Physical' | 'Online';
  link?: string;
  requestedAt: string;
  feedback?: string;
  bandScore?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  role: string;
  target: string;
  timestamp: string;
}

export interface QuestionAnomaly {
  questionId: string;
  testTitle: string;
  module: 'Reading' | 'Listening' | 'Writing' | 'Speaking';
  prompt: string;
  passRatePercentage: number;
  issueFlag: 'Unusually Low Pass Rate' | 'Ambiguous Key Flagged' | 'Audio Distortion Report';
}

export interface PlatformManager {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'manager';
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  mobileNumber?: string;
  password?: string;
  orgId: string;
  assignedTests: string[];
  completedTests: number;
  averageBand: number;
}

export type QuestionType =
  | 'multiple_choice_single'
  | 'multiple_choice_multi'
  | 'true_false_ng'
  | 'yes_no_ng'
  | 'matching_headings'
  | 'matching_information'
  | 'matching_features'
  | 'matching_sentence_endings'
  | 'matching' // Unified matching for Listening
  | 'sentence_completion'
  | 'summary_completion'
  | 'note_completion'
  | 'table_completion'
  | 'flow_chart_completion'
  | 'form_completion' // Form completion for Listening
  | 'diagram_labeling'
  | 'short_answer'
  | 'multiple-choice'
  | 'drag-drop'
  | 'text-input';

export interface DiagramPin {
  id: string;
  pinNumber: number;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  correctAnswer: string;
  acceptedAlternates?: string[];
}

export interface TableCell {
  isGap: boolean;
  text?: string;
  questionNumber?: number;
  questionId?: string;
  correctAnswer?: string;
  acceptedAlternates?: string[];
}

export interface FlowStep {
  id: string;
  isGap: boolean;
  text?: string;
  questionNumber?: number;
  questionId?: string;
  correctAnswer?: string;
  acceptedAlternates?: string[];
}

export interface Question {
  id: string;
  questionNumber?: number;
  sectionId?: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  acceptedAlternates?: string[];
  userAnswer?: string | string[];
  instruction?: string;
  itemsToMatch?: { id: string; text: string }[];
  categories?: { id: string; title: string }[];
  tableHeaders?: string[];
  tableRows?: string[][];
  paragraphRef?: string;
  pinNumber?: number;
  helpGuide?: string;
}

export interface QuestionSection {
  id: string;
  sectionNumber?: number;
  type: QuestionType;
  title?: string;
  instructions: string;
  orderIndex: number;
  // Toggles & Settings
  isMultiSelect?: boolean;
  requiredSelectionCount?: number;
  provideWordBank?: boolean;
  wordLimit?: string;
  usedOnceOnly?: boolean;
  summaryTitle?: string;
  summaryText?: string;
  wordBankTitle?: string;
  questionsTitle?: string;
  wordBankLabelStyle?: 'letters' | 'none';
  // Shared Pools
  wordBankOptions?: string[];
  multiCorrectAnswers?: string[]; // for multiple_choice_multi: the set of correct option texts

  headingsPool?: { id: string; label: string; text: string }[]; // legacy – kept for old data compatibility
  paragraphsPool?: string[]; // new: list of paragraph labels students pick from in matching_headings
  featuresPool?: { id: string; text: string }[];
  sentenceEndingsPool?: { id: string; text: string }[];
  // Specific Structure Data
  diagramUrl?: string;
  imagePosition?: 'top' | 'bottom';
  diagramPins?: DiagramPin[];
  tableGrid?: {
    headers?: string[];
    rows: TableCell[][];
  };
  flowSteps?: FlowStep[];
  questions: Question[];
}

export interface Passage {
  id: string;
  passageNumber: 1 | 2 | 3;
  title: string;
  content: string;
  diagramUrl?: string;
  imagePosition?: 'top' | 'bottom';
  sections?: QuestionSection[];
  questions: Question[];
}

export interface ListeningSection {
  id: string;
  title: string;
  audioUrl?: string; // Legacy / Optional (now handled at Test level)
  duration: number; // in seconds
  sections?: QuestionSection[];
  questions: Question[];
}

export interface WritingTask {
  id: string;
  taskNumber: 1 | 2;
  title: string;
  prompt: string;
  minWords: number;
  recommendedTime: number; // minutes
  diagramUrl?: string;
}

export interface SpeakingPart {
  id: string;
  partNumber: 1 | 2 | 3;
  topic: string;
  prompts: string[];
  prepTime?: number; // seconds
  speakTime?: number; // seconds
}

export interface Test {
  id: string;
  title: string;
  category: 'Academic' | 'General Training';
  totalDurationMinutes: number;
  status: 'published' | 'draft' | 'archived';
  tierAccess: 'All Orgs' | 'Premium Only' | 'Enterprise Custom';
  questionCount: number;
  createdDate: string;
  reading: Passage[];
  listening: ListeningSection[];
  listeningAudioUrl?: string;
  writing: WritingTask[];
  speaking: SpeakingPart[];
}

export const MOCK_IELTS_TEST: Test = {
  id: 'test-ielts-01',
  title: 'IELTS Academic Official Computer Practice Test 01',
  category: 'Academic',
  totalDurationMinutes: 165,
  status: 'published',
  tierAccess: 'All Orgs',
  questionCount: 40,
  createdDate: '2026-02-01',
  reading: [
    {
      id: 'pas-1',
      passageNumber: 1,
      title: 'Passage 1: The Architecture of Coral Reef Ecosystems',
      content: `[Paragraph A] Coral reefs are among the most biodiverse ecosystems on Earth, occupying less than 0.1% of the ocean floor while harboring roughly 25% of all marine species. These complex biological structures are constructed primarily by stony corals—colonial polyps that secrete calcium carbonate skeletons over thousands of years.

[Paragraph B] The foundational architecture of a coral reef is created by hermatypic corals in symbiosis with photosynthetic dinoflagellates known as zooxanthellae. The zooxanthellae reside within the coral polyps' gastrodermal tissues, receiving shelter and inorganic nutrients like nitrogen and phosphorus. In return, the algae photosynthesize and translocate up to 90% of their organic carbon compounds directly to the coral host, fueling rapid skeleton accretion.

[Paragraph C] However, marine scientists have recently documented widespread physiological stress in coral communities due to elevated sea surface temperatures. When ocean waters exceed seasonal historical maximums by as little as 1°C to 2°C for extended periods, the photosynthetic machinery of zooxanthellae becomes impaired, producing toxic reactive oxygen species. To protect themselves, coral polyps expel their algal symbionts in a process termed "coral bleaching."

[Paragraph D] Stripped of their vibrant microscopic residents, the translucent corals expose their stark white calcium carbonate skeletons. If sea temperatures return to baseline within a critical window of several weeks, corals can reacquire zooxanthellae from the water column or multiply remnant populations. Conversely, prolonged thermal stress leads to eventual coral starvation, tissue necrosis, and colonization by turf algae, converting intricate reef habitats into barren rubble fields.`,
      questions: [
        {
          id: 'q-1',
          questionNumber: 1,
          type: 'multiple_choice_single',
          prompt: '1. What proportion of the ocean floor is covered by coral reefs?',
          options: [
            'A. Less than 0.1%',
            'B. Approximately 25%',
            'C. Exactly 10%',
            'D. Over 50%',
          ],
          correctAnswer: 'A. Less than 0.1%',
          instruction: 'Choose the correct letter A, B, C, or D.',
          helpGuide: 'Click on the radio button corresponding to the single correct option.',
        },
        {
          id: 'q-2',
          questionNumber: 2,
          type: 'true_false_ng',
          prompt: '2. Zooxanthellae provide up to 90% of their organic carbon to the coral host.',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          correctAnswer: 'TRUE',
          instruction: 'Select TRUE, FALSE, or NOT GIVEN.',
          helpGuide: 'Choose TRUE if the statement agrees with the text, FALSE if it contradicts, or NOT GIVEN if there is no information.',
        },
        {
          id: 'q-3',
          questionNumber: 3,
          type: 'yes_no_ng',
          prompt: "3. Marine scientists predicted coral bleaching events decades before they occurred.",
          options: ['YES', 'NO', 'NOT GIVEN'],
          correctAnswer: 'NOT GIVEN',
          instruction: 'Select YES, NO, or NOT GIVEN.',
          helpGuide: 'Choose YES if the statement agrees with the writer claims, NO if it contradicts, or NOT GIVEN if impossible to tell.',
        },
        {
          id: 'q-5',
          questionNumber: 4,
          type: 'sentence_completion',
          prompt: '4. When ocean waters exceed historical maximums, zooxanthellae produce toxic ________.',
          instruction: 'Write NO MORE THAN THREE WORDS from the passage. You can copy text directly from the passage.',
          correctAnswer: 'reactive oxygen species',
          helpGuide: 'Type your answer or select words in the passage and paste them directly into the text box.',
        },
        {
          id: 'q-6',
          questionNumber: 5,
          type: 'short_answer',
          prompt: '5. What process turns corals white when polyps expel algae?',
          instruction: 'Write NO MORE THAN TWO WORDS from the passage.',
          correctAnswer: 'coral bleaching',
          helpGuide: 'Write your answer in the box.',
        },
      ],
    },
  ],
  listeningAudioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c2680a424e.mp3?filename=ambient-piano-amp-strings-10711.mp3',
  listening: [
    {
      id: 'lis-1',
      title: 'Section 1: Student Accommodation Inquiry',
      duration: 180,
      questions: [
        {
          id: 'q-l1',
          questionNumber: 1,
          type: 'text-input',
          prompt: '1. Preferred type of accommodation:',
          correctAnswer: 'studio apartment',
        },
      ],
    },
  ],
  writing: [
    {
      id: 'wrt-1',
      taskNumber: 1,
      title: 'Task 1: Academic Data Analysis',
      prompt: 'The chart below shows the proportion of energy generated from renewable sources...',
      minWords: 150,
      recommendedTime: 20,
    },
    {
      id: 'wrt-2',
      taskNumber: 2,
      title: 'Task 2: Essay Prompt',
      prompt: 'Discuss both views and give your own opinion...',
      minWords: 250,
      recommendedTime: 40,
    },
  ],
  speaking: [
    {
      id: 'spk-1',
      partNumber: 1,
      topic: 'Introduction & Hometown',
      prompts: ['Could you tell me your full name?'],
    },
  ],
};

export const MOCK_TESTS_CATALOG: Test[] = [MOCK_IELTS_TEST];
