import * as vscode from 'vscode';
import { Point, Range } from '../types';

export class Geo {
  static pointFromPosition(position: vscode.Position): Point {
    return {
      row: position.line,
      col: position.character,
    };
  }

  static positionFromPoint(point: Point): vscode.Position {
    return new vscode.Position(point.row, point.col);
  }

  static rangeFromVSCodeRange(range: vscode.Range, document: vscode.TextDocument): Range {
    return {
      start: this.pointFromPosition(range.start),
      end: this.pointFromPosition(range.end),
      buffer: document,
    };
  }

  static vscodeRangeFromRange(range: Range): vscode.Range {
    return new vscode.Range(
      this.positionFromPoint(range.start),
      this.positionFromPoint(range.end)
    );
  }

  static getCurrentPosition(): Point {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return { row: 0, col: 0 };
    }
    return this.pointFromPosition(editor.selection.active);
  }

  static getVisualSelection(): Range | null {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      return null;
    }
    return this.rangeFromVSCodeRange(editor.selection, editor.document);
  }
}
