import config from './config';

const FS_API = `${config.SERVER}fs/file`;

export function getFiles() {
  return fetch(FS_API).then(x => x.json());
}

export function renameFile(path = '', name) {
  return fetch(FS_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, name }),
  }).then(x => (x.status === 200 ? x.json() : {}));
}

export function deleteFile(path, purge) {
  return fetch(FS_API, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, purge }),
  }).then(x => (x.status === 200 ? x.json() : {}));
}
