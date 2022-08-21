import { resolve, join } from "path";
import { accessSync, constants as fsConstants } from "fs";
import { app } from "electron";

function getImgMergerPath() {
	const caseA = resolve(join(app.getAppPath(), "imgMerger", "bin", "imgMerger"));
	const caseB = join(process.resourcesPath, "imgMerger");

	try {
		accessSync(caseA, fsConstants.X_OK);
		return caseA;
	} catch (error) {
		accessSync(caseB, fsConstants.X_OK);
		return caseB;
	}
}

export const imgMergerPath = getImgMergerPath();
