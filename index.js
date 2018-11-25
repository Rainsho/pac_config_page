const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const serve = require('koa-static');
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
app.use(serve('views', { index: 'pac.html' }));

app.listen(3000);

console.log('app started at port 3000...');
