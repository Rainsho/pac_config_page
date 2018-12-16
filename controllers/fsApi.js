const { resolve, relative, basename } = require('path');
const fs = require('fs-extra');
const disk = require('diskusage');
const PromiseFtp = require('promise-ftp');
const constants = require('../constants');
const { now } = require('../utils');

const ftp = new PromiseFtp();
const { nas: nasDir, ftpServer, ftpDir } = constants;

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

async function beforePersist(file, io) {
  if (!fs.existsSync(file) || !io) {
    return `${file} may not exists`;
  }

  await ftp.connect(ftpServer);

  try {
    const list = await ftp.list(ftpDir);

    if (!list || !list.length) {
      throw new Error('something wrong with the FTP server');
    }
  } catch (e) {
    return e.message;
  }

  // do not wait
  doPersist(ftp, file, io);

  return '';
}

async function doPersist(ftp, file, io) {
  const { size } = fs.statSync(file);
  const stream = fs.createReadStream(file);

  let doneSize = 0;
  let timer = now(false).t;
  let mileStone = new Array(50).fill(0).map((x, i) => (i + 1) * 0.02);

  stream.on('data', buff => {
    doneSize += buff.length;

    const percent = doneSize / size;
    const doneStone = mileStone.filter(x => x > percent);

    if (mileStone.length > doneStone.length) {
      mileStone = doneStone;

      const { s, t } = now(false);

      console.log(basename(file), t - timer, percent);
      io.emit('progress', { s, file, percent });
    }
  });

  await ftp.put(stream, `${ftpDir}/${basename(file)}`);
  await ftp.end();
}

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
