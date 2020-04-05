import TestRunner from "../lib/TestRunner.ts";
const { readFileSync } = require("fs");
const { random } = require("lodash");

export default async function test(testRunner: TestRunner) {
	const scriptFilePath = "/csgo-dof-screenshot/dof.cfg";
	const minPos = -100000;
	const maxPos = 100000;
	await testRunner.setInput("#inputCameraX", random(minPos, maxPos));
	await testRunner.setInput("#inputCameraY", random(minPos, maxPos));
	await testRunner.setInput("#inputCameraZ", random(minPos, maxPos));
	await testRunner.setInput("#inputTargetX", random(minPos, maxPos));
	await testRunner.setInput("#inputTargetY", random(minPos, maxPos));
	await testRunner.setInput("#inputTargetZ", random(minPos, maxPos));
	await testRunner.setInput("#inputDofStrength", random(-3000, 3000));
	await testRunner.setInput("#inputKeyBind", "o");
	await testRunner.setInput("#inputScriptLocation", scriptFilePath);
	await testRunner.spectronApp.client.click("#buttonSaveScript");
	await testRunner.spectronApp.client.getValue("#displaySaveScriptDone");
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
