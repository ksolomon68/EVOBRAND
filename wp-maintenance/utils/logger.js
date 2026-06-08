// utils/logger.js — Winston structured logger
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.resolve(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = winston.format;

// ─── Custom log format ────────────────────────────────────────────────────────
const logFormat = printf(({ level, message, timestamp, stack, client }) => {
  const clientTag = client ? ` [${client}]` : '';
  return `${timestamp}${clientTag} ${level.toUpperCase()}: ${stack || message}`;
});

// ─── Daily log file name ──────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];
const logFile = path.join(LOGS_DIR, `maintenance-${today}.log`);
const errorFile = path.join(LOGS_DIR, `errors-${today}.log`);

// ─── Logger instance ──────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console — colorized
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        logFormat
      ),
    }),
    // File — all levels
    new winston.transports.File({ filename: logFile }),
    // File — errors only
    new winston.transports.File({ filename: errorFile, level: 'error' }),
  ],
});

// ─── Client-scoped child logger ───────────────────────────────────────────────
export const clientLogger = (clientName) =>
  logger.child({ client: clientName });

export default logger;
