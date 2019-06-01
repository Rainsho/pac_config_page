const { sign } = require('jsonwebtoken');
const { jwtOptions, jwtCode } = require('../constants');

const { secret, cookie } = jwtOptions;

function isLocal(ctx) {
  const { ip } = ctx;

  return ip === '::1' || /192\.168\./.exec(ip) || /10\.0\./.exec(ip);
}

module.exports = {
  'POST /auth': async ctx => {
    const { code } = ctx.request.body;

    if (code === jwtCode) {
      const token = sign({ ip: ctx.ip }, secret, { expiresIn: '7d' });

      console.log(code);
      console.log(token);

      ctx.cookies.set(cookie, token);
      ctx.body = { ip: ctx.ip, token };
    } else {
      ctx.status = 401;
      ctx.body = 'Wrong code!!!';
    }
  },

  BYPASS: ctx => {
    return ctx.method === 'GET' || /^\/auth/.exec(ctx.url) || isLocal(ctx);
  },
};
