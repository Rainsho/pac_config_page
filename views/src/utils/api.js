import { Request } from './util';
import config from './config';

const { API_SERVER } = config;

export function getDisk() {
  return Request.get(`${API_SERVER}fs/disk`);
}

export function getFiles() {
  return Request.get(`${API_SERVER}fs/file`);
}

export function renameFile(path = '', name) {
  return Request.put(`${API_SERVER}fs/file`, { path, name });
}

export function deleteFile(path, purge) {
  return Request.delete(`${API_SERVER}fs/file`, { path, purge });
}

export function getAddress() {
  return Request.get(`${API_SERVER}pac/address`);
}

export function updateAddress() {
  return Request.put(`${API_SERVER}pac/address`);
}

export function getPing() {
  return Request.get(`${API_SERVER}pac/ping`);
}

export function updateConfig(cur, min) {
  return Request.put(`${API_SERVER}pac/config`, { cur, min });
}

export function getSDInfo(all = false) {
  return Request.get(`${API_SERVER}sd/info${all ? '?all=true' : ''}`);
}

export function persistFile(path) {
  return Request.put(`${API_SERVER}fs/ftpd`, { path });
}

export function getQueue() {
  return Request.get(`${API_SERVER}fs/queue`);
}

export function cancelPersist(fileName) {
  return Request.delete(`${API_SERVER}fs/ftpd`, { fileName });
}
