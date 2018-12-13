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
};

try {
  _default.db = require(_default.bakFile);
} catch (e) {
  console.warn(e);
}

try {
  const _hosts = require('./_hosts');
  _default.hosts = _hosts;
} catch (e) {
  console.warn(e);
}

module.exports = _default;
