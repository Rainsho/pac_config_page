const config = {
  SERVER: 'http://localhost:3000/',
  // SERVER: 'http://10.0.0.22:3000/',
  ARIA2_UI: 'http://10.0.0.22:8888/',
  NAS_SERVER: 'http://10.0.0.22/',
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(config, {
    SERVER: '/',
    NAS_SERVER: '/',
  });
}

export default config;
