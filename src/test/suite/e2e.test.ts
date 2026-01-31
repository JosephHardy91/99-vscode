import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

suite('E2E User Flow Tests', () => {
  let testWorkspace: string;
  let testFile: string;

  setup(async () => {
    // Create temporary workspace
    testWorkspace = path.join(os.tmpdir(), 'test-99-workspace');
    fs.mkdirSync(testWorkspace, { recursive: true });
    
    testFile = path.join(testWorkspace, 'test.ts');
    
    // Write test TypeScript file
    const testCode = `function add(a: number, b: number): number {
  // TODO: implement
}

function multiply(x: number, y: number): number {
  // TODO: implement
}`;
    
    fs.writeFileSync(testFile, testCode);
  });

  teardown(() => {
    // Clean up
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  test('Extension should be activated', async () => {
    const extension = vscode.extensions.getExtension('JosephHardy91.99');
    assert.ok(extension, 'Extension should be installed');
    
    await extension?.activate();
    assert.ok(extension?.isActive, 'Extension should be active');
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands();
    
    assert.ok(commands.includes('99.fillInFunction'), 'fillInFunction command should be registered');
    assert.ok(commands.includes('99.visual'), 'visual command should be registered');
    assert.ok(commands.includes('99.stopAllRequests'), 'stopAllRequests command should be registered');
    assert.ok(commands.includes('99.viewLogs'), 'viewLogs command should be registered');
    assert.ok(commands.includes('99.info'), 'info command should be registered');
  });

  test('Configuration should have correct defaults', () => {
    const config = vscode.workspace.getConfiguration('99');
    
    assert.strictEqual(config.get('model'), 'opencode/claude-sonnet-4-5');
    assert.strictEqual(config.get('logger.level'), 'info');
    assert.strictEqual(config.get('logger.printOnError'), true);
    assert.strictEqual(config.get('displayErrors'), false);
    assert.strictEqual(config.get('aiStdoutRows'), 3);
  });

  test('Should open test file and detect language', async () => {
    const doc = await vscode.workspace.openTextDocument(testFile);
    const editor = await vscode.window.showTextDocument(doc);
    
    assert.strictEqual(doc.languageId, 'typescript');
    assert.ok(editor, 'Editor should be opened');
  });

  test('Stop all requests command should execute without errors', async () => {
    try {
      await vscode.commands.executeCommand('99.stopAllRequests');
      assert.ok(true, 'Command executed successfully');
    } catch (err) {
      assert.fail(`Command failed: ${err}`);
    }
  });

  test('Info command should execute without errors', async () => {
    try {
      await vscode.commands.executeCommand('99.info');
      assert.ok(true, 'Info command executed successfully');
    } catch (err) {
      assert.fail(`Info command failed: ${err}`);
    }
  });

  test('View logs command should execute without errors', async () => {
    try {
      await vscode.commands.executeCommand('99.viewLogs');
      // Should either show logs or message about no logs
      assert.ok(true, 'View logs command executed successfully');
    } catch (err) {
      assert.fail(`View logs command failed: ${err}`);
    }
  });
});
