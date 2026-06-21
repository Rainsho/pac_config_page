const { resolve } = require('path');
const fs = require('fs-extra');

const dbFile = resolve(__dirname, '../_db.json');
let _db = { last: [], queue: [], ips: [] };
let syncTime = Date.now();

if (fs.existsSync(dbFile)) {
  _db = fs.readJsonSync(dbFile, {}, { spaces: 2 });
}

function syncDB(wait = 10 * 1000) {
  const now = Date.now();

  if (now - syncTime > wait) {
    fs.writeJson(dbFile, _db, { spaces: 2 });
    syncTime = now;
  }
}

const db = new Proxy(_db, {
  get: (target, propKey) => {
    if (propKey === 'save') {
      syncDB(100);
      return () => true;
    }

    return target[propKey];
  },
  set: (target, propKey, value) => {
    target[propKey] = value;
    syncDB();

    return true;
  },
});

module.exports = { db };
