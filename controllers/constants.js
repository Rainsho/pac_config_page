const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    path: isDev ? '/Users/Rainsho/Downloads' : '/home/maru/App/static',
    lan: isDev ? 'en0' : 'wlan0',
};
