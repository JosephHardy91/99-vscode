import * as vscode from 'vscode';
import { OpsOptions } from '../types';
import { logger } from '../logger/logger';

export async function fillInFunction(opts?: OpsOptions): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  logger.debug('fillInFunction called');
  
  // TODO: Implement full function detection and AI filling
  vscode.window.showInformationMessage('Fill in function - implementation in progress');
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
