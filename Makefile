include makefiles.mk

COLLECT_COVERAGE_FROM := ["src/**/*.{js,jsx,ts,tsx}"]

.PHONY: all
all: build

.PHONY: install
install: node_modules
node_modules: package.json
	@$(NPM) install

.PHONY: prepare
prepare:
	@

.PHONY: format
format: install
	-@eslint --fix --ext .js,.jsx,.ts,.tsx . 2>$(NULL)
	@prettier --write ./**/*.{json,md,scss,yaml,yml,js,jsx,ts,tsx} --ignore-path .gitignore
	@mkdir -p node_modules/.make && touch -m node_modules/.make/format
node_modules/.make/format: $(shell git ls-files | grep "\.(j|t)sx?$$")
	@$(MAKE) -s format

.PHONY: spellcheck
spellcheck: node_modules/.make/format
	-@cspell --config .cspellrc src/**/*.ts
	@mkdir -p node_modules/.make && touch -m node_modules/.make/spellcheck
node_modules/.make/spellcheck: $(shell git ls-files | grep "\.(j|t)sx?$$")
	-@$(MAKE) -s spellcheck

.PHONY: lint
lint: node_modules/.make/spellcheck
	# @lockfile-lint --type npm --path package-lock.json --validate-https
	-@tsc --allowJs --noEmit
	-@eslint -f json -o node_modules/.tmp/eslintReport.json --ext .js,.jsx,.ts,.tsx . 2>$(NULL)
	@eslint --ext .js,.jsx,.ts,.tsx .
node_modules/.tmp/eslintReport.json: $(shell git ls-files | grep "\.(j|t)sx?$$")
	-@$(MAKE) -s lint

.PHONY: test
test: node_modules/.tmp/eslintReport.json
node_modules/.tmp/coverage/lcov.info: $(shell git ls-files | grep "\.(j|t)sx?$$")
	-@$(MAKE) -s test

.PHONY: coverage
coverage: node_modules/.tmp/eslintReport.json

.PHONY: test-ui
test-ui: node_modules/.tmp/eslintReport.json node_modules

.PHONY: test-watch
test-watch: node_modules/.tmp/eslintReport.json node_modules

.PHONY: clean
clean:
ifeq ($(PLATFORM), win32)
	@git clean -fXd -e !/node_modules -e !/node_modules/**/* -e !/yarn.lock -e !/pnpm-lock.yaml -e !/package-lock.json
else
	@git clean -fXd -e \!/node_modules -e \!/node_modules/**/* -e \!/yarn.lock -e \!/pnpm-lock.yaml -e \!/package-lock.json
endif
	-@rm -rf node_modules/.cache
	-@rm -rf node_modules/.make
	-@rm -rf node_modules/.tmp

.PHONY: build
build:

.PHONY: start
start:

.PHONY: purge
purge: clean
	@git clean -fXd

.PHONY: report
report: spellcheck lint test
	@

%:
	@
