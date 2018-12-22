const { resolve, relative, basename } = require('path');
const fs = require('fs-extra');
const PromiseFtp = require('promise-ftp');
const iconv = require('iconv-lite');
const constants = require('../constants');
const { now } = require('./index');

const { nas: nasDir, ftpServer, ftpDir } = constants;
const ftp = new PromiseFtp();

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
      throw new Error(`${fileName} may already persisted`);
    }
  } catch (e) {
    await ftp.end();

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

module.exports = { getAllFiles, beforePersist, doPersist };
