import { addIp, getLast, setLast } from './db';

const URL = 'http://v6r.ipip.net/';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36';

export async function traceIp(): Promise<void> {
  const s = new Date().toLocaleString();

  let ipOrErr: string;
  try {
    const res = await fetch(URL, { headers: { 'User-Agent': UA } });
    ipOrErr = (await res.text()).trim();
  } catch (e: unknown) {
    ipOrErr = (e as { code?: string })?.code || 'UNKNOWN';
  }

  const last = [...getLast()];
  if (last.includes(ipOrErr)) {
    console.log(s, 'IP unchanged:', ipOrErr);
    return;
  }

  last.push(ipOrErr);
  if (last.length > 2) last.shift();

  const t = new Date().toLocaleString();
  addIp({ s, t, i: ipOrErr });
  setLast(last);
  console.log(s, 'IP changed:', ipOrErr);
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
      traceIp().catch((e) => console.error('traceIp failed:', e));
      tick();
    }, delay);
  };
  tick();
}
