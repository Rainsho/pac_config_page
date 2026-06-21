import { SignJWT, jwtVerify } from 'jose';
import { constants } from './constants';

const secret = new TextEncoder().encode(constants.jwtSecret);

export async function signToken(ip: string): Promise<string> {
  return new SignJWT({ ip })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(constants.jwtExpiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ ip: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { ip: string };
  } catch {
    return null;
  }
}

export function isLocal(ip: string): boolean {
  return ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.0.');
}
