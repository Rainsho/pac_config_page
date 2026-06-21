import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, isLocal } from './lib/auth';

export async function proxy(request: NextRequest) {
  // Bypass GET requests
  if (request.method === 'GET') return NextResponse.next();

  // Bypass /api/auth
  if (request.nextUrl.pathname.startsWith('/api/auth')) return NextResponse.next();

  // Bypass LAN IPs
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  if (isLocal(ip)) return NextResponse.next();

  // Verify JWT from cookie
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
