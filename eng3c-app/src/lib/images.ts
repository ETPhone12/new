import { useEffect, useState } from 'react';

/** Photos are kept in IndexedDB (localStorage is too small for images). Falls back to memory. */
const DB_NAME = 'eng3c-studio';
const STORE = 'images';
const memory = new Map<string, string>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

const listeners = new Map<string, Set<() => void>>();
function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

export async function putImage(key: string, dataUrl: string) {
  memory.set(key, dataUrl);
  const db = await openDb();
  if (db) {
    await new Promise<void>((res) => {
      try {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(dataUrl, key);
        tx.oncomplete = () => res();
        tx.onerror = () => res();
      } catch {
        res();
      }
    });
  }
  notify(key);
}

export async function getImage(key: string): Promise<string | undefined> {
  if (memory.has(key)) return memory.get(key);
  const db = await openDb();
  if (!db) return undefined;
  return new Promise((res) => {
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      req.onsuccess = () => {
        const v = req.result as string | undefined;
        if (v) memory.set(key, v);
        res(v);
      };
      req.onerror = () => res(undefined);
    } catch {
      res(undefined);
    }
  });
}

export async function deleteImage(key: string) {
  memory.delete(key);
  const db = await openDb();
  if (db) {
    try {
      db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
    } catch {
      /* ignore */
    }
  }
  notify(key);
}

export function useImage(key: string | null | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(key ? memory.get(key) : undefined);
  useEffect(() => {
    if (!key) {
      setUrl(undefined);
      return;
    }
    let alive = true;
    const load = () => getImage(key).then((v) => alive && setUrl(v));
    load();
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(load);
    return () => {
      alive = false;
      listeners.get(key)?.delete(load);
    };
  }, [key]);
  return url;
}

/** Reads a picked photo and shrinks it so storage stays small. */
export function fileToDataUrl(file: File, max = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(src);
        reject(new Error('no canvas'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(src);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error('unreadable image'));
    };
    img.src = src;
  });
}
