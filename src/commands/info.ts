import * as vscode from 'vscode';
import { state } from '../state';

export async function info(): Promise<void> {
  const info: string[] = [];
  
  state.refreshRules();
  
  info.push(`Previous Requests: ${state.previousRequestCount()}`);
  info.push(`Custom rules (${state.rules.custom.length}):`);
  
  for (const rule of state.rules.custom) {
    info.push(`* ${rule.name}`);
  }

  const message = info.join('\n');
  vscode.window.showInformationMessage(message, { modal: true });
}
