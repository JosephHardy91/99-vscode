# Test Suite for 99 VS Code Extension

This directory contains comprehensive tests for the 99 VS Code extension, ensuring parity with the original Neovim plugin, correct installation artifacts, and functional user flows.

## Test Structure

### Unit Tests

- **`logger.test.ts`** - Tests for logging system
  - Log level filtering
  - File output
  - Request tracking
  - Scoped loggers with ID and area

- **`state.test.ts`** - Tests for state management
  - Request tracking
  - Request lifecycle (start, finish, cancel)
  - Active request management
  - Request history

- **`geo.test.ts`** - Tests for geometry utilities
  - Point/Position conversions
  - Range conversions between VS Code and custom types

- **`language-service.test.ts`** - Tests for language services
  - Function detection in TypeScript/JavaScript
  - Arrow function detection
  - Lua function detection
  - Edge cases (no function, unsupported languages)

- **`agents.test.ts`** - Tests for rule/skill system
  - Loading rules from directories
  - Finding rules with @ mentions
  - Rule lookup by path

### Integration Tests

- **`e2e.test.ts`** - End-to-end user flow tests
  - Extension activation
  - Command registration
  - Configuration defaults
  - Basic command execution

### Validation Tests

- **`installation.test.ts`** - Installation artifact validation
  - `package.json` structure and completeness
  - Required commands and keybindings
  - Configuration schema
  - Compiled output verification
  - Documentation existence

- **`parity.test.ts`** - Parity with Neovim plugin
  - Neovim code archival
  - Equivalent core functions
  - Provider integration
  - Logger functionality
  - State management
  - Language support
  - Agents/rules system
  - Configuration options
  - Default values

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests Only

```bash
npm run test:unit
```

### With Coverage

```bash
npm run test -- --coverage
```

### Specific Test Suite

```bash
npm test -- --grep "Logger"
npm test -- --grep "Parity"
npm test -- --grep "E2E"
```

## CI/CD Integration

Tests are automatically run on GitHub Actions for:
- Multiple operating systems (Ubuntu, Windows, macOS)
- Multiple Node.js versions (18.x, 20.x)
- Pull requests and pushes to master

See `.github/workflows/vscode-ci.yml` for CI configuration.

## Test Coverage Areas

### 1. Parity with Original Model
- All core functions from Neovim plugin implemented
- Equivalent provider integration (opencode, claude)
- Same configuration options
- Matching default values
- Support for same languages (TypeScript, Lua, Go, Java, C++, Ruby)

### 2. Installation Artifacts
- Valid `package.json` with all required fields
- All commands registered and documented
- Keybindings configured
- Configuration schema complete
- TypeScript compilation successful
- VSIX packaging works
- Documentation present (README, LICENSE, INSTALL)

### 3. Mock E2E User Flows
- Extension activates successfully
- Commands execute without errors
- Configuration loaded correctly
- Language services detect functions
- Logs can be viewed
- Requests can be stopped

## Mock Provider

`src/test/mocks/mockProvider.ts` provides a mock AI provider for testing without requiring actual AI API calls:

```typescript
const mockProvider = new MockProvider('mock response', false, 100);
```

Parameters:
- `mockResponse`: Response to return
- `shouldFail`: Whether to simulate failure
- `delay`: Delay in milliseconds

## Writing New Tests

### Adding a Unit Test

1. Create `src/test/suite/yourmodule.test.ts`
2. Use Mocha's TDD interface:

```typescript
import * as assert from 'assert';

suite('Your Module Test Suite', () => {
  test('Should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = yourFunction(input);
    
    // Assert
    assert.strictEqual(result, 'expected');
  });
});
```

3. Compile and run: `npm run compile && npm test`

### Adding an E2E Test

1. Add to `src/test/suite/e2e.test.ts`
2. Use VS Code API for integration testing
3. Clean up resources in teardown

## Troubleshooting

### Tests Won't Run

- Ensure compilation succeeds: `npm run compile`
- Check VS Code test electron is installed
- On Linux, may need `xvfb-run -a npm test`

### Tests Fail on CI

- Check GitHub Actions logs for specific failures
- Verify platform-specific issues
- Ensure all dependencies are in `package.json`

### Mock Provider Issues

- Verify temp file paths are accessible
- Check file system permissions
- Ensure proper cleanup in teardown

## Test Metrics

Target coverage goals:
- Core modules: 80%+ coverage
- Commands: 70%+ coverage
- Utilities: 90%+ coverage
- Overall: 75%+ coverage

## Future Enhancements

- [ ] Add performance benchmarks
- [ ] Expand E2E scenarios (with real AI responses)
- [ ] Add visual regression tests
- [ ] Test rule/skill completion provider
- [ ] Add mutation testing
