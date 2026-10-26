import { useSyncExternalStore } from 'react';

export interface Route {
  name: string;
  param?: string;
}

function parse(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  if (!clean) return { name: 'home' };
  const [name, ...rest] = clean.split('/');
  return { name: decodeURIComponent(name), param: rest.length ? decodeURIComponent(rest.join('/')) : undefined };
}

function readHash(): string {
  try {
    return window.location.hash;
  } catch {
    return '';
  }
}

let current: Route = parse(readHash());
const listeners = new Set<() => void>();

window.addEventListener('hashchange', () => {
  const next = parse(readHash());
  if (next.name !== current.name || next.param !== current.param) {
    current = next;
    listeners.forEach((l) => l());
  }
});

export function navigate(name: string, param?: string) {
  current = { name, param };
  try {
    const hash = '#/' + encodeURIComponent(name) + (param ? '/' + encodeURIComponent(param) : '');
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  } catch {
    /* frames that block history still route in memory */
  }
  listeners.forEach((l) => l());
  try {
    window.scrollTo({ top: 0 });
  } catch {
    /* ignore */
  }
}

window.addEventListener('popstate', () => {
  current = parse(readHash());
  listeners.forEach((l) => l());
});

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}
