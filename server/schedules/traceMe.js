const fetch = require('node-fetch');
const { now, db } = require('../utils');

const urls = [
  'http://ifconfig.me/ip',
  'https://api.ipify.org/',
  'https://rainsho.cc/ip',
];
const ua =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36';

function traceMe() {
  const s = now();
  const last = [].concat(db.last);

  console.log(s, 'doing traceMe');

  Promise.race(urls.map((url) => fetch(url, { headers: { 'User-Agent': ua } })))
    .then((x) => x.text())
    .then((res) => res.trim())
    .catch((e) => e.code)
    .then((ipOrErr) => {
      if (!last.includes(ipOrErr)) {
        last.push(ipOrErr);

        // keep two recently values
        if (last.length > 2) last.shift();

        db.ips.unshift({ s, t: now(), i: ipOrErr });
        db.last = last;
      }
    });
}

if (require.main === module) {
  traceMe();
}

module.exports = traceMe;
