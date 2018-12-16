const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const serve = require('koa-static');
const { resolve } = require('path');
const controller = require('./controller');

const app = new Koa();

// log request URL:
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

// enable cors
app.use(cors());

// parse request body:
app.use(bodyParser());

// add controller:
app.use(controller());

// add static files
app.use(serve(resolve(__dirname, 'views/build')));

// engage socket.io
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

app.context.io = io;
server.listen(3000);

console.log('app started at port 3000...');

// start schedules tasks
require('./schedules');
