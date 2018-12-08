const fs = require('fs-extra');
const { db, bakFile } = require('../constants');

module.exports = {
  'GET /sd/info': async ctx => {
    const { all } = ctx.request.query;

    if (all) {
      const data = await fs.readJson(bakFile);
      ctx.body = data;
    } else {
      ctx.body = db;
    }
  },
};
