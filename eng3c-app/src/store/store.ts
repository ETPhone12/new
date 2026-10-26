import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { AppState, Assessment, ExamAttempt, LessonProgress, Reflection, Settings, SpeechSession } from '../types';
import { uid } from '../lib/util';

const KEY = 'eng3c-studio:v1';

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  course: 'ENG3C',
  theme: 'system',
  weights: { K: 20, T: 30, C: 30, A: 20 },
  finalSplit: { culminating: 15, exam: 15 },
  target: 65,
  termMethod: 'recent',
};

export function freshState(): AppState {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS, weights: { ...DEFAULT_SETTINGS.weights }, finalSplit: { ...DEFAULT_SETTINGS.finalSplit } },
    lessons: {},
    reflections: [],
    assessments: [],
    speech: [],
    exams: [],
    toolRuns: {},
    drafts: {},
  };
}

/** Accepts anything parsed from storage or an import and returns a safe AppState. */
export function normalizeState(raw: unknown): AppState {
  const base = freshState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppState>;
  const settings = { ...base.settings, ...(r.settings ?? {}) } as Settings;
  settings.weights = { ...base.settings.weights, ...(r.settings?.weights ?? {}) };
  settings.finalSplit = { ...base.settings.finalSplit, ...(r.settings?.finalSplit ?? {}) };
  return {
    version: 1,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : base.createdAt,
    settings,
    lessons: r.lessons && typeof r.lessons === 'object' ? r.lessons : {},
    reflections: Array.isArray(r.reflections) ? r.reflections : [],
    assessments: Array.isArray(r.assessments) ? r.assessments : [],
    speech: Array.isArray(r.speech) ? r.speech : [],
    exams: Array.isArray(r.exams) ? r.exams : [],
    toolRuns: r.toolRuns && typeof r.toolRuns === 'object' ? r.toolRuns : {},
    drafts: r.drafts && typeof r.drafts === 'object' ? r.drafts : {},
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  return freshState();
}

let state: AppState = load();
let storageOk = true;
const listeners = new Set<() => void>();
let saveTimer: number | undefined;

function persist() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      storageOk = true;
    } catch {
      storageOk = false;
    }
  }, 250);
}

export function isStorageOk() {
  return storageOk;
}

export function getState(): AppState {
  return state;
}

export function setState(update: (s: AppState) => AppState) {
  state = update(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useApp(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

/* ---------- actions ---------- */

export function completeLesson(id: string, p: Omit<LessonProgress, 'at'>) {
  setState((s) => ({ ...s, lessons: { ...s.lessons, [id]: { ...p, at: new Date().toISOString() } } }));
}

export function uncompleteLesson(id: string) {
  setState((s) => {
    const lessons = { ...s.lessons };
    delete lessons[id];
    return { ...s, lessons };
  });
}

export function addReflection(r: Omit<Reflection, 'id' | 'at'>) {
  setState((s) => ({ ...s, reflections: [{ ...r, id: uid(), at: new Date().toISOString() }, ...s.reflections] }));
}

export function deleteReflection(id: string) {
  setState((s) => ({ ...s, reflections: s.reflections.filter((r) => r.id !== id) }));
}

export function addAssessment(a: Omit<Assessment, 'id' | 'at'> & { at?: string }) {
  setState((s) => ({
    ...s,
    assessments: [...s.assessments, { ...a, id: uid(), at: a.at ?? new Date().toISOString() }].sort((x, y) => x.at.localeCompare(y.at)),
  }));
}

export function deleteAssessment(id: string) {
  setState((s) => ({ ...s, assessments: s.assessments.filter((a) => a.id !== id) }));
}

export function addSpeechSession(sess: Omit<SpeechSession, 'id' | 'at'>) {
  setState((s) => ({ ...s, speech: [{ ...sess, id: uid(), at: new Date().toISOString() }, ...s.speech].slice(0, 50) }));
}

export function saveExam(attempt: ExamAttempt) {
  setState((s) => {
    const others = s.exams.filter((e) => e.id !== attempt.id);
    return { ...s, exams: [attempt, ...others].slice(0, 20) };
  });
}

export function recordToolRun(tool: string, score: number) {
  setState((s) => {
    const prev = s.toolRuns[tool];
    return {
      ...s,
      toolRuns: {
        ...s.toolRuns,
        [tool]: {
          runs: (prev?.runs ?? 0) + 1,
          best: Math.max(prev?.best ?? 0, score),
          last: score,
          at: new Date().toISOString(),
        },
      },
    };
  });
}

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function replaceState(next: AppState) {
  setState(() => next);
}

export function setDraft(key: string, value: unknown) {
  setState((s) => ({ ...s, drafts: { ...s.drafts, [key]: value } }));
}

/**
 * A piece of tool state that survives reloads. Updates render immediately
 * and are written to the store after a short pause in typing.
 */
export function useDraft<T>(key: string, initial: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    const saved = getState().drafts[key];
    if (saved !== undefined) return saved as T;
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  });
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => () => {
    window.clearTimeout(timer.current);
    setDraft(key, latest.current);
  }, [key]);

  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setDraft(key, next), 400);
        return next;
      });
    },
    [key],
  );
  return [value, update];
}
