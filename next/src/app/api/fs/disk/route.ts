import { NextResponse } from 'next/server';
import { statfsSync } from 'fs';

export async function GET() {
  const info = statfsSync('/home');
  const total = Number(info.blocks) * Number(info.bsize);
  const available = Number(info.bavail) * Number(info.bsize);

  return NextResponse.json({ available, total });
}
