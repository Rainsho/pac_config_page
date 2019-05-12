const config = {
  SERVER: 'http://localhost:3000/',
  // SERVER: 'http://192.168.100.200:3000/',
  ARIA2_UI: 'http://192.168.100.200:8888/',
  NAS_SERVER: 'http://192.168.100.200/',
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(config, {
    SERVER: '/',
    NAS_SERVER: '/',
  });
}

export default config;
