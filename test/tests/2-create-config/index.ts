import TestRunner from "../../lib/TestRunner.ts";
import { setInput } from "../../lib/TestUtils.ts";
const { readFileSync } = require("fs");
const { random } = require("lodash");

export default async function test(testRunner: TestRunner) {
	const scriptFilePath = getScriptFilePath();
	const minPos = -100000;
	const maxPos = 100000;
	await setInput(testRunner, "#inputCameraX", random(minPos, maxPos));
	await setInput(testRunner, "#inputCameraY", random(minPos, maxPos));
	await setInput(testRunner, "#inputCameraZ", random(minPos, maxPos));
	await setInput(testRunner, "#inputTargetX", random(minPos, maxPos));
	await setInput(testRunner, "#inputTargetY", random(minPos, maxPos));
	await setInput(testRunner, "#inputTargetZ", random(minPos, maxPos));
	await setInput(testRunner, "#inputDofStrength", random(0, 3000));
	await setInput(testRunner, "#inputKeyBind", "o");
	await setInput(testRunner, "#inputScriptLocation", scriptFilePath);
	await testRunner.spectronApp.client.click("#buttonSaveScript");

	var retry = 0;

	while (true) {
		try {
			await testRunner.spectronApp.client.getValue("#displaySaveScriptDone");
			break;
		} catch (error) {
			retry++;
			if (retry > 10) throw error;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

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


function getScriptFilePath(){
	switch (process.platform) {
		case "win32":
			return "C:\\Users\\runneradmin\\dof.cfg";
		case "linux":
			return "/csgo-dof-screenshot/dof.cfg";
		default:
			throw new Error("Testing is not supported on this platform !");
	}
}