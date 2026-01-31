import { State, CompletionConfig, Rules, RequestEntry, ActiveRequest } from './types';
import { logger } from './logger/logger';
import { now } from './utils/id';
import { Agents } from './extensions/agents';

export class NinetyNineState implements State {
  model: string = 'opencode/claude-sonnet-4-5';
  mdFiles: string[] = [];
  aiStdoutRows: number = 3;
  languages: string[] = ['typescript', 'lua', 'go', 'java', 'cpp', 'ruby'];
  displayErrors: boolean = false;
  autoAddSkills: boolean = false;
  providerOverride?: any = undefined;
  completion: CompletionConfig = { customRules: [] };
  rules: Rules = { custom: [], byName: new Map() };
  activeRequests: Map<number, ActiveRequest> = new Map();
  viewLogIdx: number = 0;
  requestHistory: RequestEntry[] = [];
  requestById: Map<number, RequestEntry> = new Map();

  private activeRequestId: number = 0;

  trackRequest(id: number, operation: string, filename: string, lnum: number, col: number): RequestEntry {
    const entry: RequestEntry = {
      id,
      operation,
      status: 'running',
      filename,
      lnum,
      col,
      startedAt: now(),
    };
    this.requestHistory.push(entry);
    this.requestById.set(entry.id, entry);
    return entry;
  }

  finishRequest(id: number, status: 'success' | 'failed' | 'cancelled'): void {
    const entry = this.requestById.get(id);
    if (entry) {
      entry.status = status;
    }
  }

  removeRequest(id: number): void {
    const index = this.requestHistory.findIndex(e => e.id === id);
    if (index !== -1) {
      this.requestHistory.splice(index, 1);
    }
    this.requestById.delete(id);
  }

  previousRequestCount(): number {
    return this.requestHistory.filter(e => e.status !== 'running').length;
  }

  clearPreviousRequests(): void {
    this.requestHistory = this.requestHistory.filter(e => {
      if (e.status === 'running') {
        return true;
      }
      this.requestById.delete(e.id);
      return false;
    });
  }

  addActiveRequest(cleanUp: () => void, requestId: number): number {
    this.activeRequestId++;
    logger.debug('adding active request', 'id', this.activeRequestId);
    this.activeRequests.set(this.activeRequestId, {
      cleanUp,
      requestId,
    });
    return this.activeRequestId;
  }

  activeRequestCount(): number {
    return this.activeRequests.size;
  }

  removeActiveRequest(id: number): void {
    const l = logger.setId(id);
    const r = this.activeRequests.get(id);
    l.assert(!!r, 'there is no active request for id. implementation broken');
    l.debug('removing active request');
    this.activeRequests.delete(id);
  }

  refreshRules(): void {
    this.rules = Agents.loadRules();
  }
}

export const state = new NinetyNineState();
