const { resolve } = require('path');
const fs = require('fs-extra');

const isDev = process.env.NODE_ENV === 'development';

const _default = {
  nas: isDev ? '/Users/rainsho/Downloads/t1' : '/home/rainsho/nas',
  bridge: isDev ? '/Users/rainsho/Downloads/t2' : '/mnt/modok/bridge',
  xunlei: isDev ? '/Users/rainsho/Downloads/t3' : '/mnt/raind/downloads/bridge',
  raind: isDev ? '/Users/rainsho/Downloads/t4' : '/mnt/raind/void',
  symlink: 'TDDOWNLOAD',

  // should override by `_sercret.js`
  ftpServer: {
    host: '192.168.0.0',
    user: 'username',
    password: 'password',
  },
  ftpDir: '/path/to/write',
  jwtOptions: {},
  jwtCode: 'string',
};

try {
  const _secret = require('../_secret');
  Object.assign(_default, _secret);
} catch (e) {
  console.warn(e);
}

if (isDev) {
  Promise.all(
    [_default.nas, _default.bridge, _default.xunlei, _default.raind].map((d) =>
      fs.ensureDir(d),
    ),
  );
}

module.exports = _default;
