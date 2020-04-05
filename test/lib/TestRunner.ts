const { Application } = require("spectron");

export default class TestRunner {
	spectronApp: any;
	appStarted: Promise<void>;

	constructor() {
		this.spectronApp = createSpectronApp();
		this.appStarted = this.spectronApp.start();
	}

	run(executor: (testRunner: TestRunner) => void) {
		return asyncRun(this, executor).catch(dumpElectronLogs(this));
	}

	close() {
		return this.spectronApp.stop();
	}

	setInput(selector: string, value: string) {
		return asyncSetInput(this, selector, value);
	}
}

async function asyncRun(testRunner: TestRunner, executor: (testRunner: TestRunner) => void) {
	await testRunner.appStarted;
	await executor(testRunner);
}

async function asyncSetInput(testRunner: TestRunner, selector: string, value: string) {
	const client = testRunner.spectronApp.client;
	await client.clearElement(selector);
	await client.setValue(selector, value);
	const verification = await client.getValue(selector);

	if (verification != value) {
		const hint = JSON.stringify({ selector, value, verification }, null, 4);
		throw new Error(`Failed to set an input ! ${hint}`);
	}
}

function getBinariesPath() {
	switch (process.platform) {
		case "win32":
			return "dist/win-unpacked/csgo-dof-screenshot.exe";
		case "linux":
			return "dist/linux-unpacked/csgo-dof-screenshot";
		default:
			throw new Error("Testing is not supported on this platform !");
	}
}

function createSpectronApp() {
	const path = getBinariesPath();
	const args = ["--no-sandbox", "--headless", "--disable-gpu"];
	return new Application({ path, args });
}

function dumpElectronLogs(testRunner: TestRunner) {
	return async function (error: Error) {
		const client = testRunner.spectronApp.client;
		const logs = await client.getMainProcessLogs();
		console.log("Log dump:");
		for (var i = 0; i < logs.length; ++i) console.log(`  - ${logs[i]}`);
		throw error;
	};
}
