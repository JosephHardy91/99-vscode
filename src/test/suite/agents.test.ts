import * as assert from 'assert';
import { Agents } from '../../extensions/agents';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

suite('Agents Test Suite', () => {
  let testDir: string;

  setup(() => {
    // Create temporary test directory structure
    testDir = path.join(os.tmpdir(), 'test-99-rules');
    fs.mkdirSync(testDir, { recursive: true });
    
    // Create mock skill directories
    const skill1Dir = path.join(testDir, 'testing');
    fs.mkdirSync(skill1Dir, { recursive: true });
    fs.writeFileSync(path.join(skill1Dir, 'SKILL.md'), '# Testing Skill\nAdd unit tests');
    
    const skill2Dir = path.join(testDir, 'refactor');
    fs.mkdirSync(skill2Dir, { recursive: true });
    fs.writeFileSync(path.join(skill2Dir, 'SKILL.md'), '# Refactor Skill\nImprove code quality');
  });

  teardown(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('Should load rules from directory', () => {
    // Mock state
    const mockState = {
      completion: { customRules: [testDir] },
    };
    
    // Temporarily set state
    const originalRules = require('../../state').state.completion.customRules;
    require('../../state').state.completion.customRules = [testDir];
    
    const rules = Agents.loadRules();
    
    assert.strictEqual(rules.custom.length, 2);
    assert.ok(rules.custom.some(r => r.name === 'testing'));
    assert.ok(rules.custom.some(r => r.name === 'refactor'));
    
    // Restore original state
    require('../../state').state.completion.customRules = originalRules;
  });

  test('Should find rules in text with @ mentions', () => {
    const rules = {
      custom: [
        { name: 'testing', path: '/path/to/testing/SKILL.md' },
        { name: 'refactor', path: '/path/to/refactor/SKILL.md' },
      ],
      byName: new Map([
        ['testing', [{ name: 'testing', path: '/path/to/testing/SKILL.md' }]],
        ['refactor', [{ name: 'refactor', path: '/path/to/refactor/SKILL.md' }]],
      ]),
    };
    
    const text = 'Please @testing and @refactor this code';
    const foundRules = Agents.findRules(rules, text);
    
    assert.strictEqual(foundRules.length, 2);
    assert.ok(foundRules.some(r => r.name === 'testing'));
    assert.ok(foundRules.some(r => r.name === 'refactor'));
  });

  test('Should get rule by path', () => {
    const rules = {
      custom: [
        { name: 'testing', path: '/path/to/testing/SKILL.md' },
        { name: 'refactor', path: '/path/to/refactor/SKILL.md' },
      ],
      byName: new Map(),
    };
    
    const rule = Agents.getRuleByPath(rules, '/path/to/testing/SKILL.md');
    
    assert.ok(rule);
    assert.strictEqual(rule?.name, 'testing');
  });

  test('Should return null for non-existent rule path', () => {
    const rules = {
      custom: [
        { name: 'testing', path: '/path/to/testing/SKILL.md' },
      ],
      byName: new Map(),
    };
    
    const rule = Agents.getRuleByPath(rules, '/nonexistent/path');
    
    assert.strictEqual(rule, null);
  });
});
