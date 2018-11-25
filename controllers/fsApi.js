const { resolve, relative, basename } = require('path');
const fs = require('fs-extra');
const constants = require('../constants');

const nasDir = constants.nas;

async function getAllFiles(dir) {
  const subdirs = (await fs.readdir(dir)).filter(x => !x.startsWith('.'));
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const res = resolve(dir, subdir);
      const fileStat = await fs.stat(res);

      return fileStat.isDirectory()
        ? getAllFiles(res)
        : { name: basename(res), path: relative(nasDir, res), size: fileStat.size };
    })
  );

  return files.reduce((a, f) => a.concat(f), []);
}

module.exports = {
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
};
