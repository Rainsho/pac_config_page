const fetch = require('node-fetch');
const { db } = require('../constants');

const urls = ['http://ifconfig.me/ip', 'https://api.ipify.org/'];
// prettier-ignore
const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36';

function traceMe() {
  console.log('doing traceMe');

  const now = new Date().toLocaleString();
  const last = db.last || '';

  Promise.race(urls.map(url => fetch(url, { headers: { 'User-Agent': ua } })))
    .then(x => x.text())
    .then(res => {
      const ip = res.trim();

      if (last !== ip) {
        db.last = ip;
        db[now] = `${now}\t${new Date().toLocaleString()}\t${ip}`;
      }
    })
    .catch(e => {
      if (last !== e.code) {
        db.last = e.code;
        db[now] = `${now}\t${new Date().toLocaleString()}\t${e.code}`;
      }
    });
}

module.exports = traceMe;
