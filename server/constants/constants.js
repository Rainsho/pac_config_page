const { resolve } = require('path');

const isDev = process.env.NODE_ENV === 'development';

const _default = {
  nas: isDev ? '/Users/rainsho/Downloads' : '/home/maru/nas',
  v2rayConfig: isDev ? '/Users/rainsho/Downloads/v2ray.json' : '/home/maru/configs/v2ray.json',
  v2rayServers: resolve(__dirname, '_servers.json'),

  // should persist
  db: {},
  bakFile: resolve(__dirname, '_bak.json'),

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
  const { last, queue } = require(_default.bakFile);

  _default.db = { last, queue };
} catch (e) {
  console.warn(e);
}

try {
  const _secret = require('./_secret');
  Object.assign(_default, _secret);
} catch (e) {
  console.warn(e);
}

module.exports = _default;
