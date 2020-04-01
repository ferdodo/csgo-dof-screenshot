import TestRunner from "../lib/TestRunner.ts";

export default function test(testRunner: TestRunner): void {
	testRunner.client
		.setValue("#inputCameraX", "500")
		.setValue("#inputCameraY", "500")
		.setValue("#inputCameraZ", "500")
		.setValue("#inputTargetX", "500")
		.setValue("#inputTargetY", "500")
		.setValue("#inputTargetZ", "500")
		.setValue("#inputDofStrength", "2")
		.setValue("#inputKeyBind", "o")
		.click("#buttonSaveScript", "500");
}
