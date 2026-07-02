import path from 'path';

import {
  createLogger,
  format,
  transports,
  config as winstonConfig,
  type Logger as WinstonLogger,
} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { appConfig } from '@/config';

const { combine, timestamp, errors, json, colorize, printf, splat } = format;

// ─── Custom log levels (include http between verbose and debug) ────────────────
const customLevels = {
  levels: { ...winstonConfig.npm.levels, http: 5 },
  colors: { ...winstonConfig.npm.colors, http: 'magenta' },
};

// ─── Formats ──────────────────────────────────────────────────────────────────

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ level, message, timestamp: ts, stack, requestId, ...meta }) => {
    const rid = requestId ? ` [${String(requestId)}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${String(ts)}${rid} ${level}: ${String(message)}${stack ? `\n${String(stack)}` : ''}${metaStr}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), splat(), json());

// ─── File transports (production & staging) ───────────────────────────────────

function makeRotatingTransport(filename: string, level?: string) {
  return new DailyRotateFile({
    filename: path.join(appConfig.logging.dir, `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    ...(level ? { level } : {}),
  });
}

// ─── Transport list ───────────────────────────────────────────────────────────

const logTransports: WinstonLogger['transports'] = [new transports.Console()];

if (!appConfig.isTest) {
  logTransports.push(
    makeRotatingTransport('access', 'http'),
    makeRotatingTransport('error', 'error'),
    makeRotatingTransport('combined'),
  );
}

// ─── Logger instance ──────────────────────────────────────────────────────────

export const logger = createLogger({
  levels: customLevels.levels,
  level: appConfig.logging.level,
  format: appConfig.isDev || appConfig.isTest ? devFormat : prodFormat,
  defaultMeta: { service: 'travel-api', env: appConfig.env },
  transports: logTransports,
  exitOnError: false,
});

export type Logger = typeof logger;
