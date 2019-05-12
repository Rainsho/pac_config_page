const { db } = require('../constants');
const sync = require('../schedules/sync');

module.exports = {
  'GET /sd/info': async ctx => {
    const { all } = ctx.request.query;

    if (all) {
      const data = await sync();
      ctx.body = data;
    } else {
      ctx.body = db;
    }
  },
};
