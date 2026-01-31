import * as vscode from 'vscode';
import { logger } from '../logger/logger';
import { state } from '../state';

export async function viewLogs(): Promise<void> {
  state.viewLogIdx = 0;
  const logs = logger.getLogs();
  
  if (logs.length === 0) {
    vscode.window.showInformationMessage('No logs to display');
    return;
  }

  const content = logs[0].join('\n');
  const doc = await vscode.workspace.openTextDocument({
    content,
    language: 'log',
  });
  await vscode.window.showTextDocument(doc, { preview: false });
}

export async function prevRequestLogs(): Promise<void> {
  const logs = logger.getLogs();
  
  if (logs.length === 0) {
    vscode.window.showInformationMessage('No logs to display');
    return;
  }

  state.viewLogIdx = Math.min(state.viewLogIdx + 1, logs.length - 1);
  const content = logs[state.viewLogIdx].join('\n');
  const doc = await vscode.workspace.openTextDocument({
    content,
    language: 'log',
  });
  await vscode.window.showTextDocument(doc, { preview: false });
}

export async function nextRequestLogs(): Promise<void> {
  const logs = logger.getLogs();
  
  if (logs.length === 0) {
    vscode.window.showInformationMessage('No logs to display');
    return;
  }

  state.viewLogIdx = Math.max(state.viewLogIdx - 1, 0);
  const content = logs[state.viewLogIdx].join('\n');
  const doc = await vscode.workspace.openTextDocument({
    content,
    language: 'log',
  });
  await vscode.window.showTextDocument(doc, { preview: false });
}
