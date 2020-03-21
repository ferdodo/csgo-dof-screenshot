var {Application} = require('spectron');
var {execSync} = require("child_process");


(async function main(){
	try{
		var app = createSpectronApp();
		await app.start();
		await app.stop();
	}catch(error){
		console.error(error);
		process.exit(-1);
	}
})();



function createSpectronApp(){
	var path = undefined;

	switch(process.platform){
		case "win32": path = "dist/win-unpacked/csgo-dof-screenshot.exe"; break;
		case "linux": path = "dist/linux-unpacked/csgo-dof-screenshot"; break;
		default: throw new Error("Testing is not supported on this platform !");
	}

	var args = ['--no-sandbox', '--headless', '--disable-gpu'];
	return new Application({path, args});
}