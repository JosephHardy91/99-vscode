# 99 VS Code Extension - Installation & Setup Guide

## Prerequisites

### 1. Install opencode CLI

The extension requires `opencode` CLI tool to be installed and configured. 

**Option A: Use opencode (recommended)**
```bash
# Installation instructions for opencode
# Visit: https://github.com/opencodelabs/opencode
# Or follow your system's package manager instructions
```

**Option B: Alternative AI Providers**

You can configure the extension to use other providers like Claude or Cursor Agent by modifying the provider in settings (advanced usage).

### 2. API Keys

Ensure you have the necessary API keys configured for your chosen AI provider:
- OpenAI API key (if using OpenAI models)
- Anthropic API key (if using Claude)
- Or your configured provider's credentials

## Installation Methods

### Method 1: Install from VSIX (Recommended)

1. Download the `99-0.1.0.vsix` file from the releases or build it yourself
2. Open VS Code
3. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
4. Type "Install from VSIX" and select it
5. Navigate to and select the `99-0.1.0.vsix` file
6. Restart VS Code when prompted

### Method 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/JosephHardy91/99-vscode.git
cd 99-vscode

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension (optional)
npm run package

# Open in VS Code
code .

# Press F5 to launch the extension in a new VS Code window (Extension Development Host)
```

## Configuration

### Basic Configuration

Open VS Code settings (File > Preferences > Settings or Ctrl+,) and search for "99":

```json
{
  "99.model": "opencode/claude-sonnet-4-5",
  "99.logger.level": "info",
  "99.displayErrors": false,
  "99.mdFiles": ["AGENT.md"]
}
```

### Advanced Configuration

```json
{
  // AI Model Selection
  "99.model": "opencode/claude-sonnet-4-5",
  
  // Logging Configuration
  "99.logger.level": "debug",  // debug, info, warn, error, fatal
  "99.logger.path": "/tmp/99.debug",  // Optional: custom log file path
  "99.logger.printOnError": true,
  
  // Display Settings
  "99.displayErrors": true,  // Show error popups
  "99.aiStdoutRows": 3,  // Number of progress update rows
  
  // Rule/Skill System
  "99.completion.customRules": [
    "/path/to/your/custom/rules/",
    "~/my-ai-skills/"
  ],
  "99.mdFiles": ["AGENT.md", "AI-RULES.md"]
}
```

## Setting Up Custom Skills

### 1. Create a Skills Directory

```bash
mkdir -p ~/ai-skills
cd ~/ai-skills
```

### 2. Create Skill Definitions

Each skill should be in its own directory with a `SKILL.md` file:

```bash
mkdir -p testing
cat > testing/SKILL.md << 'EOF'
# Testing Skill

Add comprehensive unit tests for the code.

## Guidelines
- Use the project's testing framework
- Cover edge cases
- Include both positive and negative test cases
- Add descriptive test names
EOF

mkdir -p refactor
cat > refactor/SKILL.md << 'EOF'
# Refactoring Skill

Improve code quality, readability, and maintainability.

