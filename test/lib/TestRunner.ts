const { Application } = require("spectron");

export default class TestRunner {
	spectronApp: any;
	appStarted: Promise<void>;

	constructor() {
		let path = undefined;

		switch (process.platform) {
			case "win32":
				path = "dist/win-unpacked/csgo-dof-screenshot.exe";
				break;
			case "linux":
				path = "dist/linux-unpacked/csgo-dof-screenshot";
				break;
			default:
				throw new Error("Testing is not supported on this platform !");
		}

		const args = ["--no-sandbox", "--headless", "--disable-gpu"];
		this.spectronApp = new Application({ path, args });
		this.appStarted = this.spectronApp.start();
	}

	run(testExecutor: (testRunner: TestRunner) => void) {
		const testRunner = this;

		return new Promise(async function (resolve, reject) {
			try {
				await testRunner.appStarted;
				await testExecutor(testRunner);
				resolve();
			} catch (error) {
				await testRunner.dumpError();
				reject(error);
			}
		});
	}

	close(): Promise<void> {
		return this.spectronApp.stop();
	}

	dumpError() {
		const testRunner = this;

		return new Promise(async function (resolve) {
			const client = testRunner.spectronApp.client;
			const logs = await client.getMainProcessLogs();
			console.log("Log dump:");
			for (var i = 0; i < logs.length; ++i) console.log(`  - ${logs[i]}`);
			resolve();
		});
	}
}
