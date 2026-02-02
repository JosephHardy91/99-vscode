import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import { Observer, ResponseState } from '../types';
import { logger } from '../logger/logger';

export interface RequestContext {
  model: string;
  tmpFile: string;
  xid: number;
}

function once(fn: (...args: any[]) => void): (...args: any[]) => void {
  let called = false;
  return (...args: any[]) => {
    if (called) {
      return;
    }
    called = true;
    fn(...args);
  };
}

export abstract class BaseProvider {
  protected abstract buildCommand(query: string, context: RequestContext): string[];
  protected abstract getProviderName(): string;

  protected retrieveResponse(tmpFile: string): [boolean, string] {
    try {
      const result = fs.readFileSync(tmpFile, 'utf-8');
      logger.debug('retrieve_results', 'results', result);
      return [true, result];
    } catch (err) {
      logger.error('retrieve_results: failed to read file', 'tmp_name', tmpFile, 'error', err);
      return [false, ''];
    }
  }

  makeRequest(
    query: string,
    context: RequestContext,
    observer?: Observer,
    cancelledCheck?: () => boolean
  ): ChildProcess {
    const l = logger.setId(context.xid).setArea(this.getProviderName());
    l.debug('make_request', 'tmp_file', context.tmpFile);

    const devNullObserver: Observer = {
      onStdout: () => {},
      onStderr: () => {},
      onComplete: () => {},
    };

    const obs = observer || devNullObserver;
    const onceComplete = once((status: ResponseState, text: string) => {
      obs.onComplete(status, text);
    });

    const command = this.buildCommand(query, context);
    l.debug('make_request', 'command', command);

    const proc = spawn(command[0], command.slice(1), {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const isCancelled = cancelledCheck || (() => false);

    proc.stdout?.on('data', (data: Buffer) => {
      const str = data.toString();
      l.debug('stdout', 'data', str);
      if (isCancelled()) {
        onceComplete('cancelled', '');
        return;
      }
      obs.onStdout(str);
    });

    proc.stderr?.on('data', (data: Buffer) => {
      const str = data.toString();
      l.debug('stderr', 'data', str);
      if (isCancelled()) {
        onceComplete('cancelled', '');
        return;
      }
      obs.onStderr(str);
    });

    proc.on('close', (code: number | null) => {
      if (isCancelled()) {
        onceComplete('cancelled', '');
        l.debug('on_complete: request has been cancelled');
        return;
      }

      if (code !== 0) {
        const str = `process exit code: ${code}`;
        onceComplete('failed', str);
        l.fatal(this.getProviderName() + ' make_query failed', 'exit_code', code);
      } else {
        const [ok, res] = this.retrieveResponse(context.tmpFile);
        if (ok) {
          onceComplete('success', res);
        } else {
          onceComplete('failed', 'unable to retrieve response from temp file');
        }
      }
    });

    return proc;
  }
}

export class OpenCodeProvider extends BaseProvider {
  protected buildCommand(query: string, context: RequestContext): string[] {
    return ['opencode', 'run', '-m', context.model, query];
  }

  protected getProviderName(): string {
    return 'OpenCodeProvider';
  }

  static getDefaultModel(): string {
    return 'opencode/claude-sonnet-4-5';
  }
}

export class ClaudeCodeProvider extends BaseProvider {
  protected buildCommand(query: string, context: RequestContext): string[] {
    return [
      'claude',
      '--dangerously-skip-permissions',
      '--model',
      context.model,
      '--print',
      query,
    ];
  }

  protected getProviderName(): string {
    return 'ClaudeCodeProvider';
  }

  static getDefaultModel(): string {
    return 'claude-sonnet-4-5';
  }
}
