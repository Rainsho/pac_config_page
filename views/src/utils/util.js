import { notification } from 'antd';

export function fmtBytes(bytes, prec = 3) {
  if (Number.isNaN(parseInt(bytes, 10))) return bytes;

  if (bytes < 1024) return `${parseInt(bytes, 10)} B`;

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / k ** i).toFixed(prec)} ${sizes[i]}`;
}

function checkStatus(response) {
  if (response.status !== 200) {
    notification.warning({
      message: `Got status ${response.status}`,
      description: 'What did you do?',
    });
    return Promise.resolve({});
  }

  return response.json();
}

export class Request {
  static async get(url) {
    return fetch(url).then(x => x.json());
  }

  static async put(url, body) {
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(checkStatus);
  }

  static async delete(url, body) {
    return fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(checkStatus);
  }
}

export function isIP(str = '') {
  return /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.exec(str);
}
