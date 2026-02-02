import * as vscode from 'vscode';
import { state } from '../state';

export async function stopAllRequests(): Promise<void> {
  for (const [, activeRequest] of state.activeRequests) {
    state.removeRequest(activeRequest.requestId);
    activeRequest.cleanUp();
  }
  state.activeRequests.clear();
  
  vscode.window.showInformationMessage('All 99 requests stopped');
}
