import { ChildProcess } from 'child_process';
import { RequestContext } from '../request-context';
import { Observer, ResponseState } from '../types';
import { logger } from '../logger/logger';
import { OpenCodeProvider } from '../providers/base';
import { state } from '../state';

export class Request {
  context: RequestContext;
  logger: ReturnType<typeof logger.setId>;
  private cancelled: boolean = false;
  private process?: ChildProcess;
  private prompt: string = '';

  constructor(context: RequestContext) {
    this.context = context;
    this.logger = context.logger.setArea('Request');
  }

  addPromptContent(content: string): void {
    this.prompt += content;
  }

  cancel(): void {
    this.cancelled = true;
    if (this.process) {
      this.process.kill();
    }
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  start(observer: Observer): void {
    logger.startRequest();
    
    const provider = state.providerOverride || new OpenCodeProvider();
    const requestContext = {
      model: this.context.model,
      tmpFile: this.context.tmpFile,
      xid: this.context.xid,
    };

    this.logger.debug('Starting request', 'prompt', this.prompt);

    this.process = provider.makeRequest(
      this.prompt,
      requestContext,
      {
        onStdout: (line: string) => {
          if (!this.cancelled) {
            observer.onStdout(line);
          }
        },
        onStderr: (line: string) => {
          if (!this.cancelled) {
            observer.onStderr(line);
          }
        },
        onComplete: (status: ResponseState, response: string) => {
          logger.finishRequest();
          state.finishRequest(this.context.xid, status);
          observer.onComplete(status, response);
        },
      },
      () => this.cancelled
    );
  }
}
