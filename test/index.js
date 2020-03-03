var {Application} = require('spectron');
var {execSync} = require("child_process");

main().catch(exitBadly);


async function main(){
	var app = new Application({
		path: 'dist/linux-unpacked/csgo-dof-screenshot',
		args: ['--no-sandbox', '--headless', '--disable-gpu']
	});
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