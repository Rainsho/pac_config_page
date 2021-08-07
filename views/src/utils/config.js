const config = {
  API_SERVER: 'http://localhost:3000/',
  // API_SERVER: 'http://10.0.0.22:3000/',
  ARIA2_PAGE: 'http://10.0.0.22/aria2/',
  DROPPY_PAGE: 'http://10.0.0.22/droppy/',
  NAS_SERVER: 'http://10.0.0.22/',
  IO_PATH: '/socket.io',
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(config, {
    API_SERVER: '/api/',
    ARIA2_UI: '/aria2/',
    DROPPY_PAGE: '/droppy/',
    NAS_SERVER: '/',
    IO_PATH: '/api/socket.io',
  });
}

export default config;
