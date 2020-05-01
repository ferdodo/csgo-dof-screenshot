const { v4: uuidv4 } = require('uuid');
var { execFile } = require("child_process");
const path = require('path');
const { writeFile, accessSync, constants:fsConstants } = require('fs');

class WeightedImage{

	constructor(path, weight){
		this.id = uuidv4();
		this.path = String(path);
		this.weight = Number(weight || 1);
	}

	findClosest(screenshotsMerger){
		var images = screenshotsMerger.images.filter(image=>this.id!=image.id);
		var weight = this.weight;
		return images.sort((a, b)=>Math.abs(weight-b.weight)-Math.abs(weight-a.weight)).pop();
	}

	merge(image, tempDirectory){
		return _merge(this, image, tempDirectory)
	}
}

async function _merge(A, B, tempDirectory){
	const imgMergerPath = getImgMergerPath();
	const ratio = A.weight / B.weight;

	const fileBuffer = await new Promise(function(resolve, reject){
		execFile(imgMergerPath, [ratio, A.path, B.path], {maxBuffer: 1024 * 1000 * 16, encoding: 'base64'}, function callback(error, stdout, stderr){
			if (error){
				const hint = JSON.stringify({ imgMergerPath, error : String(error), stdout: String(stdout), stderr: String(stderr) }, null, 4);
				reject(new Error(`Failed to execute command ! ${ hint }`));
			} else {
				resolve(new Buffer(stdout, 'base64'));
			}
		});
	});

	const newPath = `${tempDirectory}/${uuidv4()}.png`;
	await writeFileAsyncWrap(newPath, fileBuffer);
	return new WeightedImage(newPath, A.weight+B.weight);
}

function getImgMergerPath(){
	const caseA = path.resolve(path.join(__dirname, '..', '..', 'imgMerger', 'bin', 'imgMerger'));
	const caseB = path.join(process.resourcesPath, 'imgMerger');

	try{
		accessSync(caseA, fsConstants.X_OK);
		return caseA;
	} catch(error){
		try{
			accessSync(caseB, fsConstants.X_OK);
			return caseB;
		} catch(error){
			throw `Failed to get imgMerger path ! \n ${error.message + error.stack || error}`
		}
	}
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