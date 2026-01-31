import * as vscode from 'vscode';
import { OpsOptions } from '../types';
import { logger } from '../logger/logger';
import { Geo } from '../utils/geo';

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

  logger.debug('visual called', 'selection', selection);

  // TODO: Implement full visual selection processing with AI
  vscode.window.showInformationMessage('Visual selection processing - implementation in progress');
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
