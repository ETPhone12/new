import type { AppState, CourseModule, KicaCat, StrandId } from '../types';
import { LESSONS } from '../data/lessons';
import { MODULES } from '../data/curriculum';

export function nextLesson(s: AppState) {
  return LESSONS.find((l) => !s.lessons[l.id]) ?? null;
}

export function moduleProgress(s: AppState, m: CourseModule) {
  const done = m.lessonIds.filter((id) => s.lessons[id]).length;
  return { done, total: m.lessonIds.length };
}

export function milestoneAssessments(s: AppState, id: string) {
  return s.assessments.filter((a) => a.source === id);
}

export function lessonsDone(s: AppState) {
  return LESSONS.filter((l) => s.lessons[l.id]).length;
}

/** Best score across tool runs whose key starts with `prefix` ("drills" matches "drills:rhetoric"). */
export function toolBest(s: AppState, prefix: string): number | undefined {
  let best: number | undefined;
  for (const [k, v] of Object.entries(s.toolRuns)) {
    if (k === prefix || k.startsWith(prefix + ':')) best = Math.max(best ?? 0, v.best);
  }
  return best;
}

export function reflectionCounts(s: AppState): Record<StrandId, number> {
  const out: Record<StrandId, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const r of s.reflections) out[r.strand]++;
  return out;
}

const SUGGEST: Record<string, Partial<Record<KicaCat, string[]>>> = {
  pt1: { K: ['graphic'], T: ['graphic', 'reader'], C: ['procedure'], A: ['procedure'] },
  pt2: { K: ['drills:rhetoric'], T: ['drills:fallacies'], C: ['linter'], A: ['ppe'] },
  pt3: { K: ['listening'], T: ['listening'], C: ['speech'], A: ['speech'] },
  pt4: { K: ['hotspot'], T: ['hotspot'], C: ['photo'], A: ['photo'] },
  final: { K: ['exam'], T: ['compare'], C: ['linter'], A: ['ppe'] },
};

/** Starting levels for a portfolio self-assessment, taken from what the practice tools measured. */
export function suggestedScores(s: AppState, milestoneId: string): Partial<Record<KicaCat, number>> {
  const map = SUGGEST[milestoneId];
  const out: Partial<Record<KicaCat, number>> = {};
  if (!map) return out;
  for (const k of Object.keys(map) as KicaCat[]) {
    const vals = (map[k] ?? []).map((p) => toolBest(s, p)).filter((v): v is number => v !== undefined);
    if (vals.length) out[k] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  return out;
}

export function moduleOfLesson(lessonId: string) {
  return MODULES.find((m) => m.lessonIds.includes(lessonId))!;
}

/* ---------- daily streak ---------- */

function localDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Every local date with some learning activity. */
export function activityDays(s: AppState): Set<string> {
  const stamps = [
    ...Object.values(s.lessons).map((l) => l.at),
    ...s.reflections.map((r) => r.at),
    ...s.assessments.filter((a) => a.source !== 'manual').map((a) => a.at),
    ...Object.values(s.toolRuns).map((t) => t.at),
    ...s.speech.map((x) => x.at),
    ...s.exams.map((e) => e.startedAt),
  ];
  return new Set(stamps.map(localDay).filter(Boolean));
}

export function streak(s: AppState, now = new Date()) {
  const days = activityDays(s);
  const key = (d: Date) => localDay(d.toISOString());
  const today = key(now);
  const cursor = new Date(now);
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(key(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const week: { label: string; active: boolean; today: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    week.push({ label: d.toLocaleDateString('en-CA', { weekday: 'narrow' }), active: days.has(key(d)), today: i === 0 });
  }
  return { count, activeToday: days.has(today), week };
}

/** True when something dated `iso` happened on the local calendar day of `now`. */
export function isToday(iso: string | undefined, now = new Date()): boolean {
  return !!iso && localDay(iso) === localDay(now.toISOString());
}
