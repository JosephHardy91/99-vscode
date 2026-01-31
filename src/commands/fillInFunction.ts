import * as vscode from 'vscode';
import { OpsOptions } from '../types';
import { logger } from '../logger/logger';
import { getId } from '../utils/id';
import { RequestContext } from '../request-context';
import { state } from '../state';
import { Geo } from '../utils/geo';
import { languageServiceManager } from '../language/language-service';
import { Request } from '../request/request';
import { prompts } from '../prompt-settings';

export async function fillInFunction(opts?: OpsOptions): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const xid = getId();
  const context = RequestContext.fromActiveEditor(xid);
  
  if (!context) {
    vscode.window.showErrorMessage('Could not create request context');
    return;
  }

  context.operation = 'fill_in_function';
  const l = context.logger.setArea('fillInFunction');
  l.debug('start');

  const position = Geo.getCurrentPosition();
  const functionInfo = languageServiceManager.detectFunction(editor.document, position);

  if (!functionInfo) {
    vscode.window.showErrorMessage('No function found at cursor position');
    l.error('fill_in_function: unable to find any containing function');
    return;
  }

  context.range = functionInfo.functionRange;
  l.debug('found function', 'name', functionInfo.name, 'range', functionInfo.functionRange);

  // Track the request
  state.trackRequest(xid, 'fill_in_function', context.fullPath, position.row, position.col);

  // Create the request
  const request = new Request(context);
  let fullPrompt = prompts.fillInFunction();

  // Add additional prompt if provided
  if (opts?.additionalPrompt) {
    fullPrompt = prompts.prompt(opts.additionalPrompt, fullPrompt);
  }

  // Add function context to prompt
  const functionText = context.getRangeContent(functionInfo.functionRange);
  fullPrompt += `\n\nFunction to implement:\n\`\`\`${editor.document.languageId}\n${functionText}\n\`\`\``;

  request.addPromptContent(fullPrompt);

  // Show progress
  const progressOptions: vscode.ProgressOptions = {
    location: vscode.ProgressLocation.Notification,
    title: '99: Filling in function',
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
                'Error encountered while processing fill_in_function\n' +
                  (response || 'No Error text provided. Check logs')
              );
            }
            l.error('unable to fill in function, enable and check logger for more details');
          } else if (status === 'cancelled') {
            l.debug('fill_in_function was cancelled');
            vscode.window.showInformationMessage('Request cancelled');
          } else if (status === 'success') {
            // Replace the function with the AI response
            const vsRange = new vscode.Range(
              new vscode.Position(functionInfo.functionRange.start.row, functionInfo.functionRange.start.col),
              new vscode.Position(functionInfo.functionRange.end.row, functionInfo.functionRange.end.col)
            );

            await editor.edit(editBuilder => {
              editBuilder.replace(vsRange, response);
            });

            vscode.window.showInformationMessage('Function implemented successfully');
          }

          resolve();
        },
      });
    });
  });
}

export async function fillInFunctionPrompt(): Promise<void> {
  const prompt = await vscode.window.showInputBox({
    prompt: 'Enter additional instructions for AI (use @ to reference skills)',
    placeHolder: 'e.g., @testing add unit tests',
  });

  if (prompt === undefined) {
    return;
  }

  const opts: OpsOptions = {
    additionalPrompt: prompt,
  };

  await fillInFunction(opts);
}
