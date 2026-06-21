import { NextRequest, NextResponse } from 'next/server';
import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import { paths } from '@/lib/constants-node';
import { ensureDevDirs } from '@/lib/fs-service';

export async function POST(request: NextRequest) {
  await ensureDevDirs();

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return new NextResponse(null, { status: 204 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dest = resolve(paths.nas, file.name);
  await writeFile(dest, buffer);

  return NextResponse.json({ code: 200, desc: `${file.name} done!` });
}
