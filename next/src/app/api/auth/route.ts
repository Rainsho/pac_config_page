import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { constants } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (code === constants.jwtCode) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const token = await signToken(ip);

    const response = NextResponse.json({ ip, token });
    response.cookies.set(constants.jwtCookie, token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ error: 'Wrong code!!!' }, { status: 403 });
}
