import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LogLevel, LoggerOptions } from '../types';

export class Logger {
  private static instance: Logger;
  private level: LogLevel = LogLevel.INFO;
  private logPath?: string;
  private printOnError: boolean = true;
  private logs: string[][] = [];
  private currentLog: string[] = [];
  private maxLogs: number = 10;
  private id?: number;
  private area?: string;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  configure(options?: LoggerOptions): void {
    if (options?.level !== undefined) {
      this.level = options.level;
    }
    if (options?.path !== undefined) {
      this.logPath = options.path || path.join(os.tmpdir(), '99.debug');
    }
    if (options?.printOnError !== undefined) {
      this.printOnError = options.printOnError;
    }
  }

  setId(id: number): Logger {
    const newLogger = Object.create(Logger.prototype);
    Object.assign(newLogger, this);
    newLogger.id = id;
    return newLogger;
  }

  setArea(area: string): Logger {
    const newLogger = Object.create(Logger.prototype);
    Object.assign(newLogger, this);
    newLogger.area = area;
    return newLogger;
  }

  private formatMessage(level: string, ...args: any[]): string {
    const prefix = [];
    if (this.id !== undefined) {
      prefix.push(`[${this.id}]`);
    }
    if (this.area) {
      prefix.push(`[${this.area}]`);
    }
    prefix.push(`[${level}]`);
    
    const parts = args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    });

    return `${prefix.join(' ')} ${parts.join(' ')}`;
  }

  private log(level: LogLevel, levelName: string, ...args: any[]): void {
    if (level < this.level) {
      return;
    }

    const message = this.formatMessage(levelName, ...args);
    this.currentLog.push(message);

    if (this.logPath) {
      try {
        fs.appendFileSync(this.logPath, message + '\n');
      } catch (err) {
        console.error('Failed to write to log file:', err);
      }
    }

    if (level >= LogLevel.ERROR && this.printOnError) {
      console.error(message);
    }
  }

  debug(...args: any[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', ...args);
  }

  info(...args: any[]): void {
    this.log(LogLevel.INFO, 'INFO', ...args);
  }

  warn(...args: any[]): void {
    this.log(LogLevel.WARN, 'WARN', ...args);
  }

  error(...args: any[]): void {
    this.log(LogLevel.ERROR, 'ERROR', ...args);
  }

  fatal(...args: any[]): void {
    this.log(LogLevel.FATAL, 'FATAL', ...args);
    throw new Error(args.join(' '));
  }

  assert(condition: boolean, ...args: any[]): void {
    if (!condition) {
      this.fatal('Assertion failed:', ...args);
    }
  }

  startRequest(): void {
    this.currentLog = [];
  }

  finishRequest(): void {
    if (this.currentLog.length > 0) {
      this.logs.unshift([...this.currentLog]);
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }
      this.currentLog = [];
    }
  }

  getLogs(): string[][] {
    return this.logs;
  }
}

export const logger = Logger.getInstance();
