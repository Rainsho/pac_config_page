const { resolve, basename, relative } = require('path');
const fs = require('fs-extra');
const disk = require('diskusage');
const formidable = require('formidable');
const constants = require('../constants');
const { getAllFiles, beforePersist } = require('../utils/fsService');
const { syncQueue } = require('../utils');

const { nas: nasDir, db } = constants;

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

    const target = resolve(oldFile, '..', name);

    if (relative(nasDir, target).startsWith('..')) {
      ctx.body = 'illegal operate';
      ctx.status = 403;
      return;
    }

    await fs.move(oldFile, target, { overwrite: true });
    ctx.body = { code: 200, desc: 'put done!' };
  },

  'DELETE /fs/file': async ctx => {
    const { path = '', purge } = ctx.request.body;

    if (purge) {
      await fs.emptyDir(nasDir);
      syncQueue();
      ctx.body = { code: 200, desc: 'purge done!' };
      return;
    }

    const file = resolve(nasDir, path);

    if (path && fs.existsSync(file)) {
      await fs.remove(file);
      syncQueue(basename(file), null, true);
      ctx.body = { code: 200, desc: 'delete done!' };
      return;
    }

    ctx.status = 204;
  },

  'PUT /fs/ftpd': async ctx => {
    const { path = '' } = ctx.request.body;
    const file = resolve(nasDir, path);
    const desc = await beforePersist(file, ctx.io);

    // desc stand for error
    // WTF: if there is an error, why code 200?!
    // if (!desc) {
    //   syncQueue(basename(file), { state: 'enqueue' });
    // }

    ctx.body = { code: 200, desc };
  },

  'GET /fs/queue': async ctx => {
    ctx.body = db.queue || [];
  },

  'DELETE /fs/ftpd': async ctx => {
    const { fileName = '' } = ctx.request.body;
    const info = db.queue.find(x => x.id === fileName);

    if (info && typeof info.cancel === 'function') {
      await info.cancel();
      syncQueue(fileName, null, true);
      ctx.body = { code: 200, desc: 'done' };
    } else {
      ctx.status = 204;
    }
  },

  'POST /fs/upload': async ctx => {
    const [err, , files] = await new Promise(res => {
      const form = new formidable.IncomingForm({ maxFileSize: 2 ** 31 }); // ~ 2G

      let fileInfo = { p: 0 };

      form
        .on('fileBegin', (_, file) => {
          fileInfo = file;
          fileInfo.p = 0;
        })
        .on('progress', (rec, exp) => {
          const p = rec / exp;

          if (fileInfo.name && p - fileInfo.p > 0.02) {
            fileInfo.p = p;

            ctx.io.emit('upload', { file: fileInfo.name, percent: p });
          }
        })
        .on('file', (_, file) => {
          const { name, path } = file;
          const dest = resolve(nasDir, name);

          fs.moveSync(path, dest, { overwrite: true });
        })
        .on('end', () => {
          ctx.io.emit('upload', { file: fileInfo.name, percent: 1 });
        })
        .on('error', err => {
          res(err);
        });

      form.parse(ctx.req, (...args) => res(args));
    });

    if (!err && files && files.file) {
      ctx.body = { code: 200, desc: `${files.file.name} done!` };
    } else {
      ctx.status = 204;
    }
  },
};
