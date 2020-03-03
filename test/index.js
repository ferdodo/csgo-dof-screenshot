var {Application} = require('spectron');
var {execSync} = require("child_process");

main().catch(exitBadly);


async function main(){
	var app = createApplication();
	await app.start();
	await sleep(10)
	await app.stop();
	printSuccess();
}


function printSuccess(){
	console.log("######################");
	console.log("# SUCCESSFUL TESTING #");
	console.log("######################");	
}


function exitBadly(error){
	console.error(error);
	process.exit(-1);
}


function sleep(time){
	return new Promise(function(resolve, reject){
		setTimeout(resolve, time*1000);
	});
}


function createApplication(){
	var path = undefined;

	switch(process.platform){
		case "win32": path = "dist/win-unpacked/csgo-dof-screenshot.exe"; break;
		case "linux": path = "dist/linux-unpacked/csgo-dof-screenshot"; break;
		default: throw new Error("Testing is not supported on this platform !");
	}

	var args = ['--no-sandbox', '--headless', '--disable-gpu'];
	return new Application({path, args});
}