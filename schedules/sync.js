const fs = require('fs-extra');
const path = require('path');
const { db, bakFile } = require('../constants');
const { now } = require('../utils');

async function sync() {
  console.log(now(), 'doing sync');

  const old = await fs.readJson(bakFile);
  const data = Object.assign({}, old, db);

  await fs.writeJson(bakFile, data, { spaces: '  ' });

  return data;
}

module.exports = sync;
