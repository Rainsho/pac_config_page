export function fmtBytes(bytes, prec = 3) {
  if (Number.isNaN(parseInt(bytes, 10))) return bytes;

  if (bytes < 1024) return `${parseInt(bytes, 10)} B`;

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / k ** i).toFixed(prec)} ${sizes[i]}`;
}
