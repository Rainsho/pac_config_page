import { Request } from './util';
import config from './config';

const { SERVER } = config;

export function getDisk() {
  return Request.get(`${SERVER}fs/disk`);
}

export function getFiles() {
  return Request.get(`${SERVER}fs/file`);
}

export function renameFile(path = '', name) {
  return Request.put(`${SERVER}fs/file`, { path, name });
}

export function deleteFile(path, purge) {
  return Request.put(`${SERVER}fs/file`, { path, purge });
}

export function getAddress() {
  return Request.get(`${SERVER}pac/address`);
}

export function updateAddress() {
  return Request.put(`${SERVER}pac/address`);
}

export function getPing() {
  return Request.get(`${SERVER}/pac/ping`);
}

export function updateConfig(cur, min) {
  return Request.put(`${SERVER}/pac/config`, { cur, min });
}