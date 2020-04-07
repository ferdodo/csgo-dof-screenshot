import TestRunner from "../../lib/TestRunner.ts";

export default async function test(testRunner: TestRunner) {
	const scriptFilePath = await testRunner.spectronApp.client.getValue("#inputScriptLocation");

	if (scriptFilePath !== "/root/dof.cfg") {
		const hint = JSON.stringify({ scriptFilePath }, null, 4);
		throw new Error(`Script file path does not have the expected value ! ${hint}`);
	}
}
