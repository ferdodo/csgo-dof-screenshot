#!/usr/bin/env zx
import shell from "shelljs";
const { find, cp, mkdir, cat } = shell;

function copyToDist() {
	mkdir('-p', 'dist')
	mkdir('-p', 'extraResources');
	cp('electron-renderer/public/*', 'dist');
	cp('imgMerger/bin/imgMerger', 'extraResources');
}

async function bundleRenderer() {
	const processOutput = $`
		npx --no-install esbuild electron-renderer/index.ts \
			--define:__VUE_OPTIONS_API__=false \
			--define:__VUE_PROD_DEVTOOLS__=false \
			--bundle \
			--target=chrome80 \
			--external:electron \
			--outfile=dist/renderer.js \
			--sourcemap
	`;

	processOutput.quiet();
	processOutput.stdout.pipe(process.stdout);
	processOutput.stderr.pipe(process.stderr);
	await processOutput;
}

async function buildVueTemplates() {
	const templates = find('electron-renderer')
		.filter(file => file.match(/\.html$/))
		.filter(file => !file.includes('public'));

	function outfile(fileName) {
		return fileName.replace(/\.html$/, '.js');
	}

	async function buildTemplates(infile, outfile) {
		const processOutput = $`
			npx --no-install vue-compiler-dom-cli \
				--infile ${ infile } \
				--outfile ${ outfile } \
				--custom-element-regexp dport- \
				--mode module
		`;

		processOutput.quiet();
		processOutput.stdout.pipe(process.stdout);
		processOutput.stderr.pipe(process.stderr);
		await processOutput;
	}

	for (const template of templates) {
		await buildTemplates(template, outfile(template));
	}
}

async function checkRendererTypings() {
	const processOutput = $`npx --no-install tsc --project electron-renderer`;
	processOutput.quiet();
	processOutput.stdout.pipe(process.stdout);
	processOutput.stderr.pipe(process.stderr);
	await processOutput;
}

async function bundleMain() {
	const processOutput = $`
		npx --no-install esbuild electron-main/index.ts \
			--bundle \
			--platform=node \
			--external:electron \
			--outfile=dist/main.js
	`;

	processOutput.quiet();
	processOutput.stdout.pipe(process.stdout);
	processOutput.stderr.pipe(process.stderr);
	await processOutput;
}


async function checkMainTypings() {
	const processOutput = $`npx --no-install tsc --project electron-main`;
	processOutput.quiet();
	processOutput.stdout.pipe(process.stdout);
	processOutput.stderr.pipe(process.stderr);
	await processOutput;
}

async function lintTypescriptFiles() {
	const processOutput = $`
		npx --no-install eslint \
			--max-warnings 0 \
			--parser @typescript-eslint/parser \
			--plugin @typescript-eslint/tslint \
			--config eslintrc.yml \
			--ext .ts .
	`;

	processOutput.quiet();
	processOutput.stdout.pipe(process.stdout);
	processOutput.stderr.pipe(process.stderr);
	await processOutput;
}

async function buildElectron() {
	const processOutput = $`npx --no-install electron-builder \
		--publish=never \
		--config electron-builder.yml
	`;

	processOutput.quiet();
	processOutput.stdout.pipe(process.stdout);
	processOutput.stderr.pipe(process.stderr);
	await processOutput;
}

copyToDist();
await buildVueTemplates();
await bundleRenderer();
await checkRendererTypings();
await bundleMain();
await checkMainTypings();
await lintTypescriptFiles();
await buildElectron();
