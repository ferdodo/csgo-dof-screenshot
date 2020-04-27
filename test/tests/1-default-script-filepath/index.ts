import TestRunner from "../../lib/TestRunner.ts";

export default async function test(testRunner: TestRunner) {
	const scriptFilePath = await testRunner.spectronApp.client.getValue("#inputScriptLocation");
	const expectedValue = expectedScriptPathValue();

	if (scriptFilePath !== expectedValue) {
		const hint = JSON.stringify({ scriptFilePath, expectedValue }, null, 4);
		throw new Error(`Script file path does not have the expected value ! ${hint}`);
	}
}

function expectedScriptPathValue(){
	switch (process.platform) {
		case "win32":
			return "C:\\Users\\runneradmin\\dof.cfg";
		case "linux":
			return "/root/dof.cfg";
		default:
			throw new Error("Testing is not supported on this platform !");
	}
}