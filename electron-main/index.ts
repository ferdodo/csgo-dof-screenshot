import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import { homedir } from "os";
import { ScreenshotsMerger } from "./lib/screenshots-merger";
import { WeightedImage } from "./lib/weighted-image";
import { resolve, join } from "path";

async function main() {
	try {
		// app.allowRendererProcessReuse = false;
		await appReady();
		ipcMain.handle("getDefaultScriptPath", getDefaultPath("dof.cfg"));
		ipcMain.handle("getDefaultMergedImagePath", getDefaultPath("csgo-dof-screenshot.png"));
		const win = await createWindow();
		ipcMain.handle("saveScript", saveScript());
		ipcMain.handle("mergeScreenshots", mergeScreenshots(win));
		ipcMain.handle("selectScriptPath", selectPath(win, "dof.cfg"));
		ipcMain.handle("selectMergedImagePath", selectPath(win, "csgo-dof-screenshot.png"));
	} catch (error) {
		console.error(error);
		process.exit(-1);
	}
}

main()
	.catch(console.error);

function getDefaultPath(fileName) {
	return async function () {
		const homeDir = resolve(homedir());
		const jointedPath = join(homeDir, fileName);
		const defaultPath = resolve(jointedPath);
		return defaultPath;
	};
}

function selectPath(win, defaultPath) {
	return async function () {
		const options = { defaultPath };
		const saveDialogResult = await dialog.showSaveDialog(win, options);
		if (saveDialogResult.canceled) return "";
		return saveDialogResult.filePath;
	};
}

function saveScript() {
	return async function (_event, payload) {
		await promisify(writeFile)(payload.scriptLocation, payload.script);
	};
}

function mergeScreenshots(win) {
	return async function (_event, { selectedFiles, mergedImageLocation }) {
		const screenshotsMerger = new ScreenshotsMerger(win);

		selectedFiles
			.map(path => new WeightedImage(path))
			.forEach(screenshotsMerger.add, screenshotsMerger);

		const merged = await screenshotsMerger.mergeAll();
		const data = await promisify(readFile)(merged.path);
		await promisify(writeFile)(mergedImageLocation, data);
	};
}

async function createWindow() {
	const win = new BrowserWindow({
		width: 520,
		height: 700,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	win.setMenuBarVisibility(false);
	// win.rezisable = false;
	await win.loadFile("index.html");
	return win;
}

function appReady() {
	return new Promise(function (resolve, reject) {
		const timeout = setTimeout(reject, 5000, "Timeout !");

		app.on("ready", function () {
			clearTimeout(timeout);
			resolve(undefined);
		});
	});
}

