const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const fs = require('fs');
const util = require('util');
var ScreenshotsMerger = require("./lib/ScreenshotsMerger.js");
var WeightedImage = require("./lib/WeightedImage.js");


main();

async function main(){
	await appReady();
	var win = await createWindow();
	ipcMain.on('saveAs', saveAs(win));
	ipcMain.on('mergeScreenshots', mergeScreenshots(win));
}

function saveAs(win){
	return async function(event, payload){
		var saveDialogResult = await dialog.showSaveDialog(win, payload.options);
		if (saveDialogResult.canceled) return;
		await util.promisify(fs.writeFile)(saveDialogResult.filePath, payload.data); 
	};
}

function mergeScreenshots(win){
	return async function(event, payload){
		var {filePaths, canceled} = await dialog.showOpenDialog(win, {"properties":["openFile","multiSelections"]});
		if (canceled) return;
		var screenshotsMerger = new ScreenshotsMerger(win);
		filePaths.map(path=>new WeightedImage(path)).forEach(screenshotsMerger.add, screenshotsMerger);
		var merged = await screenshotsMerger.mergeAll();
		var data = await util.promisify(fs.readFile)(merged.path);
		await saveAs(win)(null, {data, "options" : {"defaultPath" : "csgo-dof-screenshot.png"}});
	}
}

async function createWindow(){
	var win = new BrowserWindow({
		"width": 490,
		"height": 600,
		"webPreferences": {
			"nodeIntegration": true
		}
	});

	win.setMenuBarVisibility(false);
	win.setResizable(false);
	await win.loadFile('gui/dist/index.html');
	return win;
}

function appReady(){
	return new Promise(function(resolve, reject){ 
		var timeout = setTimeout(reject, 5000, "Timeout !");
		
		app.on('ready', function(){
			clearTimeout(timeout);
			resolve();
		});
	});
}

// https://gist.github.com/6174/6062387
function randomStr(){
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}