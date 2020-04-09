const { Application } = require("spectron");

export default class TestRunner {
	spectronApp: any;
	appStarted: Promise<void>;

	constructor() {
		const path = this.getAppPath();
		const args = ["--no-sandbox", "--headless", "--disable-gpu"];
		this.spectronApp = new Application({ path, args });
		this.appStarted = this.spectronApp.start();
	}

	async run(testExecutor: (testRunner: TestRunner) => void) {
		try {
			await this.appStarted;
			await testExecutor(this);
		} catch (error) {
			await this.dumpProcessLogs();
			throw error;
		}
	}

	async close(){
		await this.spectronApp.stop();
	}

	async dumpProcessLogs() {
		const client = this.spectronApp.client;
		const logs = await client.getMainProcessLogs();
		console.log("\n\n======= Electron process logs start =======");
		for (var i = 0; i < logs.length; ++i) console.log(String(logs[i]));
		console.log("======== Electron process logs end ========\n\n");
	}

	private getAppPath(){
		switch (process.platform) {
			case "win32":
				return "dist/win-unpacked/csgo-dof-screenshot.exe";
			case "linux":
				return "dist/linux-unpacked/csgo-dof-screenshot";
			default:
				throw new Error("Testing is not supported on this platform !");
		}
	}
}
