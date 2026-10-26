import type { Assessment, KicaCat, TermMethod } from '../types';

export const KICA: { id: KicaCat; name: string; short: string; looksFor: string }[] = [
  { id: 'K', name: 'Knowledge & Understanding', short: 'K/U', looksFor: 'Knowing literary and media terms (ethos, juxtaposition, bias, target audience) and understanding what a text literally says.' },
  { id: 'T', name: 'Thinking / Inquiry', short: 'T/I', looksFor: 'Planning and outlining, drawing inferences, judging source credibility, and building logical arguments.' },
  { id: 'C', name: 'Communication', short: 'C', looksFor: 'Clarity, precision, flow, organization (PPE paragraphs), vocabulary, tone for the audience, and conventions (grammar, MLA/APA).' },
  { id: 'A', name: 'Application', short: 'A', looksFor: 'Transferring skills to new contexts, such as using camera-angle theory in your own photo essay or linking a theme to real events.' },
];

export const KICA_IDS: KicaCat[] = ['K', 'T', 'C', 'A'];

/** Ontario achievement levels with the percentage commonly used for each mark. */
export const LEVEL_MARKS: { code: string; pct: number }[] = [
  { code: '4+', pct: 95 },
  { code: '4', pct: 88 },
  { code: '4-', pct: 82 },
  { code: '3+', pct: 78 },
  { code: '3', pct: 75 },
  { code: '3-', pct: 71 },
  { code: '2+', pct: 68 },
  { code: '2', pct: 65 },
  { code: '2-', pct: 61 },
  { code: '1+', pct: 58 },
  { code: '1', pct: 55 },
  { code: '1-', pct: 51 },
  { code: 'R', pct: 40 },
];

export interface LevelInfo {
  level: '4' | '3' | '2' | '1' | 'R';
  label: string;
  range: string;
}

export function levelFromPercent(p: number): LevelInfo {
  if (p >= 80) return { level: '4', label: 'Level 4', range: '80–100%' };
  if (p >= 70) return { level: '3', label: 'Level 3 (provincial standard)', range: '70–79%' };
  if (p >= 60) return { level: '2', label: 'Level 2', range: '60–69%' };
  if (p >= 50) return { level: '1', label: 'Level 1', range: '50–59%' };
  return { level: 'R', label: 'Below Level 1', range: 'under 50%' };
}

const CODE_BANDS: [number, string][] = [
  [92, '4+'], [85, '4'], [80, '4-'],
  [77, '3+'], [73, '3'], [70, '3-'],
  [67, '2+'], [63, '2'], [60, '2-'],
  [57, '1+'], [53, '1'], [50, '1-'],
];

/** Finer code such as "3+" for a percentage, for display next to a mark. */
export function levelCode(p: number): string {
  for (const [min, code] of CODE_BANDS) if (p >= min) return code;
  return 'R';
}

/** Weighted KICA average over the categories that were actually scored. */
export function kicaOverall(scores: Partial<Record<KicaCat, number>>, weights: Record<KicaCat, number>): number | null {
  let total = 0;
  let wsum = 0;
  for (const k of KICA_IDS) {
    const v = scores[k];
    if (typeof v === 'number' && Number.isFinite(v)) {
      const w = Math.max(0, weights[k] ?? 0);
      total += v * w;
      wsum += w;
    }
  }
  if (wsum === 0) return null;
  return total / wsum;
}

/**
 * Term mark from a date-ordered list of overall marks.
 * - average: plain mean
 * - recent: later work counts more (weights rise linearly from 1 to 2)
 * - median: the most consistent level of achievement
 */
export function termMark(marks: number[], method: TermMethod): number | null {
  const n = marks.length;
  if (n === 0) return null;
  if (method === 'average') return marks.reduce((a, b) => a + b, 0) / n;
  if (method === 'median') {
    const s = marks.slice().sort((a, b) => a - b);
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  if (n === 1) return marks[0];
  let total = 0;
  let wsum = 0;
  marks.forEach((m, i) => {
    const w = 1 + i / (n - 1);
    total += m * w;
    wsum += w;
  });
  return total / wsum;
}

export interface GradeSummary {
  term: number | null;
  culminating: number | null;
  exam: number | null;
  /** Final grade using only the parts that exist, re-weighted to 100%. */
  current: number | null;
  /** Share of the final grade (0-100) that has marks so far. */
  coverage: number;
  /** Average needed on the missing parts to reach `target`, or null if nothing is missing. */
  neededForTarget: number | null;
  categoryAverages: Record<KicaCat, number | null>;
}

function avg(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export function summarize(
  assessments: Assessment[],
  weights: Record<KicaCat, number>,
  split: { culminating: number; exam: number },
  method: TermMethod,
  target: number,
): GradeSummary {
  const sorted = assessments.slice().sort((a, b) => a.at.localeCompare(b.at));
  const overall = (a: Assessment) => kicaOverall(a.scores, weights);
  const pick = (kind: Assessment['kind']) =>
    sorted.filter((a) => a.kind === kind).map(overall).filter((x): x is number => x !== null);

  const term = termMark(pick('term'), method);
  const culminating = avg(pick('culminating'));
  const exam = avg(pick('exam'));

  const termWeight = Math.max(0, 100 - split.culminating - split.exam);
  const parts: { w: number; v: number | null }[] = [
    { w: termWeight, v: term },
    { w: split.culminating, v: culminating },
    { w: split.exam, v: exam },
  ];
  let have = 0;
  let wHave = 0;
  let wMissing = 0;
  for (const p of parts) {
    if (p.w <= 0) continue;
    if (p.v === null) wMissing += p.w;
    else {
      have += p.v * p.w;
      wHave += p.w;
    }
  }
  const current = wHave > 0 ? have / wHave : null;
  const neededForTarget = wMissing > 0 ? (target * (wHave + wMissing) - have) / wMissing : null;

  const categoryAverages = {} as Record<KicaCat, number | null>;
  for (const k of KICA_IDS) {
    categoryAverages[k] = avg(sorted.map((a) => a.scores[k]).filter((x): x is number => typeof x === 'number'));
  }

  return {
    term,
    culminating,
    exam,
    current,
    coverage: wHave,
    neededForTarget,
    categoryAverages,
  };
}
