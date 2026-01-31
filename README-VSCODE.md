# 99 - AI Code Assistant for VS Code

An AI-powered code assistance extension for VS Code that provides streamlined, targeted code generation and editing.

## Features

- **Fill in Function**: Analyze function signatures and automatically generate implementations using AI
- **Process Selection**: Transform selected code with AI assistance
- **Request Management**: Start, stop, and track AI requests
- **Logging**: View detailed logs of AI interactions
- **Skill System**: Reference custom rules and skills using `@` mentions in prompts

## Requirements

**You must have `opencode` installed and configured.** 

Install opencode from: [opencode repository]

Alternatively, you can configure the extension to use other AI providers like Claude or Cursor Agent.

## Installation

### From VSIX (Manual Installation)
1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

### From Source
```bash
git clone https://github.com/JosephHardy91/99-vscode.git
cd 99-vscode
npm install
npm run compile
# Press F5 in VS Code to launch the extension in a new window
```

## Usage

### Commands

Access commands via Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- **99: Fill in Function** - Implement function at cursor
- **99: Fill in Function with Prompt** - Implement with custom instructions
- **99: Process Selection** - Transform selected code
- **99: Process Selection with Prompt** - Transform with custom instructions
- **99: Stop All Requests** - Cancel all running AI requests
- **99: View Logs** - View the most recent request logs
- **99: Previous Request Logs** - Navigate to previous request logs
- **99: Next Request Logs** - Navigate to next request logs
- **99: Show Info** - Display extension info and loaded rules

### Keybindings

Default keybindings:

- **Ctrl+Shift+9 f** (Cmd+Shift+9 f on Mac) - Fill in Function
- **Ctrl+Shift+9 v** (Cmd+Shift+9 v on Mac) - Process Selection (requires selection)
- **Ctrl+Shift+9 s** (Cmd+Shift+9 s on Mac) - Stop All Requests

### Using Skills/Rules

When prompted for additional instructions, you can reference skills using `@`:

```
@testing add unit tests for this function
@refactor improve code quality and readability
@debug add logging statements
```

Skills are loaded from:
1. `.cursor/rules` directory (if available)
2. Custom rule directories specified in settings
3. `AGENT.md` files in project hierarchy

## Configuration

Configure the extension in VS Code settings:

```json
{
  "99.model": "opencode/claude-sonnet-4-5",
  "99.logger.level": "info",
  "99.logger.path": "",
  "99.logger.printOnError": true,
  "99.displayErrors": false,
  "99.mdFiles": ["AGENT.md"],
  "99.completion.customRules": [],
  "99.aiStdoutRows": 3
}
```

### Settings

- **99.model**: AI model to use (default: `opencode/claude-sonnet-4-5`)
- **99.logger.level**: Logging level (`debug`, `info`, `warn`, `error`, `fatal`)
- **99.logger.path**: Custom log file path
- **99.logger.printOnError**: Print errors to console
- **99.displayErrors**: Show error messages in UI
- **99.mdFiles**: List of markdown files to auto-detect (e.g., `AGENT.md`)
- **99.completion.customRules**: Array of paths to custom rule directories
- **99.aiStdoutRows**: Number of rows for AI output display

## Custom Rules

Create custom skills by organizing them in directories:

```
/path/to/rules/
  ├── testing/
  │   └── SKILL.md
  ├── refactor/
  │   └── SKILL.md
  └── debug/
      └── SKILL.md
```

Add the path to settings:

```json
{
  "99.completion.customRules": ["/path/to/rules/"]
}
```

## Language Support

Currently supported languages:
- TypeScript/JavaScript
- Lua
- Go
- Java
- C++
- Ruby

## Known Issues

- Function detection uses simplified regex patterns and may not work for all function styles
- Long function signatures might cause display issues
- Export statements may be duplicated in some cases
- Visual selection sends the entire selection content; more sophisticated context gathering is planned

## Reporting Bugs

To report a bug, please provide:
1. Full debug logs (use "99: View Logs" command)
2. Description of the issue
3. Steps to reproduce

Enable debug logging:
```json
{
  "99.logger.level": "debug",
  "99.logger.path": "/tmp/99.debug"
}
```

**Note**: Remove any secrets or sensitive information from logs before sharing.

## Architecture

The extension is organized as follows:

- `src/extension.ts` - Main entry point
- `src/commands/` - Command implementations
- `src/providers/` - AI provider integrations (opencode, claude, etc.)
- `src/language/` - Language-specific services
- `src/request/` - Request handling and lifecycle
- `src/logger/` - Logging system
- `src/utils/` - Utility functions

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Keep changes minimal and focused
2. Add tests for new functionality
3. Update documentation as needed
4. Follow existing code style

## Original Neovim Plugin

This extension is based on the Neovim plugin "99" by ThePrimeagen. The original Lua code is preserved in the `lua/` directory for reference.

## License

[Include license information]

## Credits

Original Neovim plugin by ThePrimeagen
VS Code port by JosephHardy91
