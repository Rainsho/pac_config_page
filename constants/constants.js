const isDev = process.env.NODE_ENV === 'development';

const _default = {
    path: isDev ? '/Users/Rainsho/Downloads' : '/home/maru/App/static',
    conf: isDev ? '/Users/Rainsho/Downloads' : '/home/maru/Downloads/kcptun',
    lan: isDev ? 'en0' : 'wlan0',
    hosts: ['192.168.0.0', '192.168.100.1'],
};

try {
    const _hosts = require('./_hosts');
    _default.hosts = _hosts;
} catch (e) {
    console.warn(e);
}

module.exports = _default;
