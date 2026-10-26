import { useSyncExternalStore } from 'react';
import type { StrandId } from '../types';

export interface ReflectionRequest {
  strand: StrandId;
  task: string;
  onDone?: () => void;
}

interface UiState {
  reflection: ReflectionRequest | null;
  toast: { id: number; text: string } | null;
  drawerOpen: boolean;
}

let ui: UiState = { reflection: null, toast: null, drawerOpen: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useUi(): UiState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => ui,
    () => ui,
  );
}

/** Opens the 60-second reflection log for a finished task. */
export function requestReflection(r: ReflectionRequest) {
  ui = { ...ui, reflection: r };
  emit();
}

export function closeReflection() {
  ui = { ...ui, reflection: null };
  emit();
}

let toastTimer: number | undefined;
export function toast(text: string) {
  window.clearTimeout(toastTimer);
  ui = { ...ui, toast: { id: Date.now(), text } };
  emit();
  toastTimer = window.setTimeout(() => {
    ui = { ...ui, toast: null };
    emit();
  }, 2600);
}

export function setDrawer(open: boolean) {
  ui = { ...ui, drawerOpen: open };
  emit();
}
