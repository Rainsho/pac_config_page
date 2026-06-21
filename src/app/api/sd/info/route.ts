import { NextRequest, NextResponse } from 'next/server';
import { getIps } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all');

  const ips = getIps();
  if (all === 'true') {
    return NextResponse.json(ips);
  }
  return NextResponse.json(ips.slice(0, 20));
}
