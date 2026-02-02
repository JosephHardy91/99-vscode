import * as assert from 'assert';
import { languageServiceManager } from '../../language/language-service';
import * as vscode from 'vscode';

suite('Language Service Test Suite', () => {
  test('Should detect TypeScript functions', async () => {
    const code = `function testFunc(a: number, b: string): void {
  console.log(a, b);
}`;
    
    // Create a mock document
    const mockDoc = {
      languageId: 'typescript',
      getText: () => code,
    } as vscode.TextDocument;
    
    const position = { row: 1, col: 2 };
    const functionInfo = languageServiceManager.detectFunction(mockDoc, position);
    
    assert.ok(functionInfo, 'Should detect function');
    assert.strictEqual(functionInfo?.name, 'testFunc');
    assert.strictEqual(functionInfo?.functionRange.start.row, 0);
  });

  test('Should detect arrow functions', async () => {
    const code = `const myFunc = (x: number) => {
  return x * 2;
}`;
    
    const mockDoc = {
      languageId: 'typescript',
      getText: () => code,
    } as vscode.TextDocument;
    
    const position = { row: 1, col: 2 };
    const functionInfo = languageServiceManager.detectFunction(mockDoc, position);
    
    assert.ok(functionInfo, 'Should detect arrow function');
    assert.strictEqual(functionInfo?.name, 'myFunc');
  });

  test('Should detect Lua functions', async () => {
    const code = `function test_func(a, b)
  print(a, b)
end`;
    
    const mockDoc = {
      languageId: 'lua',
      getText: () => code,
    } as vscode.TextDocument;
    
    const position = { row: 1, col: 2 };
    const functionInfo = languageServiceManager.detectFunction(mockDoc, position);
    
    assert.ok(functionInfo, 'Should detect Lua function');
    assert.strictEqual(functionInfo?.name, 'test_func');
  });

  test('Should return null for unsupported languages', () => {
    const mockDoc = {
      languageId: 'python',
      getText: () => 'def test(): pass',
    } as vscode.TextDocument;
    
    const position = { row: 0, col: 0 };
    const functionInfo = languageServiceManager.detectFunction(mockDoc, position);
    
    assert.strictEqual(functionInfo, null);
  });

  test('Should return null when no function is found', () => {
    const code = `const x = 5;
const y = 10;`;
    
    const mockDoc = {
      languageId: 'typescript',
      getText: () => code,
    } as vscode.TextDocument;
    
    const position = { row: 0, col: 0 };
    const functionInfo = languageServiceManager.detectFunction(mockDoc, position);
    
    assert.strictEqual(functionInfo, null);
  });
});
