var temp = require("temp").track();
var util = require('util');
var MergeProgressSender = require("./MergeProgressSender.js");

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
	var mergeProgressSender = new MergeProgressSender(screenshotsMerger.images.length, screenshotsMerger.win);

	while (screenshotsMerger.images.length > 1){
		var {a,b} = screenshotsMerger.images.map(function(image){
			var a = image;
			var b = image.findClosest(screenshotsMerger);
			var distance = Math.abs(a.weight - b.weight);
			return {a, b, distance};
		}).sort((a,b)=>b.distance-a.distance).pop();

		var tempDirPath = await screenshotsMerger.waitTempDirPath;
		var merged = await a.merge(b, tempDirPath);
		screenshotsMerger.images.push(merged);
		screenshotsMerger.remove(a);
		screenshotsMerger.remove(b);
		mergeProgressSender.sendProgress();
	}

	mergeProgressSender.sendFinish();
	return screenshotsMerger.images.pop();
}


module.exports = ScreenshotsMerger;
