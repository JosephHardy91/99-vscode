import * as vscode from 'vscode';
import { state } from '../state';
import { Agents } from '../extensions/agents';

export class SkillCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.CompletionItem[] | undefined {
    // Check if the character before the cursor is '@'
    const lineText = document.lineAt(position.line).text;
    const textBeforeCursor = lineText.substring(0, position.character);
    
    if (!textBeforeCursor.endsWith('@') && !textBeforeCursor.match(/@\w*$/)) {
      return undefined;
    }

    // Get all rules
    state.refreshRules();
    const rules = Agents.rulesToItems(state.rules);

    // Convert rules to completion items
    const items: vscode.CompletionItem[] = rules.map(rule => {
      const item = new vscode.CompletionItem(rule.name, vscode.CompletionItemKind.Reference);
      item.detail = 'Skill';
      item.documentation = new vscode.MarkdownString(`Rule from: \`${rule.path}\``);
      item.insertText = rule.name;
      return item;
    });

    return items;
  }
}

export function registerCompletionProvider(context: vscode.ExtensionContext): void {
  // Register for input boxes and quick pick prompts
  // Note: VS Code doesn't support completion in input boxes directly,
  // so this primarily works in text documents
  const provider = new SkillCompletionProvider();
  
  const selector: vscode.DocumentSelector = [
    { scheme: 'file', language: 'typescript' },
    { scheme: 'file', language: 'javascript' },
    { scheme: 'file', language: 'lua' },
    { scheme: 'file', language: 'go' },
    { scheme: 'file', language: 'java' },
    { scheme: 'file', language: 'cpp' },
    { scheme: 'file', language: 'ruby' },
  ];

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(selector, provider, '@')
  );
}
