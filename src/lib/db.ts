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

let _db: DB = { last: [], queue: [], ips: [] };
let _dirty = false;
let _saveTimer: ReturnType<typeof setTimeout> | null = null;

export async function loadDB(): Promise<void> {
  try {
    const raw = await readFile(DB_PATH, 'utf-8');
    _db = JSON.parse(raw);
  } catch {
    _db = { last: [], queue: [], ips: [] };
  }
}

function markDirty(): void {
  _dirty = true;
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => flushDB(), 100);
}

async function flushDB(): Promise<void> {
  if (!_dirty) return;
  await writeFile(DB_PATH, JSON.stringify(_db, null, 2));
  _dirty = false;
}

export function getDB(): DB {
  return _db;
}

export function getQueue(): QueueItem[] {
  return _db.queue;
}

export function setQueue(queue: QueueItem[]): void {
  _db.queue = queue;
  markDirty();
}

export function syncQueue(id: string, info: Partial<QueueItem> = {}, purge = false): QueueItem[] {
  if (purge) {
    _db.queue = _db.queue.filter((x) => x.id !== id);
  } else {
    const old = _db.queue.find((x) => x.id === id);
    if (!old) {
      _db.queue.push({ id, ...info } as QueueItem);
    } else {
      Object.assign(old, info);
    }
  }
  markDirty();
  return _db.queue;
}

export function getIps(): IpRecord[] {
  return _db.ips;
}

export function addIp(record: IpRecord): void {
  _db.ips.unshift(record);
  markDirty();
}

export function getLast(): string[] {
  return _db.last;
}

export function setLast(last: string[]): void {
  _db.last = last;
  markDirty();
}

// Load on import
loadDB();
