import TestRunner from "./TestRunner.ts";

export async function setInput(testRunner: TestRunner, selector: string, value: string) {
	const client = testRunner.spectronApp.client;
	await client.clearElement(selector);
	await client.setValue(selector, value);
	const verification = await client.getValue(selector);

	if (verification != value) {
		const hint = JSON.stringify({ selector, value, verification }, null, 4);
		throw new Error(`Failed to set an input ! ${hint}`);
	}
}
