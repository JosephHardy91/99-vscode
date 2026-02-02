import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

suite('Parity with Neovim Plugin Test Suite', () => {
  const projectRoot = path.resolve(__dirname, '../../../');
  const neovimPath = path.join(projectRoot, 'neovim', 'lua', '99');

  test('Neovim source code should be archived', () => {
    assert.ok(fs.existsSync(neovimPath), 'Neovim Lua code should be archived');
    
    const initLua = path.join(neovimPath, 'init.lua');
    assert.ok(fs.existsSync(initLua), 'init.lua should be preserved');
  });

  test('VS Code extension should have equivalent core functions', () => {
    const srcPath = path.join(projectRoot, 'src');
    
    // Check for command implementations
    const commandsPath = path.join(srcPath, 'commands');
    assert.ok(fs.existsSync(path.join(commandsPath, 'fillInFunction.ts')), 
      'fillInFunction command should exist');
    assert.ok(fs.existsSync(path.join(commandsPath, 'visual.ts')), 
      'visual command should exist');
    assert.ok(fs.existsSync(path.join(commandsPath, 'stopAllRequests.ts')), 
      'stopAllRequests command should exist');
    assert.ok(fs.existsSync(path.join(commandsPath, 'viewLogs.ts')), 
      'viewLogs command should exist');
  });

  test('Should have equivalent provider integration', () => {
    const providersPath = path.join(projectRoot, 'src', 'providers', 'base.ts');
    assert.ok(fs.existsSync(providersPath), 'Provider integration should exist');
    
    const content = fs.readFileSync(providersPath, 'utf-8');
    assert.ok(content.includes('OpenCodeProvider'), 'Should have OpenCodeProvider');
    assert.ok(content.includes('ClaudeCodeProvider'), 'Should have ClaudeCodeProvider');
  });

  test('Should have equivalent logger functionality', () => {
    const loggerPath = path.join(projectRoot, 'src', 'logger', 'logger.ts');
    assert.ok(fs.existsSync(loggerPath), 'Logger should exist');
    
    const content = fs.readFileSync(loggerPath, 'utf-8');
    assert.ok(content.includes('DEBUG'), 'Should have DEBUG level');
    assert.ok(content.includes('INFO'), 'Should have INFO level');
    assert.ok(content.includes('WARN'), 'Should have WARN level');
    assert.ok(content.includes('ERROR'), 'Should have ERROR level');
    assert.ok(content.includes('FATAL'), 'Should have FATAL level');
  });

  test('Should have equivalent state management', () => {
    const statePath = path.join(projectRoot, 'src', 'state.ts');
    assert.ok(fs.existsSync(statePath), 'State management should exist');
    
    const content = fs.readFileSync(statePath, 'utf-8');
    assert.ok(content.includes('trackRequest'), 'Should track requests');
    assert.ok(content.includes('finishRequest'), 'Should finish requests');
    assert.ok(content.includes('activeRequests'), 'Should manage active requests');
  });

  test('Should have equivalent language support', () => {
    const languagePath = path.join(projectRoot, 'src', 'language', 'language-service.ts');
    assert.ok(fs.existsSync(languagePath), 'Language service should exist');
    
    const content = fs.readFileSync(languagePath, 'utf-8');
    assert.ok(content.includes('TypeScript'), 'Should support TypeScript');
    assert.ok(content.includes('Lua'), 'Should support Lua');
    assert.ok(content.includes('detectFunction'), 'Should detect functions');
  });

  test('Should have equivalent agents/rules system', () => {
    const agentsPath = path.join(projectRoot, 'src', 'extensions', 'agents.ts');
    assert.ok(fs.existsSync(agentsPath), 'Agents system should exist');
    
    const content = fs.readFileSync(agentsPath, 'utf-8');
    assert.ok(content.includes('loadRules'), 'Should load rules');
    assert.ok(content.includes('findRules'), 'Should find rules');
    assert.ok(content.includes('SKILL.md'), 'Should reference SKILL.md files');
  });

  test('Should have equivalent request handling', () => {
    const requestPath = path.join(projectRoot, 'src', 'request', 'request.ts');
    assert.ok(fs.existsSync(requestPath), 'Request handling should exist');
    
    const content = fs.readFileSync(requestPath, 'utf-8');
    assert.ok(content.includes('start'), 'Should have start method');
    assert.ok(content.includes('cancel'), 'Should have cancel method');
    assert.ok(content.includes('Observer'), 'Should have Observer pattern');
  });

  test('Configuration options should match Neovim plugin', () => {
    const packagePath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const config = pkg.contributes.configuration.properties;
    
    // Check for equivalent configuration options
    assert.ok(config['99.model'], 'Should have model configuration');
    assert.ok(config['99.logger.level'], 'Should have logger level configuration');
    assert.ok(config['99.mdFiles'], 'Should have mdFiles configuration');
    assert.ok(config['99.completion.customRules'], 'Should have custom rules configuration');
  });

  test('Default model should match Neovim plugin', () => {
    const packagePath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const defaultModel = pkg.contributes.configuration.properties['99.model'].default;
    
    assert.strictEqual(defaultModel, 'opencode/claude-sonnet-4-5', 
      'Default model should match Neovim plugin');
  });

  test('Supported languages should match or exceed Neovim plugin', () => {
    const statePath = path.join(projectRoot, 'src', 'state.ts');
    const content = fs.readFileSync(statePath, 'utf-8');
    
    // Check that the languages array includes the main ones from Neovim
    assert.ok(content.includes("'typescript'"), 'Should support TypeScript');
    assert.ok(content.includes("'lua'"), 'Should support Lua');
    assert.ok(content.includes("'go'"), 'Should support Go');
    assert.ok(content.includes("'java'"), 'Should support Java');
  });
});
