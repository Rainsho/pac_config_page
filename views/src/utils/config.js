const config = {
  SERVER: 'http://localhost:3000/',
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(config, {
    SERVER: 'http://192.168.100.200:3000/',
  });
}

export default config;
