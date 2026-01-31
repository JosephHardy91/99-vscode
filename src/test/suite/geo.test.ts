import * as assert from 'assert';
import * as vscode from 'vscode';
import { Geo } from '../../utils/geo';

suite('Geo Utils Test Suite', () => {
  test('Should convert between Point and Position', () => {
    const point = { row: 5, col: 10 };
    const position = Geo.positionFromPoint(point);
    
    assert.strictEqual(position.line, 5);
    assert.strictEqual(position.character, 10);
    
    const backToPoint = Geo.pointFromPosition(position);
    assert.strictEqual(backToPoint.row, 5);
    assert.strictEqual(backToPoint.col, 10);
  });

  test('Should convert VS Code Range to custom Range', () => {
    const vsRange = new vscode.Range(
      new vscode.Position(1, 2),
      new vscode.Position(3, 4)
    );
    
    // Create a mock document
    const mockDoc = {
      uri: vscode.Uri.file('/test/file.ts'),
      getText: () => 'test',
    } as vscode.TextDocument;
    
    const range = Geo.rangeFromVSCodeRange(vsRange, mockDoc);
    
    assert.strictEqual(range.start.row, 1);
    assert.strictEqual(range.start.col, 2);
    assert.strictEqual(range.end.row, 3);
    assert.strictEqual(range.end.col, 4);
  });

  test('Should convert custom Range to VS Code Range', () => {
    const range = {
      start: { row: 1, col: 2 },
      end: { row: 3, col: 4 },
    };
    
    const vsRange = Geo.vscodeRangeFromRange(range);
    
    assert.strictEqual(vsRange.start.line, 1);
    assert.strictEqual(vsRange.start.character, 2);
    assert.strictEqual(vsRange.end.line, 3);
    assert.strictEqual(vsRange.end.character, 4);
  });
});
