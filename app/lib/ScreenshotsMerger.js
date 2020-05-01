var temp = require("temp").track();
var util = require('util');
var MergeProgressSender = require("./MergeProgressSender.js");
const os = require('os');

class ScreenshotsMerger{

	constructor(win){
		this.waitTempDirPath = temp.mkdir('tempDir');
		this.images = [];
		this.win = win;
	}

	add(weightedImage){
		this.images.push(weightedImage);
	}

	remove(weightedImage){
		this.images = this.images.filter(image=> image.id != weightedImage.id);
	}

	mergeAll(){
		return _mergeAll(this);
	}
}


async function _mergeAll(screenshotsMerger){
	const mergeProgressSender = new MergeProgressSender(screenshotsMerger.images.length, screenshotsMerger.win);
	const cpuCores = os.cpus().length;
	const startMergeInstance = getInstanceStarter(screenshotsMerger, mergeProgressSender);
	const mergeAllInstances = Array.from(Array(cpuCores)).map(startMergeInstance);
	await Promise.all(mergeAllInstances)
	await startMergeInstance();
	mergeProgressSender.sendFinish();
	return screenshotsMerger.images.pop();
}


function getInstanceStarter(screenshotsMerger, mergeProgressSender){
	return async function startMergeInstance(){
		var mergeProgressSender = new MergeProgressSender(screenshotsMerger.images.length, screenshotsMerger.win);

		while (screenshotsMerger.images.length > 1){
			var {a,b} = screenshotsMerger.images.map(function (image){
				var a = image;
				var b = image.findClosest(screenshotsMerger);
				var distance = Math.abs(a.weight - b.weight);
				return {a, b, distance};
			}).sort((a,b)=>b.distance-a.distance).pop();

			screenshotsMerger.remove(a);
			screenshotsMerger.remove(b);
			var tempDirPath = await screenshotsMerger.waitTempDirPath;
			var merged = await a.merge(b, tempDirPath);
			screenshotsMerger.add(merged);
			mergeProgressSender.sendProgress();
		}
	}
}


module.exports = ScreenshotsMerger;
