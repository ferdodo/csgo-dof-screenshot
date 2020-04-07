import TestRunner from "./lib/TestRunner.ts";
import test1 from "./tests/1-default-script-filepath/index.ts";
import test2 from "./tests/2-create-config/index.ts";
import test3 from "./tests/3-merge-screenshots/index.ts";

(async function main() {
	try {
		const testRunner = new TestRunner();
		await testRunner.run(test1);
		await testRunner.run(test2);
		await testRunner.run(test3);
		await testRunner.close();
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(-1);
	}
})();
