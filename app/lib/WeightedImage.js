var uuid = require('uuid/v4');
var Jimp = require("jimp");


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
	var opacity = B.weight / (A.weight + B.weight);
	var AJimp = await Jimp.read(A.path);
	var BJimp = await Jimp.read(B.path);
	BJimp.fade(1-opacity);
	var jimpMerged = AJimp.blit(BJimp, 0, 0);
	var newPath = `${tempDirectory}/${uuid()}.png`;
	await jimpMerged.writeAsync(newPath);
	return new WeightedImage(newPath, A.weight+B.weight);
}


module.exports = WeightedImage;