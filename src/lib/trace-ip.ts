import { addIp, getLast, setLast } from './db';
import { logError, logInfo, logWarn } from './logger';

const TAG = '[trace-ip]';
const URL = 'http://myip.ipip.net/';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36';

export async function traceIp(): Promise<void> {
  const s = new Date().toLocaleString();

  let ipOrErr: string;
  try {
    const res = await fetch(URL, { headers: { 'User-Agent': UA } });
    const text = (await res.text()).trim();
    ipOrErr = text.match(/\d+\.\d+\.\d+\.\d+/)?.[0] || text;
  } catch (e: unknown) {
    ipOrErr = (e as { code?: string })?.code || 'UNKNOWN';
    logWarn(TAG, 'fetch failed:', ipOrErr);
  }

  const last = [...getLast()];
  if (last.includes(ipOrErr)) {
    logInfo(TAG, 'unchanged', ipOrErr);
    return;
  }

  last.push(ipOrErr);
  if (last.length > 2) last.shift();

  const t = new Date().toLocaleString();
  addIp({ s, t, i: ipOrErr });
  setLast(last);
  logInfo(TAG, 'changed', ipOrErr);
}

export function startTraceSchedule(): void {
  const tick = () => {
    const now = new Date();
    const m = now.getMinutes();
    const target = m < 20 ? 20 : m < 50 ? 50 : 80;
    const next = new Date(now);
    next.setMinutes(target, 0, 0);
    const delay = next.getTime() - now.getTime();
    setTimeout(() => {
      traceIp().catch((e) => logError(TAG, 'failed:', e));
      tick();
    }, delay);
  };
  logInfo(TAG, 'schedule started');
  tick();
}
