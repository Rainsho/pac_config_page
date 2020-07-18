const fs = require('fs-extra');
const ping = require('ping');

const { v2rayServers, v2rayConfig } = require('../constants');

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

      ctx.body = { code: 200, desc: `updated ${servers.length} servers` };
    } catch (e) {
      console.log(e);
      ctx.status = 403;
      ctx.body = 'illeal vmess server string';
    }
  },
};
