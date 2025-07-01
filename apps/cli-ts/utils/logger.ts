import winston from 'winston';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Stack-based caller context
function getCallerContext(): string {
  const originalFunc = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  const stack = err.stack as unknown as NodeJS.CallSite[];
  Error.prepareStackTrace = originalFunc;

  if (stack && stack.length >= 4) {
    const caller = stack[3];
    if (caller && typeof caller.getFileName === 'function') {
      const absFileName = caller.getFileName() || 'unknown';
      const relFileName = path.relative(process.cwd(), absFileName);
      const funcName = caller.getFunctionName?.() || '<anonymous>';
      return `${relFileName}.${funcName}`;
    }
  }

  return 'unknown.unknown';
}

// Winston file logger (no console output)
const baseLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ level, message, timestamp }) => {
      const context = getCallerContext();
      return `${timestamp} - ${context} - ${level.toUpperCase()} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'app.log') }),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
  ],
});

// Console color mapping
const formatConsoleLog = (level: string, message: string): string => {
  const timestamp = new Date().toISOString();
  const context = getCallerContext();
  const prefix = `${timestamp} - ${context} - ${level.toUpperCase()} -`;

  switch (level) {
    case 'info': return chalk.blue(prefix) + ' ' + chalk.white(message);
    case 'warn': return chalk.yellow(prefix) + ' ' + chalk.yellow(message);
    case 'error': return chalk.red(prefix) + ' ' + chalk.redBright(message);
    case 'debug': return chalk.gray(prefix) + ' ' + chalk.dim(message);
    case 'time': return chalk.green(prefix) + ' ' + chalk.greenBright(message);
    default: return prefix + ' ' + message;
  }
};

// Timers for measuring duration
const timers: Record<string, [number, number]> = {};

function logWithConsole(level: 'info' | 'warn' | 'error' | 'debug' | 'time', message: string, printToConsole = false) {
  baseLogger.log({ level: level === 'time' ? 'info' : level, message });
  if (printToConsole) {
    console.log(formatConsoleLog(level, message));
  }
}

// Main logger object
const logger = {
  info: (msg: string, printToConsole = false) => logWithConsole('info', msg, printToConsole),
  warn: (msg: string, printToConsole = false) => logWithConsole('warn', msg, printToConsole),
  error: (msg: string, printToConsole = false) => logWithConsole('error', msg, printToConsole),
  debug: (msg: string, printToConsole = false) => logWithConsole('debug', msg, printToConsole),

  time: (label: string) => {
    timers[label] = process.hrtime();
  },

  timeEnd: (label: string, printToConsole = false) => {
    const start = timers[label];
    if (!start) return;
    const diff = process.hrtime(start);
    const duration = (diff[0] * 1e9 + diff[1]) / 1e6;
    logWithConsole('time', `${label} completed in ${duration.toFixed(2)} ms`, printToConsole);
    delete timers[label];
  },
};

export default logger;
