const { resolve } = require('path');
const fs = require('fs-extra');
const disk = require('diskusage');
const constants = require('../constants');
const { getAllFiles, beforePersist } = require('../utils/fsService');

const { nas: nasDir } = constants;

module.exports = {
  'GET /fs/disk': async ctx => {
    ctx.body = disk.checkSync('/');
  },

  'GET /fs/file': async ctx => {
    ctx.body = await getAllFiles(nasDir);
  },

  'PUT /fs/file': async ctx => {
    const { path = '', name } = ctx.request.body;
    const oldFile = resolve(nasDir, path);

    if (!path || !name || !fs.existsSync(oldFile)) {
      ctx.status = 204;
      return;
    }

    await fs.move(oldFile, resolve(oldFile, '..', name), { overwrite: true });
    ctx.body = { code: 200, desc: 'put done!' };
  },

  'DELETE /fs/file': async ctx => {
    const { path = '', purge } = ctx.request.body;

    if (purge) {
      await fs.emptyDir(nasDir);
      ctx.body = { code: 200, desc: 'purge done!' };
      return;
    }

    const file = resolve(nasDir, path);

    if (path && fs.existsSync(file)) {
      await fs.remove(file);
      ctx.body = { code: 200, desc: 'delete done!' };
      return;
    }

    ctx.status = 204;
  },

  'PUT /fs/ftpd': async ctx => {
    const { path = '' } = ctx.request.body;
    const file = resolve(nasDir, path);
    const desc = await beforePersist(file, ctx.io);

    ctx.body = { code: 200, desc };
  },
};
