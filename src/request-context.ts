import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { state } from './state';
import { logger } from './logger/logger';
import { Range, Rule } from './types';

export class RequestContext {
  xid: number;
  model: string;
  fullPath: string;
  tmpFile: string;
  operation?: string;
  range?: Range;
  logger: ReturnType<typeof logger.setId>;
  document: vscode.TextDocument;
  agentRules: Rule[] = [];

  constructor(xid: number, document: vscode.TextDocument) {
    this.xid = xid;
    this.model = state.model;
    this.document = document;
    this.fullPath = document.uri.fsPath;
    this.tmpFile = path.join(os.tmpdir(), `99-${xid}.tmp`);
    this.logger = logger.setId(xid);
  }

  addAgentRules(rules: Rule[]): void {
    this.agentRules.push(...rules);
  }

  getFileContent(): string {
    return this.document.getText();
  }

  getRangeContent(range: Range): string {
    const vsRange = new vscode.Range(
      new vscode.Position(range.start.row, range.start.col),
      new vscode.Position(range.end.row, range.end.col)
    );
    return this.document.getText(vsRange);
  }

  async findAgentMdFiles(): Promise<string[]> {
    const mdFiles: string[] = [];
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(this.document.uri);
    
    if (!workspaceFolder) {
      return mdFiles;
    }

    const rootPath = workspaceFolder.uri.fsPath;
    const filePath = this.document.uri.fsPath;
    const relativePath = path.relative(rootPath, filePath);
    const dirs = path.dirname(relativePath).split(path.sep);

    // Walk up the directory tree looking for MD files
    for (let i = dirs.length; i >= 0; i--) {
      const checkPath = path.join(rootPath, ...dirs.slice(0, i));
      for (const mdFileName of state.mdFiles) {
        const mdFilePath = path.join(checkPath, mdFileName);
        if (fs.existsSync(mdFilePath)) {
          mdFiles.push(mdFilePath);
        }
      }
    }

    return mdFiles;
  }

  static fromActiveEditor(xid: number): RequestContext | null {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }
    return new RequestContext(xid, editor.document);
  }
}
