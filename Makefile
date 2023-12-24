install:
	npm ci
publish:
	npm publish --dry-run
lint:
	npx eslint .
serve:
	npx webpack serve
build:
	NODE_ENV=production npx webpack
remove-build:
	rm -rf dist