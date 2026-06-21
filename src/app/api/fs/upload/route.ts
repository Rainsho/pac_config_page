import { NextRequest, NextResponse } from 'next/server';
import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import { paths } from '@/lib/constants-node';
import { ensureDevDirs } from '@/lib/fs-service';
import { logError, logInfo } from '@/lib/logger';

export async function POST(request: NextRequest) {
  await ensureDevDirs();

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return new NextResponse(null, { status: 204 });
  }

  const dest = resolve(paths.nas, file.name);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(dest, buffer);
    logInfo('uploaded:', dest, `(${buffer.length} bytes)`);
    return NextResponse.json({ code: 200, desc: `${file.name} done!` });
  } catch (e) {
    logError('upload failed:', file.name, e);
    return NextResponse.json({ error: 'upload failed' }, { status: 500 });
  }
}
