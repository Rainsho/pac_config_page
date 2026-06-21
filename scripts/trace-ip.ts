import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const DB_PATH = resolve(process.cwd(), '_db.json');
const URLS = ['http://v6r.ipip.net/'];
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36';

async function main() {
  const s = new Date().toLocaleString();
  console.log(s, 'doing traceMe');

  let db: { last: string[]; ips: { s: string; t: string; i: string }[] } = { last: [], ips: [] };
  try {
    const raw = await readFile(DB_PATH, 'utf-8');
    db = JSON.parse(raw);
  } catch {
    // db file doesn't exist yet
  }

  const last = [...(db.last || [])];

  let ipOrErr: string;
  try {
    const res = await fetch(URLS[0], { headers: { 'User-Agent': UA } });
    ipOrErr = (await res.text()).trim();
  } catch (e: any) {
    ipOrErr = e.code || 'UNKNOWN';
  }

  if (!last.includes(ipOrErr)) {
    last.push(ipOrErr);
    if (last.length > 2) last.shift();

    const t = new Date().toLocaleString();
    db.ips.unshift({ s, t, i: ipOrErr });
    db.last = last;

    await writeFile(DB_PATH, JSON.stringify(db, null, 2));
    console.log(s, 'IP changed:', ipOrErr);
  } else {
    console.log(s, 'IP unchanged:', ipOrErr);
  }
}

main().catch(console.error);