## Guidelines
- Follow SOLID principles
- Reduce code duplication
- Improve variable/function naming
- Add appropriate comments for complex logic
EOF
```

### 3. Configure Skills in VS Code

Add the skills directory to your VS Code settings:

```json
{
  "99.completion.customRules": [
    "~/ai-skills/"
  ]
}
```

### 4. Use Skills in Commands

When using commands with prompts, reference skills with `@`:

```
@testing add comprehensive unit tests
@refactor improve this function
@debug add logging statements
```

## Usage Examples

### Example 1: Fill in a Function

1. Open a TypeScript file
2. Create a function signature:
```typescript
function calculateDiscount(price: number, discountPercent: number): number {
  // TODO: implement
}
```
3. Place cursor inside the function
4. Press `Ctrl+Shift+9 f` (or use Command Palette: "99: Fill in Function")
5. Wait for AI to implement the function

### Example 2: Process Selection with Custom Instructions

1. Select some code
2. Press `Ctrl+Shift+9 v`
3. Enter: `@refactor improve error handling`
4. Wait for AI to refactor the code

### Example 3: View Logs

1. Run a command
2. Open Command Palette
3. Type "99: View Logs"
4. Navigate through logs with "Previous Request Logs" / "Next Request Logs"

## Troubleshooting

### Extension Not Activating

**Issue**: Extension commands don't appear in Command Palette

**Solution**:
1. Check VS Code output panel for errors
2. Ensure extension is enabled (Extensions view)
3. Restart VS Code
4. Check that you're using a supported file type (TS, JS, Lua, etc.)

### opencode Command Not Found

**Issue**: Error messages about opencode not being found

**Solution**:
1. Verify opencode is installed: `which opencode` or `where opencode`
2. Ensure opencode is in your PATH
3. Restart VS Code after installing opencode
4. Check opencode configuration: `opencode --version`

### No Function Detected

**Issue**: "No function found at cursor position" message

**Solution**:
1. Ensure cursor is inside a function body
2. Try with a simpler function structure first
3. Check that the file language is supported
4. Enable debug logging to see detection details:
   ```json
   {
     "99.logger.level": "debug",
     "99.logger.path": "/tmp/99.debug"
   }
   ```

### AI Request Fails

**Issue**: Requests complete with errors

**Solution**:
1. Check opencode is properly configured
2. Verify API keys are set up correctly
3. Check your internet connection
4. Enable debug logging and check logs:
   - Use "99: View Logs" command
   - Check `/tmp/99.debug` file if configured
5. Try with a simpler request first

### Completion Not Working

**Issue**: `@` skill completions don't appear

**Solution**:
1. Verify skills directory is correctly configured
2. Check that SKILL.md files exist in subdirectories
3. Run "99: Show Info" to see loaded rules
4. Reload VS Code window after adding new skills

## Keyboard Shortcuts

Default keybindings:

| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| Fill in Function | `Ctrl+Shift+9 f` | `Cmd+Shift+9 f` |
| Process Selection | `Ctrl+Shift+9 v` | `Cmd+Shift+9 v` |
| Stop All Requests | `Ctrl+Shift+9 s` | `Cmd+Shift+9 s` |

### Customizing Keybindings

1. Open Keyboard Shortcuts (File > Preferences > Keyboard Shortcuts)
2. Search for "99"
3. Click the pencil icon next to any command
4. Press your desired key combination
5. Press Enter to save

Example custom keybinding:
```json
{
  "key": "ctrl+alt+f",
  "command": "99.fillInFunction",
  "when": "editorTextFocus"
}
```

## Performance Tips

1. **Use specific prompts**: More specific instructions lead to better results
2. **Cancel unused requests**: Use Stop All Requests to cancel if something goes wrong
3. **Monitor log size**: Logs are stored in memory; clear old logs periodically
4. **Limit context**: For large files, select specific sections to process

## Support & Contributing

- **Issues**: Report bugs at https://github.com/JosephHardy91/99-vscode/issues
- **Discussions**: Join discussions for feature requests
- **Contributing**: See CONTRIBUTING.md (if available)

## Frequently Asked Questions

### Q: Does this work offline?
**A**: No, the extension requires an internet connection to communicate with AI providers through the opencode CLI.

### Q: What languages are supported?
**A**: Currently TypeScript, JavaScript, Lua, Go, Java, C++, and Ruby. Function detection quality varies by language.

### Q: Can I use this with other AI models?
**A**: Yes! Configure the `99.model` setting to use different models supported by opencode or your configured provider.

### Q: How much does this cost?
**A**: The extension is free, but AI API usage may incur costs depending on your provider (OpenAI, Anthropic, etc.)

### Q: How do I uninstall?
**A**: Go to Extensions view, find "99", and click Uninstall. Then restart VS Code.

## Next Steps

1. Configure your preferred AI model
2. Set up custom skills for your workflow
3. Try the example commands
4. Customize keybindings to your preference
5. Share feedback and report issues

Happy coding with AI assistance! 🚀
