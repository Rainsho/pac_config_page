import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { constants } from '@/lib/constants';
import { logInfo, logWarn } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

  if (code !== constants.jwtCode) {
    logWarn('auth failed (wrong code) from:', ip);
    return NextResponse.json({ error: 'Wrong code!!!' }, { status: 403 });
  }

  const token = await signToken(ip);
  logInfo('auth success from:', ip);

  const response = NextResponse.json({ ip, token });
  response.cookies.set(constants.jwtCookie, token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
