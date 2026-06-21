import { resolve, relative, basename } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { existsSync, statSync } from 'fs';
import { rm, mkdir, readdir, stat } from 'fs/promises';
import { paths } from './constants-node';
import { syncQueue } from './db';
import { SSEManager } from './sse';

const { nas: nasDir, bridge: bridgeDir } = paths;

interface FileInfo {
  name: string;
  path: string;
  size: number;
}

export async function getAllFiles(dir: string): Promise<FileInfo[]> {
  const subdirs = (await readdir(dir)).filter((x) => !x.startsWith('.'));
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      const fileStat = await stat(res);
      if (fileStat.isDirectory()) {
        return getAllFiles(res);
      }
      return [{ name: basename(res), path: relative(nasDir, res), size: fileStat.size }];
    }),
  );
  return files.flat();
}

// Persist state
const ftpJobs: { current: { file: string; resolve: () => void } | null; queue: string[] } = {
  current: null,
  queue: [],
};

export function getFtpJobs() {
  return ftpJobs;
}

export async function beforePersist(file: string, sse: SSEManager): Promise<string> {
  const fileName = basename(file);
  const target = resolve(bridgeDir, fileName);

  if (!existsSync(file)) {
    return `${fileName} may not exists`;
  }

  if (ftpJobs.queue.includes(file)) {
    return `${fileName} is in the queue, just wait`;
  }

  if (ftpJobs.current && ftpJobs.current.file === file) {
    return `${fileName} is in the queue, just wait`;
  }

  if (existsSync(target)) {
    sse.emit('done', { id: fileName, file, state: 'done', time: 'NOT SURE' });
    return `${fileName} may already persisted`;
  }

  ftpJobs.queue.push(file);
  syncQueue(fileName, { state: 'enqueue' });

  // Don't await — runs in background
  doPersist(sse);

  return '';
}

async function doPersist(sse: SSEManager): Promise<void> {
  if (ftpJobs.current) return;

  const file = ftpJobs.queue.shift();
  if (!file) return;

  const ftpStatus = new Promise<void>((resolve) => {
    ftpJobs.current = { file, resolve };
  });

  const { size } = statSync(file);
  const input = createReadStream(file);
  const fileName = basename(file);
  const target = resolve(bridgeDir, fileName);
  const output = createWriteStream(target);

  // Emit progress every 10MB transferred
  const T = Math.ceil(size / (10 * 1024 * 1024));
  let doneSize = 0;
  const timer = Date.now();
  let mileStone = Array.from({ length: T }, (_, i) => (i + 1) * (1 / T));

  input.on('data', (buff: string | Buffer) => {
    const len = typeof buff === 'string' ? Buffer.byteLength(buff) : buff.length;
    doneSize += len;
    const percent = doneSize / size;
    const doneStone = mileStone.filter((x) => x > percent);

    if (percent === 1) {
      const s = new Date().toLocaleString();
      syncQueue(fileName, { file, state: 'done', time: s });
      sse.emit('done', { id: fileName, file, state: 'done', time: s });
    }

    if (mileStone.length > doneStone.length) {
      mileStone = doneStone;
      const cost = Date.now() - timer;
      const s = new Date().toLocaleString();
      sse.emit('progress', { s, file: fileName, percent, cost });
    }
  });

  input.on('end', () => {
    ftpJobs.current?.resolve();
  });

  input.on('error', () => {
    ftpJobs.current?.resolve();
  });

  syncQueue(fileName, {
    file,
    state: 'uploading',
    cancel: async () => {
      input.destroy();
      ftpJobs.current?.resolve();
      await rm(target).catch(() => {});
    },
  });

  input.pipe(output);
  await ftpStatus;
  ftpJobs.current = null;
  doPersist(sse);
}

// Ensure dev directories exist
export async function ensureDevDirs(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    for (const d of [nasDir, bridgeDir, paths.xunlei, paths.raind]) {
      await mkdir(d, { recursive: true });
    }
  }
}
