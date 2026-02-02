import * as vscode from 'vscode';

export interface Point {
  row: number;
  col: number;
}

export interface Range {
  start: Point;
  end: Point;
  buffer?: vscode.TextDocument;
}

export interface Rule {
  name: string;
  path: string;
}

export interface Rules {
  custom: Rule[];
  byName: Map<string, Rule[]>;
}

export interface CompletionConfig {
  source?: string;
  customRules: string[];
}

export interface LoggerOptions {
  level?: LogLevel;
  path?: string;
  printOnError?: boolean;
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface RequestEntry {
  id: number;
  operation: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  filename: string;
  lnum: number;
  col: number;
  startedAt: number;
}

export interface ActiveRequest {
  cleanUp: () => void;
  requestId: number;
}

export interface State {
  model: string;
  mdFiles: string[];
  aiStdoutRows: number;
  languages: string[];
  displayErrors: boolean;
  autoAddSkills: boolean;
  providerOverride?: any;
  completion: CompletionConfig;
  rules: Rules;
  activeRequests: Map<number, ActiveRequest>;
  viewLogIdx: number;
  requestHistory: RequestEntry[];
  requestById: Map<number, RequestEntry>;
}

export interface OpsOptions {
  additionalRules?: Rule[];
  additionalPrompt?: string;
}

export type ResponseState = 'success' | 'failed' | 'cancelled';

export interface Observer {
  onStdout: (line: string) => void;
  onStderr: (line: string) => void;
  onComplete: (status: ResponseState, response: string) => void;
}
