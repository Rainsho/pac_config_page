import { NextRequest, NextResponse } from 'next/server';
import { relative, join } from 'path';
import { existsSync } from 'fs';
import { rename } from 'fs/promises';
import { paths } from '@/lib/constants-node';

export async function POST(request: NextRequest) {
  const { path = '' } = await request.json();

  if (path.startsWith(paths.symlink)) {
    const src = join(paths.xunlei, path.replace(paths.symlink, ''));
    const dest = join(paths.raind, relative(paths.xunlei, src));

    if (existsSync(dest)) {
      return NextResponse.json({ error: 'file exists' }, { status: 400 });
    }

    await rename(src, dest);
    return NextResponse.json({ code: 200, desc: 'moved' });
  }

  return new NextResponse(null, { status: 204 });
}
