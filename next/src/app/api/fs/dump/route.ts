import { NextRequest, NextResponse } from 'next/server';
import { relative, join, dirname } from 'path';
import { existsSync } from 'fs';
import { mkdir, rename } from 'fs/promises';
import { paths } from '@/lib/constants-node';
import { logError, logInfo, logWarn } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const { path = '' } = await request.json();

  if (!path.startsWith(paths.symlink)) {
    return new NextResponse(null, { status: 204 });
  }

  const src = join(paths.xunlei, path.replace(paths.symlink, ''));
  const dest = join(paths.raind, relative(paths.xunlei, src));

  if (existsSync(dest)) {
    logWarn('dump rejected, file exists:', dest);
    return NextResponse.json({ error: 'file exists' }, { status: 400 });
  }

  try {
    await mkdir(dirname(dest), { recursive: true });
    await rename(src, dest);
    logInfo('dump moved:', src, '->', dest);
    return NextResponse.json({ code: 200, desc: 'moved' });
  } catch (e) {
    logError('dump failed:', { path, src, dest }, e);
    return NextResponse.json({ error: 'move failed' }, { status: 500 });
  }
}
