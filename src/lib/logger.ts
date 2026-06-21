function ts(): string {
  return new Date().toLocaleString();
}

export function logInfo(...args: unknown[]): void {
  console.log(ts(), ...args);
}

export function logWarn(...args: unknown[]): void {
  console.warn(ts(), ...args);
}

export function logError(...args: unknown[]): void {
  console.error(ts(), ...args);
}

export function logRequest(ip: string, method: string, path: string): void {
  logInfo('Request from:', ip);
  logInfo('  -->', method, path);
}
