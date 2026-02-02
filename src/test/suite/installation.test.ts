import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

suite('Installation Artifacts Test Suite', () => {
  const projectRoot = path.resolve(__dirname, '../../../');

  test('package.json should have required fields', () => {
    const packagePath = path.join(projectRoot, 'package.json');
    assert.ok(fs.existsSync(packagePath), 'package.json should exist');
    
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    assert.strictEqual(pkg.name, '99');
    assert.strictEqual(pkg.displayName, '99 - AI Code Assistant');
    assert.ok(pkg.version, 'Should have version');
    assert.ok(pkg.engines?.vscode, 'Should specify VS Code engine version');
    assert.strictEqual(pkg.main, './out/extension.js');
    assert.ok(pkg.contributes, 'Should have contributes section');
  });

  test('package.json should have all required commands', () => {
    const packagePath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    const commands = pkg.contributes.commands;
    const commandIds = commands.map((c: any) => c.command);
    
    assert.ok(commandIds.includes('99.fillInFunction'));
    assert.ok(commandIds.includes('99.fillInFunctionPrompt'));
    assert.ok(commandIds.includes('99.visual'));
    assert.ok(commandIds.includes('99.visualPrompt'));
    assert.ok(commandIds.includes('99.stopAllRequests'));
    assert.ok(commandIds.includes('99.viewLogs'));
    assert.ok(commandIds.includes('99.prevRequestLogs'));
    assert.ok(commandIds.includes('99.nextRequestLogs'));
    assert.ok(commandIds.includes('99.info'));
  });

  test('package.json should have keybindings configured', () => {
    const packagePath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    const keybindings = pkg.contributes.keybindings;
    assert.ok(keybindings.length >= 3, 'Should have at least 3 keybindings');
    
    const fillInFunctionBinding = keybindings.find((k: any) => k.command === '99.fillInFunction');
    assert.ok(fillInFunctionBinding, 'Should have fillInFunction keybinding');
    assert.ok(fillInFunctionBinding.key, 'Should have key defined');
  });

  test('package.json should have configuration schema', () => {
    const packagePath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    const config = pkg.contributes.configuration;
    assert.ok(config, 'Should have configuration');
    assert.ok(config.properties, 'Should have configuration properties');
    
    assert.ok(config.properties['99.model']);
    assert.ok(config.properties['99.logger.level']);
    assert.ok(config.properties['99.completion.customRules']);
    assert.ok(config.properties['99.mdFiles']);
  });

  test('tsconfig.json should exist and be valid', () => {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    assert.ok(fs.existsSync(tsconfigPath), 'tsconfig.json should exist');
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    assert.strictEqual(tsconfig.compilerOptions.module, 'commonjs');
    assert.strictEqual(tsconfig.compilerOptions.outDir, 'out');
    assert.ok(tsconfig.compilerOptions.strict, 'Should have strict mode enabled');
  });

  test('README-VSCODE.md should exist', () => {
    const readmePath = path.join(projectRoot, 'README-VSCODE.md');
    assert.ok(fs.existsSync(readmePath), 'README-VSCODE.md should exist');
    
    const content = fs.readFileSync(readmePath, 'utf-8');
    assert.ok(content.includes('Installation'), 'Should have installation instructions');
    assert.ok(content.includes('Usage'), 'Should have usage instructions');
    assert.ok(content.includes('Commands'), 'Should document commands');
  });

  test('LICENSE file should exist', () => {
    const licensePath = path.join(projectRoot, 'LICENSE');
    assert.ok(fs.existsSync(licensePath), 'LICENSE file should exist');
  });

  test('Extension should compile without errors', () => {
    const outPath = path.join(projectRoot, 'out', 'extension.js');
    assert.ok(fs.existsSync(outPath), 'Compiled extension.js should exist');
  });

  test('.vscodeignore should exist and be properly configured', () => {
    const vscodeignorePath = path.join(projectRoot, '.vscodeignore');
    assert.ok(fs.existsSync(vscodeignorePath), '.vscodeignore should exist');
    
    const content = fs.readFileSync(vscodeignorePath, 'utf-8');
    assert.ok(content.includes('src/**'), 'Should exclude source files');
    assert.ok(content.includes('node_modules'), 'Should exclude node_modules');
    assert.ok(content.includes('**/*.map'), 'Should exclude source maps');
  });

  test('Compiled output directory should exist', () => {
    const outPath = path.join(projectRoot, 'out');
    assert.ok(fs.existsSync(outPath), 'out directory should exist');
    
    const files = fs.readdirSync(outPath);
    assert.ok(files.length > 0, 'Should have compiled files');
  });
});
