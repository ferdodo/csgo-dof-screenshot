const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const fs = require('fs');
const util = require('util');
var temp = require("temp").track();
var Jimp = require("jimp");

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
		var tempDirPath = await util.promisify(temp.mkdir)('tempDir');
		var imageToBeProcessed = filePaths.map(o=>{ return {"path":o, "weight" : 1}});
		var initialImagesCount = filePaths.length;

		while (imageToBeProcessed.length > 1){
			imageToBeProcessed.sort((a,b)=>a.weight-b.weight).reverse();

			for (var i = 0; i < imageToBeProcessed.length; i++) {
				if (imageToBeProcessed[0].weight === imageToBeProcessed[1].weight) break;
				imageToBeProcessed.push(imageToBeProcessed.shift())
			}

			var imgA = imageToBeProcessed.shift();
			var imgB = imageToBeProcessed.shift();
			var opacity = imgB.weight / (imgA.weight + imgB.weight);
			var imgAJimp = await Jimp.read(imgA.path);
			var imgBJimp = await Jimp.read(imgB.path);
			imgBJimp.fade(1-opacity);
			var jimpMerged = imgAJimp.blit(imgBJimp, 0, 0);

			var merged = {
				"path" : `${tempDirPath}/${randomStr()}.png`, 
				"weight" : imgA.weight+imgB.weight,
				"unlink" : true
			};

			imageToBeProcessed.unshift(merged);
			if (imgA.unlink) await util.promisify(fs.unlink)(imgA.path);
			if (imgB.unlink) await util.promisify(fs.unlink)(imgB.path);
			await jimpMerged.writeAsync(merged.path);
			var progress = ((initialImagesCount-imageToBeProcessed.length)/initialImagesCount)*100;
			win.webContents.send("mergeProgressUpdate", progress);
		}

		win.webContents.send("mergeProgressUpdate", undefined);
		var data = await util.promisify(fs.readFile)(imageToBeProcessed[0].path);
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