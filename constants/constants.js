const { resolve } = require('path');

const isDev = process.env.NODE_ENV === 'development';

const _default = {
  path: isDev ? '/Users/Rainsho/Downloads' : '/home/maru/App/static',
  conf: isDev ? '/Users/Rainsho/Downloads' : '/home/maru/Downloads/kcptun',
  lan: isDev ? 'en0' : 'wlan0',
  hosts: ['192.168.0.0', '192.168.100.1'],
  nas: isDev ? '/Users/Rainsho/Downloads' : '/home/maru/nas',
  bakFile: resolve(__dirname, '_bak.json'),
  db: {},
  keys: {
    '192.168.0.0': {
      port: 8080,
      key: 'password',
    },
  },
  ftpServer: {
    host: '192.168.0.0',
    user: 'username',
    password: 'password',
  },
  ftpDir: '/path/to/write',
};

try {
  _default.db = require(_default.bakFile);
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
