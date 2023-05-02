const { resolve, relative, basename } = require('path');
const fs = require('fs-extra');
const constants = require('../constants');
const { now, syncQueue } = require('./index');

const { nas: nasDir, bridge: bridgeDir } = constants;
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
  const target = resolve(bridgeDir, fileName);

  if (!fs.existsSync(file) || !io) {
    return `${fileName} may not exists`;
  }

  if (ftp_jobs.queue.includes(file)) {
    return `${fileName} is in the queue, just wait`;
  }

  if (ftp_jobs.current && ftp_jobs.current.file === file) {
    return `${fileName} is in the queue, just wait`;
  }

  if (fs.existsSync(target)) {
    io.emit('done', { id: fileName, file, state: 'done', time: 'NOT SURE' });
    return `${fileName} may already persisted`;
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

  const { size } = fs.statSync(file);
  const input = fs.createReadStream(file);
  const fileName = basename(file);
  const target = resolve(bridgeDir, fileName);
  const output = fs.createWriteStream(target);

  // emit progress every 10MB transferred
  const T = Math.ceil(size / (10 * 1024 * 1024));

  let doneSize = 0;
  let timer = now(false).t;
  let mileStone = new Array(T).fill(0).map((x, i) => (i + 1) * (1 / T));

  input.on('data', buff => {
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

  input.on('end', () => {
    ftp_jobs.current && ftp_jobs.current();
  });

  input.on('error', () => {
    ftp_jobs.current && ftp_jobs.current();
  });

  syncQueue(fileName, {
    file,
    state: 'uploading',
    cancel: async () => {
      input.close();
      ftp_jobs.current && ftp_jobs.current();
      fs.remove(target);
    },
  });

  input.pipe(output);
  await ftpStatus;
  ftp_jobs.current = null;
  doPersist(io);
}

module.exports = { getAllFiles, beforePersist, doPersist };
