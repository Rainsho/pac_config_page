const config = {
  API_SERVER: 'http://localhost:3000/',
  // API_SERVER: 'http://10.0.0.22:3000/',
  ARIA2_UI: 'http://10.0.0.22:8888/',
  NAS_SERVER: 'http://10.0.0.22/',
  IO_PATH: '/socket.io',
};

if (process.env.NODE_ENV === 'production') {
  Object.assign(config, {
    API_SERVER: '/api/',
    NAS_SERVER: '/',
    IO_PATH: '/api/socket.io',
  });
}

export default config;
