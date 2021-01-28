import path from 'path';
import { IEnvVariableOptions } from './interfaces/env-variable-options.interface';

/**
 * @param name
 * @param options
 */
function envBoolean(name: string, options?: IEnvVariableOptions<boolean>): boolean {
  const _default = options?._default ?? undefined;
  const required = options?.required ?? false;
  const value1 = process.env[name]
  if (value1 === undefined) {
    if (required || _default === undefined) throw new ReferenceError(`Environment variable "${name}" is required`);
    return _default;
  }
  const value2 = value1.toLowerCase().trim();
  if (value2 === 'false') return false;
  if (value2 === '0') return false;
  if (value2 === 'true') return true;
  if (value2 === '1') return true;
  throw new TypeError(`Environment variable "${name}" must be a boolean (false|0|true|1)`);
}

/**
 * @param name
 * @param options
 */
function envNumber(name: string, options?: IEnvVariableOptions<number>): number {
  const _default = options?._default ?? undefined;
  const required = options?.required ?? false;
  const value1 = process.env[name];
  if (value1 === undefined) {
    if (required || _default === undefined) throw new ReferenceError(`Environment variable "${name}" is required`);
    return _default;
  }
  const value2 = Number(value1);
  if (!Number.isFinite(value1)) throw new TypeError(`Environment variable ${_default} must be a number`);
  return value2;
}

/**
 * @param name
 * @param options
 */
function envString(name: string, options?: IEnvVariableOptions<string>): string {
  const _default = options?._default ?? undefined;
  const required = options?.required ?? false;
  let value = process.env[name]
  if (value === undefined) {
    if (required || _default === undefined) throw new ReferenceError(`Environment variable "${name}" is required`);
    return _default;
  }
  return value;
}

/**
 * @param name
 * @param options
 */
function envInteger(name: string, options?: IEnvVariableOptions<number>): number {
  const _default = options?._default ?? undefined;
  const required = options?.required ?? false;
  const value1 = process.env[name]
  if (value1 === undefined) {
    if (required || _default === undefined) throw new ReferenceError(`Environment variable "${name}" is required`);
    return _default;
  }
  const float = Number(value1);
  const value2 = parseInt(value1, 10);
  // invalid number or not integer
  if ((float !== value2) || !Number.isFinite(value1))
    throw new TypeError(`Environment variable ${_default} must be an integer`);

  return value2;
}


const isDist = __filename.endsWith('.js');
const isSrc = __filename.endsWith('.ts');

if (isDist && isSrc || (!isDist && !isSrc)) {
  throw new Error('Unable to determine build context...');
}

const DIR_ROOT = isDist
  ? path.normalize(path.resolve(__dirname, '../../..'))
  : path.normalize(path.resolve(__dirname, '../..'));

const DATA_DIR = path.normalize(path.resolve(DIR_ROOT, envString('DATA_DIR', { _default: 'storage/data', })));

export const Config = {
  DIR_ROOT,
  DIR_SRC: path.normalize(path.resolve(DIR_ROOT, 'src')),
  DIR_SRC_SERVER: path.normalize(path.resolve(DIR_ROOT, 'src/server.')),
  DIR_SRC_CLIENT: path.normalize(path.resolve(DIR_ROOT, 'src/client')),
  DIR_DIST: path.normalize(path.resolve(DIR_ROOT, 'dist')),
  DIR_DIST_SERVER: path.normalize(path.resolve(DIR_ROOT, 'dist/server/server')),
  DIR_DIST_CLIENT: path.normalize(path.resolve(DIR_ROOT, 'dist/client')),
  DIR_PUBLIC: path.normalize(path.resolve(DIR_ROOT, 'public')),
  DATA_DIR,
  DATA_FILE: path.normalize(path.resolve(DATA_DIR, 'data.json')),
  LOGS_DIR: path.normalize(path.resolve(DIR_ROOT, envString('LOGS_DIR', { _default: 'storage/logs', }))),
  LOGS_GZIP: envBoolean('LOGS_GZIP', { _default: true }),
  LOGS_MAX_SIZE: envString('LOGS_MAX_SIZE', { _default: '5mb' }),
  LOGS_ROTATE_MAX_AGE: envString('LOGS_ROTATE_MAX_AGE', { _default: '7d' }),
}
