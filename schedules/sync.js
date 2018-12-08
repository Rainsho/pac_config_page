const fs = require('fs-extra');
const path = require('path');
const { db, bakFile } = require('../constants');

async function sync() {
  console.log('doing sync');

  const old = await fs.readJson(bakFile);
  const data = Object.assign({}, old, db);

  await fs.writeJson(bakFile, data, { spaces: '  ' });
}

module.exports = sync;
