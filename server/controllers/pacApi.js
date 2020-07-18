const fs = require('fs-extra');
const ping = require('ping');

module.exports = {
  'GET /pac/ping': async (ctx, next) => {
    ctx.body = 'todo';
  },
};
