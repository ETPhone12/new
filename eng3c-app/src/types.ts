export type StrandId = 'A' | 'B' | 'C' | 'D';
export type KicaCat = 'K' | 'T' | 'C' | 'A';

export type ToolId =
  | 'reader'
  | 'graphic'
  | 'drills'
  | 'ppe'
  | 'compare'
  | 'procedure'
  | 'linter'
  | 'listening'
  | 'speech'
  | 'hotspot'
  | 'photo'
  | 'exam'
  | 'reflections'
  | 'grades'
  | 'glossary'
  | 'blueprint';

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface KeyTerm {
  term: string;
  def: string;
}

export interface LessonSection {
  heading: string;
  body: string[];
}

export interface PracticeLink {
  tool: ToolId;
  label: string;
  /** Optional sub-item to open inside the tool, e.g. a drill set id. */
  param?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  number: number;
  title: string;
  strands: StrandId[];
  expectations: string[];
  tvo?: string;
  minutes: number;
  hook: string;
  sections: LessonSection[];
  keyTerms: KeyTerm[];
  example?: { label: string; text: string };
  quiz: QuizQuestion[];
  practice: PracticeLink[];
}

export interface RubricRow {
  cat: KicaCat;
  criteria: string[];
}

export interface Milestone {
  id: string;
  title: string;
  kind: AssessmentKind;
  summary: string;
  steps: { label: string; tool: ToolId; param?: string }[];
  rubric: RubricRow[];
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  focus: string;
  strands: StrandId[];
  lessonIds: string[];
  milestone: Milestone;
}

export type AssessmentKind = 'term' | 'culminating' | 'exam';

export interface Assessment {
  id: string;
  at: string;
  title: string;
  kind: AssessmentKind;
  source: string;
  scores: Partial<Record<KicaCat, number>>;
  note?: string;
}

export interface Reflection {
  id: string;
  at: string;
  strand: StrandId;
  task: string;
  worked: string;
  trippedUp: string;
  adjustment: string;
  seconds: number;
}

export interface SpeechSession {
  id: string;
  at: string;
  title: string;
  seconds: number;
  words: number;
  wpm: number;
  fillers: number;
  pauses: number;
  longPauses: number;
  method: 'live' | 'upload' | 'estimate';
}

export interface ExamAttempt {
  id: string;
  startedAt: string;
  finishedAt?: string;
  durationMin: number;
  answers: Record<string, number>;
  shortAnswers: Record<string, string>;
  shortScores: Record<string, number>;
  essayPrompt?: string;
  essay: string;
  objectiveScore?: number;
  objectiveTotal?: number;
}

export type ThemePref = 'system' | 'light' | 'dark';
export type TermMethod = 'recent' | 'average' | 'median';

export interface Settings {
  name: string;
  course: 'ENG3C' | 'NBE3C';
  theme: ThemePref;
  weights: Record<KicaCat, number>;
  finalSplit: { culminating: number; exam: number };
  target: number;
  termMethod: TermMethod;
}

export interface LessonProgress {
  at: string;
  quizScore: number;
  quizTotal: number;
}

export interface AppState {
  version: 1;
  createdAt: string;
  settings: Settings;
  lessons: Record<string, LessonProgress>;
  reflections: Reflection[];
  assessments: Assessment[];
  speech: SpeechSession[];
  exams: ExamAttempt[];
  toolRuns: Record<string, { runs: number; best: number; last: number; at: string }>;
  drafts: Record<string, unknown>;
}
