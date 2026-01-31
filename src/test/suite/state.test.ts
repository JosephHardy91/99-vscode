import * as assert from 'assert';
import { NinetyNineState } from '../../state';

suite('State Test Suite', () => {
  let state: NinetyNineState;

  setup(() => {
    state = new NinetyNineState();
  });

  test('State should initialize with default values', () => {
    assert.strictEqual(state.model, 'opencode/claude-sonnet-4-5');
    assert.strictEqual(state.aiStdoutRows, 3);
    assert.strictEqual(state.displayErrors, false);
    assert.strictEqual(state.languages.length, 6);
  });

  test('State should track requests', () => {
    const entry = state.trackRequest(1, 'test-op', '/test/file.ts', 10, 5);
    
    assert.strictEqual(entry.id, 1);
    assert.strictEqual(entry.operation, 'test-op');
    assert.strictEqual(entry.status, 'running');
    assert.strictEqual(entry.filename, '/test/file.ts');
    assert.strictEqual(entry.lnum, 10);
    assert.strictEqual(entry.col, 5);
  });

  test('State should finish requests', () => {
    state.trackRequest(1, 'test-op', '/test/file.ts', 10, 5);
    state.finishRequest(1, 'success');
    
    const entry = state.requestById.get(1);
    assert.strictEqual(entry?.status, 'success');
  });

  test('State should remove requests', () => {
    state.trackRequest(1, 'test-op', '/test/file.ts', 10, 5);
    state.removeRequest(1);
    
    assert.strictEqual(state.requestHistory.length, 0);
    assert.strictEqual(state.requestById.has(1), false);
  });

  test('State should count previous requests', () => {
    state.trackRequest(1, 'test-op', '/test/file.ts', 10, 5);
    state.trackRequest(2, 'test-op', '/test/file.ts', 10, 5);
    state.finishRequest(1, 'success');
    
    assert.strictEqual(state.previousRequestCount(), 1);
  });

  test('State should clear previous requests', () => {
    state.trackRequest(1, 'test-op', '/test/file.ts', 10, 5);
    state.trackRequest(2, 'test-op', '/test/file.ts', 10, 5);
    state.finishRequest(1, 'success');
    
    state.clearPreviousRequests();
    
    assert.strictEqual(state.requestHistory.length, 1);
    assert.strictEqual(state.requestHistory[0].status, 'running');
  });

  test('State should manage active requests', () => {
    const cleanUp = () => { 
      // Cleanup function
    };
    
    const id = state.addActiveRequest(cleanUp, 1);
    assert.ok(id > 0);
    assert.strictEqual(state.activeRequestCount(), 1);
    
    state.removeActiveRequest(id);
    assert.strictEqual(state.activeRequestCount(), 0);
  });
});
