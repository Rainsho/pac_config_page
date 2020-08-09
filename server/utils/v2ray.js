function updateV2rayConfig(config, server) {
  // FIXME: should work for `ws`, others do not know
  config.outbounds[0].streamSettings.wsSettings.path = server.path;
  config.outbounds[0].streamSettings.wsSettings.headers.host = server.host;
  config.outbounds[0].streamSettings.tlsSettings.serverName = server.host;
  config.outbounds[0].streamSettings.network = server.net;
  config.outbounds[0].settings.vnext[0].address = server.add;
  config.outbounds[0].settings.vnext[0].port = server.port;
  config.outbounds[0].settings.vnext[0].users[0].id = server.id;

  return config;
}

module.exports = { updateV2rayConfig };
