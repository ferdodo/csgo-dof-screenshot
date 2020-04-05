import TestRunner from "../../lib/TestRunner.ts";
//const { readFileSync } = require("fs");

export default async function test(testRunner: TestRunner) {
	await testRunner.appStarted;
}
