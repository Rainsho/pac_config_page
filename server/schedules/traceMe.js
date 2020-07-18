const fetch = require('node-fetch');
const { db } = require('../constants');
const { now } = require('../utils');

const urls = ['http://ifconfig.me/ip', 'https://api.ipify.org/', 'https://rainsho.cc/ip'];
// prettier-ignore
const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36';

function traceMe() {
  const { t: time, s: timer } = now(false);
  const last = [].concat(db.last);

  console.log(timer, 'doing traceMe');

  Promise.race(urls.map(url => fetch(url, { headers: { 'User-Agent': ua } })))
    .then(x => x.text())
    .then(res => res.trim())
    .catch(e => e.code)
    .then(ipOrErr => {
      if (!last.includes(ipOrErr)) {
        last.push(ipOrErr);

        // keep two recently values
        if (last.length > 2) last.shift();

        db.last = last;
        db[time] = { s: timer, t: now(), i: ipOrErr };
      }
    });
}

module.exports = traceMe;
