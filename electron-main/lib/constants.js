const path = require("path");
const { accessSync, constants: fsConstants } = require("fs");
const { app } = require("electron");

module.exports = {
	imgMergerPath: getImgMergerPath(),
};

function getImgMergerPath() {
	const caseA = path.resolve(path.join(app.getAppPath(), "imgMerger", "bin", "imgMerger"));
	const caseB = path.join(process.resourcesPath, "imgMerger");

	try {
		accessSync(caseA, fsConstants.X_OK);
		return caseA;
	} catch (error) {
		try {
			accessSync(caseB, fsConstants.X_OK);
			return caseB;
		} catch (error) {
			throw `Failed to get imgMerger path ! \n ${error.message + error.stack || error}`;
		}
	}
}
