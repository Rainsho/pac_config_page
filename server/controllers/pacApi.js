const fs = require('fs-extra');
const ping = require('ping');
const { execSync } = require('child_process');

const { v2rayServers, v2rayConfig } = require('../constants');
const { updateV2rayConfig } = require('../utils');

module.exports = {
  'GET /pac/ping': async ctx => {
    if (!fs.existsSync(v2rayServers)) {
      ctx.status = 204;
      return;
    }

    const servers = await fs.readJson(v2rayServers);
    const serverPings = await Promise.all(
      servers.map(x => ping.promise.probe(x.add, { timeout: 10, min_reply: 3 }))
    );
    const infos = servers
      .map(({ add, ps }) => {
        const c = serverPings.find(x => x.host === add);

        return c ? { ps, alive: c.alive, avg: c.avg } : null;
      })
      .filter(Boolean);

    ctx.body = infos;
  },

  'GET /pac/v2ray': async ctx => {
    if (!fs.existsSync(v2rayServers) || !fs.existsSync(v2rayConfig)) {
      ctx.status = 204;
      return;
    }

    const servers = await fs.readJson(v2rayServers);
    const config = await fs.readJson(v2rayConfig);

    try {
      const { address } = config.outbounds[0].settings.vnext[0];
      const current = servers.find(x => x.add === address);

      ctx.body = { current: current && current.ps, servers: servers.map(x => ({ ps: x.ps })) };
    } catch (e) {
      console.log(e);
      ctx.status = 204;
    }
  },

  'POST /pac/v2ray': async ctx => {
    try {
      const { vmess } = ctx.request.body;
      const servers = Buffer.from(vmess, 'base64')
        .toString()
        .trim()
        .split('\n')
        .map(x => Buffer.from(x.replace('vmess://', ''), 'base64').toString())
        .map(x => JSON.parse(x))
        .filter(x => x.host);

      await fs.writeJson(v2rayServers, servers, { spaces: 2 });

      ctx.body = { servers: servers.map(x => ({ ps: x.ps })) };
    } catch (e) {
      console.log(e);
      ctx.status = 403;
      ctx.body = 'illeal vmess server string';
    }
  },

  'PUT /pac/v2ray': async ctx => {
    const { ps } = ctx.request.body;

    if (!ps || !fs.existsSync(v2rayServers) || !fs.existsSync(v2rayConfig)) {
      ctx.status = 204;
      return;
    }

    const servers = await fs.readJson(v2rayServers);
    const config = await fs.readJson(v2rayConfig);
    const tServer = servers.find(x => x.ps === ps);

    if (!tServer) {
      ctx.status = 416;
      return;
    }

    const tConfig = updateV2rayConfig(config, tServer);

    await fs.writeJson(v2rayConfig, tConfig, { spaces: 2 });

    if (process.env.NODE_ENV === 'production') {
      try {
        execSync('pm2 restart v2ray', { encoding: 'utf-8' });
        ctx.body = { current: ps };
      } catch (e) {
        console.log(e);
        ctx.status = 400;
        ctx.body = e;
      }
    } else {
      ctx.body = { current: ps };
    }
  },
};
