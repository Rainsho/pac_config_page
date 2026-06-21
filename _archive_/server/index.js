const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const jwt = require('koa-jwt');
const controller = require('./controller');
const { now } = require('./utils');
const { jwtOptions } = require('./constants');
const auth = require('./controllers/auth');

const app = new Koa();

// log request URL:
app.use(async (ctx, next) => {
  const { s, t } = now(false);

  try {
    await next();
  } catch (e) {
    if (e.status === 401) {
      ctx.status = 401;
      ctx.body = 'This operation need Authorization!';
    } else {
      throw e;
    }
  }

  const { method, url, ip, type, length } = ctx.request;

  console.log(s, 'Request from:', ip);
  console.log('  -->', method, url, type, length);
  console.log('  <--', method, url, ctx.status, now(false).t - t, ctx.length);
});

// enable cors
app.use(cors({ credentials: true }));

// parse request body:
app.use(bodyParser());

// enable jwt
app.use(jwt(jwtOptions).unless(auth.BYPASS));

// add controller:
app.use(controller());

// engage socket.io
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

app.proxy = true;
app.context.io = io;
server.listen(3000);

console.log('app started at port 3000...');

// start schedules tasks
require('./schedules');
