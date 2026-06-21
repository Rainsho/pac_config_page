import { NextRequest, NextResponse } from 'next/server';
import { resolve, relative, join, basename } from 'path';
import { existsSync } from 'fs';
import { rename, rm } from 'fs/promises';
import { paths } from '@/lib/constants-node';
import { getAllFiles, ensureDevDirs } from '@/lib/fs-service';
import { syncQueue } from '@/lib/db';
import { logError, logInfo, logWarn } from '@/lib/logger';

export async function GET() {
  await ensureDevDirs();
  const files = await getAllFiles(paths.nas);
  return NextResponse.json(files);
}

export async function PUT(request: NextRequest) {
  const { path = '', name } = await request.json();
  const oldFile = resolve(paths.nas, path);

  if (!path || !name || !existsSync(oldFile)) {
    return new NextResponse(null, { status: 204 });
  }

  const target = resolve(oldFile, '..', name);

  if (relative(paths.nas, target).startsWith('..')) {
    logWarn('rename rejected (path traversal):', path, '->', name);
    return NextResponse.json({ error: 'illegal operate' }, { status: 403 });
  }

  try {
    await rename(oldFile, target);
    logInfo('renamed:', oldFile, '->', target);
    return NextResponse.json({ code: 200, desc: 'put done!' });
  } catch (e) {
    logError('rename failed:', { path, name }, e);
    return NextResponse.json({ error: 'rename failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { path = '', purge } = await request.json();

  if (purge) {
    try {
      await rm(paths.nas, { recursive: true });
      await rm(paths.xunlei, { recursive: true });
      await ensureDevDirs();
      const { symlink } = await import('fs/promises');
      await symlink(paths.xunlei, join(paths.nas, paths.symlink), 'dir');
      syncQueue('', {}, true);
      logInfo('purged nas and xunlei directories');
      return NextResponse.json({ code: 200, desc: 'purge done!' });
    } catch (e) {
      logError('purge failed:', e);
      return NextResponse.json({ error: 'purge failed' }, { status: 500 });
    }
  }

  const file = resolve(paths.nas, path);

  if (path && existsSync(file)) {
    try {
      await rm(file, { recursive: true });
      syncQueue(basename(file), {}, true);
      logInfo('deleted:', file);
      return NextResponse.json({ code: 200, desc: 'delete done!' });
    } catch (e) {
      logError('delete failed:', { path }, e);
      return NextResponse.json({ error: 'delete failed' }, { status: 500 });
    }
  }

  return new NextResponse(null, { status: 204 });
}
