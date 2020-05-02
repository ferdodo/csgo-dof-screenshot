const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const util = require("util");
const writeFile = util.promisify(fs.writeFile);
const { homedir } = require("os");
var ScreenshotsMerger = require("./lib/ScreenshotsMerger.js");
var WeightedImage = require("./lib/WeightedImage.js");
const path = require("path");

main();

async function main() {
	await appReady();
	var win = await createWindow();
	ipcMain.handle("saveScript", saveScript(win));
	ipcMain.handle("mergeScreenshots", mergeScreenshots(win));
	ipcMain.handle("getDefaultScriptPath", getDefaultPath("dof.cfg"));
	ipcMain.handle("getDefaultMergedImagePath", getDefaultPath("csgo-dof-screenshot.png"));
	ipcMain.handle("selectScriptPath", selectPath(win, "dof.cfg"));
	ipcMain.handle("selectMergedImagePath", selectPath(win, "csgo-dof-screenshot.png"));
}

function getDefaultPath(fileName) {
	return async function(){
		const homeDir = path.resolve(homedir());
		const jointedPath = path.join(homeDir, fileName);
		const defaultPath = path.resolve(jointedPath);
		return defaultPath;
	}
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
	return async function (event, {selectedFiles, mergedImageLocation}) {
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
	win.setResizable(false);
	await win.loadFile("gui/dist/index.html");
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