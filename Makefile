lua_fmt:
	echo "===> Formatting archived Neovim code"
	stylua neovim/lua/ --config-path=.stylua.toml

lua_fmt_check:
	echo "===> Checking format of archived Neovim code"
	stylua neovim/lua/ --config-path=.stylua.toml --check

lua_lint:
	echo "===> Linting archived Neovim code"
	luacheck neovim/lua/ --globals vim

lua_test:
	echo "===> Testing archived Neovim code"
	nvim --headless --noplugin -u scripts/tests/minimal.vim \
        -c "PlenaryBustedDirectory neovim/lua/99 {minimal_init = 'scripts/tests/minimal.vim'}"

lua_clean:
	echo "===> Cleaning"
	rm -f /tmp/lua_*

# VS Code extension targets
vscode_install:
	echo "===> Installing VS Code extension dependencies"
	npm ci

vscode_compile:
	echo "===> Compiling VS Code extension"
	npm run compile

vscode_lint:
	echo "===> Linting VS Code extension"
	npm run lint

vscode_test:
	echo "===> Testing VS Code extension"
	npm test

vscode_package:
	echo "===> Packaging VS Code extension"
	npm run package

# Combined targets
pr_ready: lua_lint lua_fmt_check vscode_lint vscode_compile

.PHONY: lua_fmt lua_fmt_check lua_lint lua_test lua_clean vscode_install vscode_compile vscode_lint vscode_test vscode_package pr_ready
