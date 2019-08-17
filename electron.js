const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const fs = require('fs');
const util = require('util');
require('electron-debug')({"showDevTools": true, "enabled": true});

main();

async function main(){
	await appReady();
	var win = await createWindow();
	ipcMain.on('saveAs', saveAs(win));
}

function saveAs(win){
	return async function(event, payload){
		var saveDialogResult = await dialog.showSaveDialog(win, payload.options);
		if (saveDialogResult.cancel) return;
		await util.promisify(fs.writeFile)(saveDialogResult.filePath, payload.data);
	};
}

async function createWindow () {
	var win = new BrowserWindow({
		"width": 800,
		"height": 600,
		"webPreferences": {
			"nodeIntegration": true
		}
	});

	return await win.loadFile('index.html');
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