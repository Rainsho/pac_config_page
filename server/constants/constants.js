const { resolve } = require('path');
const fs = require('fs-extra');

const isDev = process.env.NODE_ENV === 'development';

const _default = {
  nas: isDev ? '/Users/rainsho/Downloads/t1' : '/home/rainsho/nas',
  bridge: isDev ? '/Users/rainsho/Downloads/t2' : '/mnt/modok/bridge',

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

module.exports = _default;
