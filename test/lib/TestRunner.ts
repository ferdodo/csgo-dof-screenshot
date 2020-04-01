const { Application } = require("spectron");

export default class TestRunner {
	spectronApp: any;
	appStarted: Promise<void>;

	constructor() {
		this.spectronApp = createSpectronApp();
		this.appStarted = this.spectronApp.start();
	}

	get client() {
		return this.spectronApp.client;
	}

	run(executor: (testRunner: TestRunner) => void) {
		return asyncRun(this, executor);
	}

	close() {
		return this.spectronApp.stop();
	}
}

async function asyncRun(testRunner: TestRunner, executor: (testRunner: TestRunner) => void) {
	await testRunner.appStarted;
	await executor(testRunner);
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
