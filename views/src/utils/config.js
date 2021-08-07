const config = {
  // API_SERVER: 'http://localhost:3000/',
  API_SERVER: 'http://10.0.0.22/api/',
  ARIA2_PAGE: 'http://10.0.0.22/aria2/',
  DROPPY_PAGE: 'http://10.0.0.22/droppy/',
  NAS_SERVER: 'http://10.0.0.22/',
  // IO_PATH: 'http://localhost:3000/',
  IO_PATH: 'http://10.0.0.22/',
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(config, {
    API_SERVER: '/api/',
    ARIA2_PAGE: '/aria2/',
    DROPPY_PAGE: '/droppy/',
    NAS_SERVER: '/',
    IO_PATH: '/',
  });
}

export default config;
