const { db } = require('../utils');

module.exports = {
  'GET /sd/info': async (ctx) => {
    const { all } = ctx.request.query;

    if (all) {
      ctx.body = db.ips;
    } else {
      ctx.body = db.ips.slice(0, 20);
    }
  },
};
