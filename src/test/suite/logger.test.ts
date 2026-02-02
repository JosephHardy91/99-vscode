import * as assert from 'assert';
import { logger } from '../../logger/logger';
import { LogLevel } from '../../types';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

suite('Logger Test Suite', () => {
  const testLogPath = path.join(os.tmpdir(), 'test-99.log');

  setup(() => {
    // Configure logger with debug level for tests
    logger.configure({ level: LogLevel.DEBUG, path: testLogPath });
  });

  teardown(() => {
    // Clean up test log files
    const testFiles = [
      testLogPath,
      path.join(os.tmpdir(), 'test-99-filter.log'),
      path.join(os.tmpdir(), 'test-99-scoped.log')
    ];
    
    for (const file of testFiles) {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    }
  });

  test('Logger should log messages at appropriate levels', () => {
    // Reconfigure for this test
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
    
    assert.ok(fs.existsSync(tempPath), 'Log file should exist');
    const content = fs.readFileSync(tempPath, 'utf-8');
    assert.ok(!content.includes('Debug message'), 'Should not contain debug message');
    assert.ok(!content.includes('Info message'), 'Should not contain info message');
    assert.ok(content.includes('Warn message'), 'Should contain warn message');
    
    fs.unlinkSync(tempPath);
  });

  test('Logger should track request logs', () => {
    // Configure logger for this test
    logger.configure({ level: LogLevel.INFO, path: testLogPath });
    
    // Start fresh request tracking
    logger.startRequest();
    logger.info('Request 1');
    logger.finishRequest();
    
    logger.startRequest();
    logger.info('Request 2');
    logger.finishRequest();
    
    const logs = logger.getLogs();
    assert.ok(logs.length >= 2, `Should have at least 2 request logs, got ${logs.length}`);
    
    // Check that both requests are present
    const allLogs = logs.flat();
    assert.ok(allLogs.some(l => l.includes('Request 1')), 'Should have Request 1 log');
    assert.ok(allLogs.some(l => l.includes('Request 2')), 'Should have Request 2 log');
  });

  test('Logger should create scoped loggers with ID and area', () => {
    const scopedLogPath = path.join(os.tmpdir(), 'test-99-scoped.log');
    
    // Configure logger BEFORE creating scoped logger
    logger.configure({ level: LogLevel.DEBUG, path: scopedLogPath });
    
    // Create scoped logger
    const scopedLogger = logger.setId(123).setArea('TestArea');
    scopedLogger.debug('Scoped message');
    
    // Ensure file exists
    assert.ok(fs.existsSync(scopedLogPath), 'Scoped log file should exist');
    
    const content = fs.readFileSync(scopedLogPath, 'utf-8');
    assert.ok(content.includes('[123]'), 'Should include ID');
    assert.ok(content.includes('[TestArea]'), 'Should include area');
    assert.ok(content.includes('Scoped message'), 'Should include message');
  });
});
