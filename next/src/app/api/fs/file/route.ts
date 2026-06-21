import { NextRequest, NextResponse } from 'next/server';
import { resolve, relative, join, basename } from 'path';
import { existsSync } from 'fs';
import { rename, rm } from 'fs/promises';
import { paths } from '@/lib/constants-node';
import { getAllFiles, ensureDevDirs } from '@/lib/fs-service';
import { syncQueue } from '@/lib/db';

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

  // Path traversal protection
  if (relative(paths.nas, target).startsWith('..')) {
    return NextResponse.json({ error: 'illegal operate' }, { status: 403 });
  }

  await rename(oldFile, target);
  return NextResponse.json({ code: 200, desc: 'put done!' });
}

export async function DELETE(request: NextRequest) {
  const { path = '', purge } = await request.json();

  if (purge) {
    await rm(paths.nas, { recursive: true });
    await rm(paths.xunlei, { recursive: true });
    await ensureDevDirs();
    const { symlink } = await import('fs/promises');
    await symlink(paths.xunlei, join(paths.nas, paths.symlink), 'dir');
    syncQueue('', {}, true);
    return NextResponse.json({ code: 200, desc: 'purge done!' });
  }

  const file = resolve(paths.nas, path);

  if (path && existsSync(file)) {
    await rm(file, { recursive: true });
    syncQueue(basename(file), {}, true);
    return NextResponse.json({ code: 200, desc: 'delete done!' });
  }

  return new NextResponse(null, { status: 204 });
}
