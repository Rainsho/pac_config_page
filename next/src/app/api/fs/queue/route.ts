import { NextResponse } from 'next/server';
import { getQueue } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getQueue());
}
