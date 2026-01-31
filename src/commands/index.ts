import * as vscode from 'vscode';
import { fillInFunction, fillInFunctionPrompt } from './fillInFunction';
import { visual, visualPrompt } from './visual';
import { stopAllRequests } from './stopAllRequests';
import { viewLogs, prevRequestLogs, nextRequestLogs } from './viewLogs';
import { info } from './info';

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('99.fillInFunction', fillInFunction),
    vscode.commands.registerCommand('99.fillInFunctionPrompt', fillInFunctionPrompt),
    vscode.commands.registerCommand('99.visual', visual),
    vscode.commands.registerCommand('99.visualPrompt', visualPrompt),
    vscode.commands.registerCommand('99.stopAllRequests', stopAllRequests),
    vscode.commands.registerCommand('99.viewLogs', viewLogs),
    vscode.commands.registerCommand('99.prevRequestLogs', prevRequestLogs),
    vscode.commands.registerCommand('99.nextRequestLogs', nextRequestLogs),
    vscode.commands.registerCommand('99.info', info)
  );
}
