import { BaseProvider, RequestContext as ProviderRequestContext } from '../../providers/base';
import { Observer } from '../../types';
import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';

export class MockProvider extends BaseProvider {
  private mockResponse: string;
  private shouldFail: boolean;
  private delay: number;

  constructor(mockResponse: string = 'mock implementation', shouldFail: boolean = false, delay: number = 100) {
    super();
    this.mockResponse = mockResponse;
    this.shouldFail = shouldFail;
    this.delay = delay;
  }

  protected buildCommand(_query: string, _context: ProviderRequestContext): string[] {
    // Return a mock command that won't actually run
    return ['echo', 'mock'];
  }

  protected getProviderName(): string {
    return 'MockProvider';
  }

  // Override makeRequest for testing
  makeRequest(
    _query: string,
    context: ProviderRequestContext,
    observer?: Observer,
    _cancelledCheck?: () => boolean
  ): ChildProcess {
    const obs = observer || {
      onStdout: () => {},
      onStderr: () => {},
      onComplete: () => {},
    };

    // Write mock response to temp file
    setTimeout(() => {
      if (this.shouldFail) {
        obs.onComplete('failed', 'Mock error');
      } else {
        fs.writeFileSync(context.tmpFile, this.mockResponse);
        obs.onStdout('Processing...\n');
        setTimeout(() => {
          obs.onComplete('success', this.mockResponse);
        }, this.delay);
      }
    }, 10);

    // Return a fake process
    return spawn('echo', ['mock']);
  }
}
