const fs = require('fs-extra');
const path = require('path');
const { db } = require('../constants');

const _bak = path.resolve(__dirname, '../constants/_bak.json');

async function sync() {
  console.log('doing sync');

  const old = await fs.readJson(_bak);
  const data = Object.assign({}, old, db);

  await fs.writeJson(_bak, data, { spaces: '  ' });
}

module.exports = sync;
