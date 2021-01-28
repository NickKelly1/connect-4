import 'winston-daily-rotate-file';
import stream from 'stream';
import winston from 'winston';
import path from 'path';
import fs from  'fs';
import { Config } from './config';
import { Util } from '../common/fn/util.fn';
import { ILogger } from '../common/interface/logger.interface';
import { logger, setLogger } from '../common/fn/logger.fn';

// https://medium.com/@helabenkhalfallah/nodejs-rest-api-with-express-passport-jwt-and-mongodb-98e5f2fee496

// create log file if not exist
const logDirectory = path.resolve(Config.DIR_ROOT, Config.LOGS_DIR);

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
  if (!fs.existsSync(logDirectory)) {
    throw new Error(`Failed to create logDirectory: ${logDirectory}`);
  }
}

const nocolorFormat = winston.format.combine(
  winston.format.uncolorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? Util.pretty(args) : ''}`.trim();
  }),
)

const colorFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    // const ts = timestamp.slice(0, 19).replace('T', ' ') ;
    return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? Util.pretty(args) : ''}`.trim();
  }),
)

const debugRotateTransport = new winston.transports.DailyRotateFile({
  level: 'debug',
  dirname: logDirectory,
  filename: '%DATE%.info.log',
  datePattern: 'YYYY-MM-DD',
  // datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: Config.LOGS_GZIP,
  format: nocolorFormat,
  maxSize: Config.LOGS_MAX_SIZE,
  maxFiles: Config.LOGS_ROTATE_MAX_AGE,
});


const errorRotateTransport = new winston.transports.DailyRotateFile({
  level: 'warn',
  dirname: logDirectory,
  filename: '%DATE%.error.log',
  datePattern: 'YYYY-MM-DD',
  // datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: Config.LOGS_GZIP,
  format: nocolorFormat,
  maxSize: Config.LOGS_MAX_SIZE,
  maxFiles: Config.LOGS_ROTATE_MAX_AGE,
});


// app logger config
/** @type {winston.Logger} logger */
const _serverLogger = winston.createLogger({
  transports: [
    // new winston.transports.File({
    //   level: 'info',
    //   filename: process.env.LOG_FILE_NAME,
    //   dirname: logDirectory,
    //   handleExceptions: true,
    //   json: true,
    //   maxsize: process.env.LOG_MAX_SIZE,
    //   maxFiles: process.env.LOG_MAX_FILE,
    //   colorize: false,
    // }),

    // https://www.npmjs.com/package/winston-daily-rotate-file
    debugRotateTransport,
    errorRotateTransport,
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: colorFormat,
    }),
  ],
  exitOnError: false,
});

/**
 * Clean off extra crap
 */
function clean(str: string) { return str.trim().replace(/\n+%/, '').trim() }

export const serverLoggerStream = new stream.Writable({
  write(chunk, encoding, done) {
    if (Buffer.isBuffer(chunk)) {
      // strip off morgan new lines...
      _serverLogger.info(clean(chunk.toString('utf-8')));
      return void done();
    }
    else if (typeof chunk === 'string') {
      _serverLogger.info(clean(chunk));
      return void done();
    }
    else {
      // ?
      _serverLogger.info(chunk)
      return void done();
    }
  },
});


export const serverLogger: ILogger = {
  debug(message) { _serverLogger.debug(message); },
  warn(message) { _serverLogger.warn(message); },
  info(message) { _serverLogger.info(message); },
  error(message) { _serverLogger.error(message); },
};
