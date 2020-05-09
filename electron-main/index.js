const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const util = require("util");
const writeFile = util.promisify(fs.writeFile);
const { homedir } = require("os");
import ScreenshotsMerger from "./lib/ScreenshotsMerger.ts";
import WeightedImage from "./lib/WeightedImage.ts";
const path = require("path");

(async function main() {
	try {
		app.allowRendererProcessReuse = false;
		await appReady();
		ipcMain.handle("getDefaultScriptPath", getDefaultPath("dof.cfg"));
		ipcMain.handle("getDefaultMergedImagePath", getDefaultPath("csgo-dof-screenshot.png"));
		var win = await createWindow();
		ipcMain.handle("saveScript", saveScript(win));
		ipcMain.handle("mergeScreenshots", mergeScreenshots(win));
		ipcMain.handle("selectScriptPath", selectPath(win, "dof.cfg"));
		ipcMain.handle("selectMergedImagePath", selectPath(win, "csgo-dof-screenshot.png"));
	} catch (error) {
		console.error(error);
		process.exit(-1);
	}
})();

function getDefaultPath(fileName) {
	return async function () {
		const homeDir = path.resolve(homedir());
		const jointedPath = path.join(homeDir, fileName);
		const defaultPath = path.resolve(jointedPath);
		return defaultPath;
	};
}

function selectPath(win, defaultPath) {
	return async function (event, payload) {
		const options = { defaultPath };
		const saveDialogResult = await dialog.showSaveDialog(win, options);
		if (saveDialogResult.canceled) return "";
		return saveDialogResult.filePath;
	};
}

function saveScript(win) {
	return async function (event, payload) {
		await writeFile(payload.scriptLocation, payload.script);
	};
}

function mergeScreenshots(win) {
	return async function (event, { selectedFiles, mergedImageLocation }) {
		var screenshotsMerger = new ScreenshotsMerger(win);
		selectedFiles.map((path) => new WeightedImage(path)).forEach(screenshotsMerger.add, screenshotsMerger);
		var merged = await screenshotsMerger.mergeAll();
		var data = await util.promisify(fs.readFile)(merged.path);
		await util.promisify(fs.writeFile)(mergedImageLocation, data);
	};
}

async function createWindow() {
	var win = new BrowserWindow({
		width: 520,
		height: 700,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	win.setMenuBarVisibility(false);
	win.rezisable = false;
	await win.loadFile("electron-renderer/dist/index.html");
	return win;
}

function appReady() {
	return new Promise(function (resolve, reject) {
		var timeout = setTimeout(reject, 5000, "Timeout !");

		app.on("ready", function () {
			clearTimeout(timeout);
			resolve();
		});
	});
}
