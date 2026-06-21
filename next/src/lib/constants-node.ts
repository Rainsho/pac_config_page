// Node.js runtime constants — only imported by route handlers (not proxy/middleware)
const isDev = process.env.NODE_ENV === 'development';

export const paths = {
  nas: isDev ? '/tmp/nexus-dev/nas' : process.env.NAS_DIR || '/home/rainsho/nas',
  bridge: isDev ? '/tmp/nexus-dev/bridge' : process.env.BRIDGE_DIR || '/mnt/modok/bridge',
  xunlei: isDev ? '/tmp/nexus-dev/xunlei' : process.env.XUNLEI_DIR || '/mnt/raind/downloads/bridge',
  raind: isDev ? '/tmp/nexus-dev/void' : process.env.VOID_DIR || '/mnt/raind/void',
  symlink: 'TDDOWNLOAD',
};
