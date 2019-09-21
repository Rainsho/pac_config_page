const os = require('os');
const fs = require('fs-extra');
const { exec } = require('child_process');
const ping = require('ping');

const { path, conf, lan, hosts, keys = {} } = require('../constants');
const origin = `${path}/gwf.pac`;
const target = `${path}/new.pac`;
const config = `${conf}/config.json`;

const exec_ext = command =>
  new Promise((res, rej) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error:\n${error}`);
        rej(error);
        return;
      }

      console.log(`stdout:\n${stdout}`);
      console.log(`stderr:\n${stderr}`);
      res(stdout);
    });
  });

module.exports = {
  'GET /pac/address': async (ctx, next) => {
    // get server IP
    const ips = os.networkInterfaces()[lan];
    const ip0 = ips.find(x => x.family == 'IPv4').address;

    // get IP on target file
    const data = fs.readFileSync(target, 'ASCII');
    const lines = data.split('\n');
    const ip1 = /\d+.\d+.\d+.\d+/.exec(lines[3])[0];

    ctx.body = { onServer: ip0, onFile: ip1 };
  },

  'PUT /pac/address': async (ctx, next) => {
    // get server IP
    const ips = os.networkInterfaces()[lan];
    const ip = ips.find(x => x.family == 'IPv4').address;

    // read config from 'origin'
    // write config to 'target'
    // so I just need to update origin
    let data = fs.readFileSync(origin, 'ASCII');
    data = data.replace('10.0.0.22', ip);
    fs.writeFileSync(target, data);

    ctx.body = { onServer: ip, onFile: ip };
  },

  'GET /pac/ping': async (ctx, next) => {
    // read current 'host'
    const kcpConfig = fs.readJsonSync(config);
    const { remoteaddr } = kcpConfig;
    const currentHost = remoteaddr.split(':').shift();

    // the default timeout is 2, which means
    // `ping` will stoped weather it reaches the `min_reply` times
    let pingInfo = await Promise.all(
      hosts.map(x => ping.promise.probe(x, { timeout: 10, min_reply: 5 }))
    );
    if (pingInfo) pingInfo = pingInfo.filter(x => x.alive && x.avg !== 'unknown');

    ctx.body = { pingInfo, currentHost };
  },

  'PUT /pac/config': async (ctx, next) => {
    const { cur, min } = ctx.request.body;

    const kcpConfig = fs.readJsonSync(config);
    const { remoteaddr } = kcpConfig;
    const currentHost = remoteaddr.split(':').shift();

    // back-end check?! why I do this?!
    if (cur !== currentHost) {
      ctx.status = 204;
      return;
    }

    const { port, key } = keys[min];
    const addr = `${min}:${port}`;

    kcpConfig.remoteaddr = addr;
    kcpConfig.key = key;
    fs.writeJsonSync(config, kcpConfig, { spaces: '    ' });

    if (process.env.NODE_ENV === 'production') {
      await exec_ext('supervisorctl restart kcptun');
    }

    ctx.body = { currentHost: min };
  },
};
