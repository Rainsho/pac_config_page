import { NextRequest, NextResponse } from 'next/server';
import { resolve } from 'path';
import { paths } from '@/lib/constants-node';
import { beforePersist } from '@/lib/fs-service';
import { sseManager } from '@/lib/sse';
import { logInfo } from '@/lib/logger';

export async function PUT(request: NextRequest) {
  const { path = '' } = await request.json();
  const file = resolve(paths.nas, path);
  const desc = await beforePersist(file, sseManager);

  if (desc) {
    logInfo('persist skipped:', file, desc);
  } else {
    logInfo('persist enqueued:', file);
  }

  return NextResponse.json({ code: 200, desc });
}

export async function DELETE(request: NextRequest) {
  const { fileName = '' } = await request.json();
  const { getQueue, syncQueue } = await import('@/lib/db');
  const queue = getQueue();
  const info = queue.find((x) => x.id === fileName);

  if (info && typeof info.cancel === 'function') {
    await info.cancel();
    syncQueue(fileName, {}, true);
    logInfo('persist cancelled:', fileName);
    return NextResponse.json({ code: 200, desc: 'done' });
  }

  return new NextResponse(null, { status: 204 });
}
