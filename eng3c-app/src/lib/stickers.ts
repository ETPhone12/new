import {
  Bell,
  BookOpenCheck,
  Camera,
  ClipboardCheck,
  ClipboardList,
  Compass,
  Eye,
  Gauge,
  GraduationCap,
  Highlighter,
  Library,
  Lightbulb,
  Megaphone,
  Mic,
  Rocket,
  Scale,
  SpellCheck,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import type { AppState } from '../types';
import { MODULES } from '../data/curriculum';
import { toolBest } from './progress';

export interface Sticker {
  id: string;
  title: string;
  how: string;
  icon: LucideIcon;
  /** Tailwind background class for the sticker face. */
  color: string;
  earned: (s: AppState) => boolean;
}

const lessonsDone = (s: AppState) => Object.keys(s.lessons).length;
const moduleDone = (s: AppState, id: string) => MODULES.find((m) => m.id === id)!.lessonIds.every((l) => s.lessons[l]);

export const STICKERS: Sticker[] = [
  { id: 'first-bell', title: 'First Bell', how: 'Finish your first lesson.', icon: Bell, color: 'bg-sun', earned: (s) => lessonsDone(s) >= 1 },
  { id: 'on-a-roll', title: 'On a Roll', how: 'Finish 5 lessons.', icon: Rocket, color: 'bg-primary', earned: (s) => lessonsDone(s) >= 5 },
  { id: 'honour-roll', title: 'Honour Roll', how: 'Finish all 20 lessons.', icon: GraduationCap, color: 'bg-good', earned: (s) => lessonsDone(s) >= 20 },
  { id: 'm1', title: 'Precision Pro', how: 'Finish Module 1.', icon: ClipboardList, color: 'bg-mod1', earned: (s) => moduleDone(s, 'm1') },
  { id: 'm2', title: 'Persuader', how: 'Finish Module 2.', icon: Megaphone, color: 'bg-mod2', earned: (s) => moduleDone(s, 'm2') },
  { id: 'm3', title: 'Mic Drop', how: 'Finish Module 3.', icon: Mic, color: 'bg-mod3', earned: (s) => moduleDone(s, 'm3') },
  { id: 'm4', title: 'Media Detective', how: 'Finish Module 4.', icon: Camera, color: 'bg-mod4', earned: (s) => moduleDone(s, 'm4') },
  { id: 'm5', title: 'Comparison Champ', how: 'Finish Module 5.', icon: Scale, color: 'bg-mod5', earned: (s) => moduleDone(s, 'm5') },
  { id: 'deep-thinker', title: 'Deep Thinker', how: 'Log your first 60-second reflection.', icon: Lightbulb, color: 'bg-pen', earned: (s) => s.reflections.length >= 1 },
  { id: 'full-circle', title: 'Full Circle', how: 'Reflect in all four strands (A3, B4, C4, D4).', icon: Compass, color: 'bg-strandD', earned: (s) => new Set(s.reflections.map((r) => r.strand)).size === 4 },
  { id: 'highlighter-hero', title: 'Highlighter Hero', how: 'Score 80% or more in the Text Deconstructor.', icon: Highlighter, color: 'bg-strandB', earned: (s) => (toolBest(s, 'reader') ?? 0) >= 80 },
  { id: 'red-pen-ready', title: 'Red Pen Ready', how: 'Log a Precision Linter score of 90 or more.', icon: SpellCheck, color: 'bg-strandC', earned: (s) => (toolBest(s, 'linter') ?? 0) >= 90 },
  { id: 'in-the-zone', title: 'In the Zone', how: 'Save a speech between 130 and 150 words per minute.', icon: Gauge, color: 'bg-strandA', earned: (s) => s.speech.some((x) => x.wpm >= 130 && x.wpm <= 150) },
  { id: 'sharp-eye', title: 'Sharp Eye', how: 'Score 100% on an ad or PSA analysis.', icon: Eye, color: 'bg-mod4', earned: (s) => (toolBest(s, 'hotspot') ?? 0) >= 100 },
  { id: 'self-assessor', title: 'Self-Assessor', how: 'Save your first KICA self-assessment.', icon: ClipboardCheck, color: 'bg-sun', earned: (s) => s.assessments.some((a) => a.source !== 'manual') },
  { id: 'exam-ready', title: 'Exam Ready', how: 'Finish a mock final exam.', icon: Timer, color: 'bg-primary', earned: (s) => s.exams.some((e) => e.finishedAt) },
  { id: 'word-wall', title: 'Word Wall Wizard', how: 'Mark 50 Word Wall terms as known.', icon: Library, color: 'bg-mod1', earned: (s) => ((s.drafts['glossary:known'] as string[] | undefined)?.length ?? 0) >= 50 },
  { id: 'bookworm', title: 'Bookworm', how: 'Finish all three Text Deconstructor passages.', icon: BookOpenCheck, color: 'bg-mod5', earned: (s) => ['phones', 'transit', 'hydrate'].every((p) => s.toolRuns[`reader:${p}`]) },
];

export function earnedStickers(s: AppState): Sticker[] {
  return STICKERS.filter((x) => x.earned(s));
}
