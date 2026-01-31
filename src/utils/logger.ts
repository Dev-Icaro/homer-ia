import { createLogger, transports, format, addColors } from 'winston';
import * as path from 'path';
import 'winston-daily-rotate-file';
import { getRequestContext, getReqId } from './request-context';

const logDirectory = path.resolve(__dirname, '../../../logs');
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    query: 5,
    debug: 6,
    silly: 7,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    http: 'magenta',
    verbose: 'gray',
    query: 'cyan',
    debug: 'green',
    silly: 'white',
  },
};

addColors(customLevels.colors);

const logger = createLogger({
  levels: customLevels.levels,
  format: format.combine(
    format(info => ({ ...info, level: info.level.toUpperCase() }))(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message }) =>
        `[${level}] - ${timestamp} - ${getReqId() || 'SYSTEM'} - ${
          getRequestContext()?.userId || '#'
        }: ${message}`,
    ),
  ),
  transports: [
    new transports.DailyRotateFile({
      silent: process.env.LOG_SILENT === 'true',
      level: process.env.LOG_LEVEL || 'error',
      dirname: logDirectory,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '3d',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      silent: process.env.LOG_SILENT === 'true',
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format(info => ({ ...info, level: info.level.toUpperCase() }))(),
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(
          ({ timestamp, level, message }) =>
            `[${level}] - ${timestamp} - ${getReqId() || 'SYSTEM'} - ${
              getRequestContext()?.userId || '#'
            }: ${message}`,
        ),
      ),
    }),
  );
}

declare module 'winston' {
  interface Logger {
    logQuery(message: string, meta?: any): void;
  }
}

function formatValue(val: any): string {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (Buffer.isBuffer(val)) {
    return `E'\\\\x${val.toString('hex')}'`;
  }
  if (typeof val === 'number' || typeof val === 'bigint') {
    return String(val);
  }
  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  if (val instanceof Date) {
    return `'${val.toISOString()}'`;
  }
  if (Array.isArray(val)) {
    return '(' + val.map(v => formatValue(v)).join(', ') + ')';
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

function formatQuery(text: string, values: any[] = []): string {
  return String(text).replace(/\$([1-9]\d*)/g, (match, idxStr) => {
    const idx = parseInt(idxStr, 10) - 1;
    const val = values[idx];
    return formatValue(val);
  });
}

logger.logQuery = (query: string, params: any[]): void => {
  try {
    let formattedQuery = query;
    if (params && params.length > 0) {
      formattedQuery = formatQuery(query, params);
    }
    logger.log('query', formattedQuery);
  } catch (err) {
    logger.log('query', query);
  }
};

export default logger;