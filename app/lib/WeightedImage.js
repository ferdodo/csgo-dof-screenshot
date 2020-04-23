var uuid = require('uuid/v4');
var { exec } = require("child_process");
const path = require('path');
const { writeFile } = require('fs');

class WeightedImage{

	constructor(path, weight){
		this.id = uuid();
		this.path = String(path);
		this.weight = Number(weight || 1);
	}

	findClosest(screenshotsMerger){
		var images = screenshotsMerger.images.filter(image=>this.id!=image.id);
		var weight = this.weight;
		return images.sort((a, b)=>Math.abs(weight-b)>Math.abs(weight-a)).pop();
	}

	merge(image, tempDirectory){
		return _merge(this, image, tempDirectory)
	}
}

async function _merge(A, B, tempDirectory){
	const ressourcePath = process.resourcesPath;
	const imgMergerPath = path.join(ressourcePath, 'imgMerger');
	const ratio = B.weight / A.weight;
	const command = `${ imgMergerPath } ${ ratio } ${ A.path } ${ B.path }`
	const fileBuffer = await execAsyncWrap(command, {maxBuffer: 1024 * 1000 * 16, encoding: 'base64'});
	const newPath = `${tempDirectory}/${uuid()}.png`;
	await writeFileAsyncWrap(newPath, fileBuffer);
	return new WeightedImage(newPath, A.weight+B.weight);
}

function execAsyncWrap(command, options){
	return new Promise(function(resolve, reject){
		exec(command, options || {}, function callback(error, stdout, stderr){
			if (error){
				const hint = JSON.stringify({ command, error : String(error), stdout: String(stdout), stderr: String(stderr) }, null, 4);
				reject(new Error(`Failed to execute command ! ${ hint }`));
			} else {
				resolve(new Buffer(stdout, 'base64'));
			}
		});
	});
}

function writeFileAsyncWrap(file, data){
	return new Promise(function(resolve, reject){
		writeFile(file, data, function(err){
			if (err){
				const hint = JSON.stringify({ error : String(error) }, null, 4);
				reject(new Error(`Failed to write file ! ${ hint }`));
			} else {
				resolve();
			}
		});
	});
}

module.exports = WeightedImage;