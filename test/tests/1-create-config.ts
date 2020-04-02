import TestRunner from "../lib/TestRunner.ts";
const { readFileSync } = require("fs");
const { random } = require("lodash");

export default async function test(testRunner: TestRunner) {
	const scriptFilePath = "/csgo-dof-screenshot/dof.cfg";
	const minPos = -1000000;
	const maxPos = 1000000;

	await Promise.all([
		testRunner.client.setValue("#inputCameraX", random(minPos, maxPos)),
		testRunner.client.setValue("#inputCameraY", random(minPos, maxPos)),
		testRunner.client.setValue("#inputCameraZ", random(minPos, maxPos)),
		testRunner.client.setValue("#inputTargetX", random(minPos, maxPos)),
		testRunner.client.setValue("#inputTargetY", random(minPos, maxPos)),
		testRunner.client.setValue("#inputTargetZ", random(minPos, maxPos)),
		testRunner.client.setValue("#inputDofStrength", random(0.000001, 10000)),
		testRunner.client.setValue("#inputKeyBind", "o"),
		testRunner.client.setValue("#inputScriptLocation", scriptFilePath),
	]);

	await testRunner.client.click("#buttonSaveScript");
	await testRunner.client.getValue("#displaySaveScriptDone");
	const scriptBuffer = readFileSync(scriptFilePath);
	const script = scriptBuffer.toString();

	if (script.length < 50000) {
		throw new Error("Script is too short !");
	}
	
	const sample = script.substring(25000, 27000);
	const re = new RegExp(/^([a-zA-Z0-9_"\.\-;]|\s)+$/);

	if (!re.test(sample)) {
		throw new Error("Sample doesn't match regular expression !");
	}
}