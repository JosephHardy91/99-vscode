import * as assert from 'assert';
import { logger } from '../../logger/logger';
import { LogLevel } from '../../types';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

suite('Logger Test Suite', () => {
  const testLogPath = path.join(os.tmpdir(), 'test-99.log');

  teardown(() => {
    // Clean up test log file
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
  });

  test('Logger should log messages at appropriate levels', () => {
    logger.configure({ level: LogLevel.DEBUG, path: testLogPath });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    
    assert.ok(fs.existsSync(testLogPath), 'Log file should be created');
    const content = fs.readFileSync(testLogPath, 'utf-8');
    assert.ok(content.includes('Debug message'), 'Should contain debug message');
    assert.ok(content.includes('Info message'), 'Should contain info message');
    assert.ok(content.includes('Warn message'), 'Should contain warn message');
  });

  test('Logger should filter messages by level', () => {
    const tempPath = path.join(os.tmpdir(), 'test-99-filter.log');
    logger.configure({ level: LogLevel.WARN, path: tempPath });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    
    const content = fs.readFileSync(tempPath, 'utf-8');
    assert.ok(!content.includes('Debug message'), 'Should not contain debug message');
    assert.ok(!content.includes('Info message'), 'Should not contain info message');
    assert.ok(content.includes('Warn message'), 'Should contain warn message');
    
    fs.unlinkSync(tempPath);
  });

  test('Logger should track request logs', () => {
    logger.startRequest();
    logger.info('Request 1');
    logger.finishRequest();
    
    logger.startRequest();
    logger.info('Request 2');
    logger.finishRequest();
    
    const logs = logger.getLogs();
    assert.strictEqual(logs.length, 2, 'Should have 2 request logs');
    assert.ok(logs[0].some(l => l.includes('Request 2')), 'First log should be Request 2');
    assert.ok(logs[1].some(l => l.includes('Request 1')), 'Second log should be Request 1');
  });

  test('Logger should create scoped loggers with ID and area', () => {
    const scopedLogger = logger.setId(123).setArea('TestArea');
    logger.configure({ level: LogLevel.DEBUG, path: testLogPath });
    
    scopedLogger.debug('Scoped message');
    
    const content = fs.readFileSync(testLogPath, 'utf-8');
    assert.ok(content.includes('[123]'), 'Should include ID');
    assert.ok(content.includes('[TestArea]'), 'Should include area');
    assert.ok(content.includes('Scoped message'), 'Should include message');
  });
});
