import { ILogger } from "../interface/logger.interface";

interface ILogEntry { level: 'debug' | 'error' | 'info' | 'warn'; message: string; };
let _queue: ILogEntry[] = [];
let _handler: ILogger;

export const logger: ILogger = {
  info(message) {
    if (_handler) return void _handler.info(message);
    else _queue.push({ level: 'info', message, });
  },
  debug(message) {
    if (_handler) return void _handler.debug(message);
    else _queue.push({ level: 'debug', message, });
  },
  warn(message) {
    if (_handler) return void _handler.warn(message);
    else _queue.push({ level: 'warn', message, });
  },
  error(message) {
    if (_handler) return void _handler.error(message);
    else _queue.push({ level: 'error', message, });
  },
}

export function setLogger(to: ILogger): ILogger {
  _handler = to;
  _queue.forEach(({ level, message, }) => to[level](message));
  return _handler;
}
