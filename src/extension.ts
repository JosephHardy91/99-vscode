import * as vscode from 'vscode';
import { state } from './state';
import { logger } from './logger/logger';
import { LogLevel } from './types';
import { registerCommands } from './commands';
import { registerCompletionProvider } from './extensions/completion';

export function activate(context: vscode.ExtensionContext): void {
  console.log('99 extension is now active');

  // Load configuration
  const config = vscode.workspace.getConfiguration('99');
  
  // Configure logger
  const logLevel = config.get<string>('logger.level', 'info');
  const logPath = config.get<string>('logger.path', '');
  const printOnError = config.get<boolean>('logger.printOnError', true);
  
  const levelMap: Record<string, LogLevel> = {
    debug: LogLevel.DEBUG,
    info: LogLevel.INFO,
    warn: LogLevel.WARN,
    error: LogLevel.ERROR,
    fatal: LogLevel.FATAL,
  };

  logger.configure({
    level: levelMap[logLevel] || LogLevel.INFO,
    path: logPath || undefined,
    printOnError,
  });

  // Configure state
  state.model = config.get<string>('model', 'opencode/claude-sonnet-4-5');
  state.mdFiles = config.get<string[]>('mdFiles', ['AGENT.md']);
  state.displayErrors = config.get<boolean>('displayErrors', false);
  state.aiStdoutRows = config.get<number>('aiStdoutRows', 3);
  state.completion.customRules = config.get<string[]>('completion.customRules', []);

  // Refresh rules
  state.refreshRules();

  // Register commands
  registerCommands(context);

  // Register completion provider for @ skills
  registerCompletionProvider(context);

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('99')) {
        const newConfig = vscode.workspace.getConfiguration('99');
        state.model = newConfig.get<string>('model', state.model);
        state.mdFiles = newConfig.get<string[]>('mdFiles', state.mdFiles);
        state.displayErrors = newConfig.get<boolean>('displayErrors', state.displayErrors);
        state.aiStdoutRows = newConfig.get<number>('aiStdoutRows', state.aiStdoutRows);
        state.completion.customRules = newConfig.get<string[]>('completion.customRules', []);
        state.refreshRules();
      }
    })
  );

  logger.info('99 extension activated');
}

export function deactivate(): void {
  // Stop all active requests
  for (const [, activeRequest] of state.activeRequests) {
    state.removeRequest(activeRequest.requestId);
    activeRequest.cleanUp();
  }
  state.activeRequests.clear();
  
  logger.info('99 extension deactivated');
}
