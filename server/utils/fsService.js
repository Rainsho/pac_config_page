const { resolve, relative, basename } = require('path');
const fs = require('fs-extra');
const PromiseFtp = require('promise-ftp');
const iconv = require('iconv-lite');
const constants = require('../constants');
const { now, syncQueue } = require('./index');

const { nas: nasDir, ftpServer, ftpDir } = constants;
const ftp_jobs = { current: null, queue: [] };

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
  const fileName = basename(file);

  if (!fs.existsSync(file) || !io) {
    return `${fileName} may not exists`;
  }

  if (ftp_jobs.queue.includes(file)) {
    return `${fileName} is in the queue, just wait`;
  }

  if (ftp_jobs.current && ftp_jobs.current.file === file) {
    return `${fileName} is in the queue, just wait`;
  }

  const ftp = new PromiseFtp();
  await ftp.connect(ftpServer);

  try {
    const list = await ftp.list(ftpDir);

    if (!list || !list.length) {
      throw new Error('something wrong with the FTP server');
    }

    const names = list
      .filter(x => x.type !== 'd')
      .map(({ name }) => iconv.decode(Buffer.from(name, 'binary'), 'utf-8'));

    if (names.includes(fileName)) {
      io.emit('done', { id: fileName, file, state: 'done', time: 'NOT SURE' });
      throw new Error(`${fileName} may already persisted`);
    }
  } catch (e) {
    return e.message;
  } finally {
    await ftp.end();
  }

  ftp_jobs.queue.push(file);
  syncQueue(fileName, { state: 'enqueue' });

  // do not wait
  doPersist(io);

  return '';
}

async function doPersist(io) {
  if (ftp_jobs.current) return;

  const file = ftp_jobs.queue.shift();

  if (!file) return;

  const ftpStatus = new Promise(res => {
    ftp_jobs.current = res;
    ftp_jobs.current.file = file;
  });

  const ftp = new PromiseFtp();
  await ftp.connect(ftpServer);

  const { size } = fs.statSync(file);
  const stream = fs.createReadStream(file);
  const fileName = basename(file);

  // emit progress every 5MB transfered
  const T = Math.ceil(size / (5 * 1024 * 1024));

  let doneSize = 0;
  let timer = now(false).t;
  let mileStone = new Array(T).fill(0).map((x, i) => (i + 1) * (1 / T));
  let cancel = false;

  stream.on('data', buff => {
    if (cancel) return;

    doneSize += buff.length;

    const percent = doneSize / size;
    const { s, t } = now(false);
    const doneStone = mileStone.filter(x => x > percent);

    if (percent === 1) {
      syncQueue(fileName, { file, state: 'done', time: s });
      io.emit('done', { id: fileName, file, state: 'done', time: s });
    }

    if (mileStone.length > doneStone.length) {
      mileStone = doneStone;

      const cost = t - timer;

      console.log(fileName, cost, percent);
      io.emit('progress', { s, file: fileName, percent, cost });
    }
  });

  syncQueue(fileName, {
    file,
    state: 'uploading',
    cancel: async () => {
      cancel = true;

      ftp_jobs.current && ftp_jobs.current();
      ftp_jobs.current = null;
    },
  });

  // call `ftp.end` in `cancel` will make `put` pending forever
  await Promise.race([ftp.put(stream, `${ftpDir}/${fileName}`), ftpStatus]);
  await ftp.end();

  ftp_jobs.current && ftp_jobs.current();
  ftp_jobs.current = null;

  doPersist(io);
}

module.exports = { getAllFiles, beforePersist, doPersist };
