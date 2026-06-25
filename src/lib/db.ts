import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const DB_PATH =
  process.env.NODE_ENV === 'production'
    ? resolve(process.cwd(), '../..', '_db.json')
    : resolve(process.cwd(), '_db.json');

export interface IpRecord {
  s: string;
  t: string;
  i: string;
}

export interface QueueItem {
  id: string;
  file?: string;
  state: 'enqueue' | 'uploading' | 'done';
  time?: string;
  cancel?: () => Promise<void>;
}

interface DB {
  last: string[];
  queue: QueueItem[];
  ips: IpRecord[];
}

interface DBStore {
  db: DB;
  dirty: boolean;
  saveTimer: ReturnType<typeof setTimeout> | null;
  loaded: boolean;
}

// Next.js standalone bundles instrumentation and route handlers into separate
// module scopes, so module-level variables become isolated copies. Hoist the
// mutable state onto globalThis so every bundle shares the same instance.
const g = globalThis as typeof globalThis & { __pac_db_store?: DBStore };

function store(): DBStore {
  if (!g.__pac_db_store) {
    g.__pac_db_store = {
      db: { last: [], queue: [], ips: [] },
      dirty: false,
      saveTimer: null,
      loaded: false,
    };
  }
  return g.__pac_db_store;
}

export async function loadDB(): Promise<void> {
  const s = store();
  if (s.loaded) return;
  try {
    const raw = await readFile(DB_PATH, 'utf-8');
    s.db = JSON.parse(raw);
  } catch {
    s.db = { last: [], queue: [], ips: [] };
  }
  s.loaded = true;
}

function markDirty(): void {
  const s = store();
  s.dirty = true;
  if (s.saveTimer) clearTimeout(s.saveTimer);
  s.saveTimer = setTimeout(() => flushDB(), 100);
}

async function flushDB(): Promise<void> {
  const s = store();
  if (!s.dirty) return;
  await writeFile(DB_PATH, JSON.stringify(s.db, null, 2));
  s.dirty = false;
}

export function getDB(): DB {
  return store().db;
}

export function getQueue(): QueueItem[] {
  return store().db.queue;
}

export function setQueue(queue: QueueItem[]): void {
  store().db.queue = queue;
  markDirty();
}

export function syncQueue(id: string, info: Partial<QueueItem> = {}, purge = false): QueueItem[] {
  const db = store().db;
  if (purge) {
    db.queue = db.queue.filter((x) => x.id !== id);
  } else {
    const old = db.queue.find((x) => x.id === id);
    if (!old) {
      db.queue.push({ id, ...info } as QueueItem);
    } else {
      Object.assign(old, info);
    }
  }
  markDirty();
  return db.queue;
}

export function getIps(): IpRecord[] {
  return store().db.ips;
}

export function addIp(record: IpRecord): void {
  store().db.ips.unshift(record);
  markDirty();
}

export function getLast(): string[] {
  return store().db.last;
}

export function setLast(last: string[]): void {
  store().db.last = last;
  markDirty();
}

// Load on import
loadDB();
