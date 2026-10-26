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
  /** Bumped to fire a confetti burst. */
  confetti: number;
  /** Sticker ids waiting to be shown in the "sticker earned" pop-up. */
  stickerQueue: string[];
}

let ui: UiState = { reflection: null, toast: null, drawerOpen: false, confetti: 0, stickerQueue: [] };
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

/** A short confetti burst for finished lessons and new stickers. */
export function celebrate() {
  ui = { ...ui, confetti: ui.confetti + 1 };
  emit();
}

export function queueStickers(ids: string[]) {
  if (!ids.length) return;
  ui = { ...ui, stickerQueue: [...ui.stickerQueue, ...ids.filter((id) => !ui.stickerQueue.includes(id))] };
  emit();
  celebrate();
}

export function shiftSticker() {
  ui = { ...ui, stickerQueue: ui.stickerQueue.slice(1) };
  emit();
}
