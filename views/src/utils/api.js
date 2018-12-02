import { Request } from './util';
import config from './config';

const { SERVER } = config;
const FS_API = `${SERVER}fs/file`;

export function getDisk() {
  return Request.get(`${SERVER}fs/disk`);
}

export function getFiles() {
  return Request.get(FS_API);
}

export function renameFile(path = '', name) {
  return Request.put(FS_API, { path, name });
}

export function deleteFile(path, purge) {
  return Request.put(FS_API, { path, purge });
}

export function getAddress() {
  return Request.get(`${SERVER}pac/address`);
}
