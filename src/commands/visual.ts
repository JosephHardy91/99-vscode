import * as vscode from 'vscode';
import { OpsOptions } from '../types';
import { logger } from '../logger/logger';
import { Geo } from '../utils/geo';
import { getId } from '../utils/id';
import { RequestContext } from '../request-context';
import { state } from '../state';
import { Request } from '../request/request';
import { prompts } from '../prompt-settings';

export async function visual(opts?: OpsOptions): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const selection = Geo.getVisualSelection();
  if (!selection) {
    vscode.window.showErrorMessage('No text selected');
    return;
  }

  const xid = getId();
  const context = RequestContext.fromActiveEditor(xid);
  
  if (!context) {
    vscode.window.showErrorMessage('Could not create request context');
    return;
  }

  context.operation = 'over-range';
  context.range = selection;
  const l = context.logger.setArea('visual');
  l.debug('start', 'selection', selection);

  // Track the request
  state.trackRequest(xid, 'over-range', context.fullPath, selection.start.row, selection.start.col);

  // Create the request
  const request = new Request(context);
  let fullPrompt = prompts.visualSelection(selection);

  // Add additional prompt if provided
  if (opts?.additionalPrompt) {
    fullPrompt = prompts.prompt(opts.additionalPrompt, fullPrompt);
  }

  // Add selection context to prompt
  const selectionText = context.getRangeContent(selection);
  fullPrompt += `\n\nSelected code:\n\`\`\`${editor.document.languageId}\n${selectionText}\n\`\`\``;

  request.addPromptContent(fullPrompt);

  // Show progress
  const progressOptions: vscode.ProgressOptions = {
    location: vscode.ProgressLocation.Notification,
    title: '99: Processing selection',
    cancellable: true,
  };

  await vscode.window.withProgress(progressOptions, async (progress, token) => {
    // Handle cancellation
    token.onCancellationRequested(() => {
      request.cancel();
      state.finishRequest(xid, 'cancelled');
    });

    // Create cleanup function
    const cleanUp = () => {
      state.removeActiveRequest(xid);
    };

    state.addActiveRequest(cleanUp, xid);

    return new Promise<void>((resolve) => {
      request.start({
        onStdout: (line: string) => {
          l.debug('on_stdout', 'line', line);
          progress.report({ message: 'Processing...' });
        },
        onStderr: (line: string) => {
          l.debug('on_stderr', 'line', line);
        },
        onComplete: async (status: string, response: string) => {
          l.info('on_complete', 'status', status);
          cleanUp();

          if (status === 'failed') {
            if (state.displayErrors) {
              vscode.window.showErrorMessage(
                'Error encountered while processing selection\n' +
                  (response || 'No Error text provided. Check logs')
              );
            }
            l.error('unable to process selection, enable and check logger for more details');
          } else if (status === 'cancelled') {
            l.debug('visual selection was cancelled');
            vscode.window.showInformationMessage('Request cancelled');
          } else if (status === 'success') {
            // Replace the selection with the AI response
            await editor.edit(editBuilder => {
              editBuilder.replace(editor.selection, response);
            });

            vscode.window.showInformationMessage('Selection processed successfully');
          }

          resolve();
        },
      });
    });
  });
}

export async function visualPrompt(): Promise<void> {
  const prompt = await vscode.window.showInputBox({
    prompt: 'Enter additional instructions for AI (use @ to reference skills)',
    placeHolder: 'e.g., @refactor improve this code',
  });

  if (prompt === undefined) {
    return;
  }

  const opts: OpsOptions = {
    additionalPrompt: prompt,
  };

  await visual(opts);
}
