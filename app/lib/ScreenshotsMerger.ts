var temp = require("temp").track();
var MergeProgressSender = require("./MergeProgressSender.js");
const os = require("os");
import WeightedImage from "./WeightedImage.ts";
import { BrowserWindow } from "electron";

interface weightedImagePair {
	a: WeightedImage;
	b: WeightedImage;
	distance: number;
}

export default class ScreenshotsMerger {
	waitTempDirPath: Promise<string>;
	images: WeightedImage[];
	win: BrowserWindow;
	mergeProgressSender: any;

	constructor(win: BrowserWindow) {
		this.waitTempDirPath = temp.mkdir("tempDir");
		this.images = [];
		this.win = win;
	}

	add(weightedImage: WeightedImage): void {
		this.images.push(weightedImage);
	}

	remove(weightedImage: WeightedImage): void {
		this.images = this.images.filter((image) => image.id != weightedImage.id);
	}

	async mergeAll(): Promise<WeightedImage> {
		this.mergeProgressSender = new MergeProgressSender(this.images.length, this.win);
		const cpuCores = os.cpus().length;
		const mergeAllInstances = Array.from(Array(cpuCores)).map(this.mergeAllThread, this);
		await Promise.all(mergeAllInstances);
		await this.mergeAllThread();
		this.mergeProgressSender.sendFinish();
		if (this.images.length !== 1) throw new Error("All images are not merged !");
		return this.images[0];
	}

	private async mergeAllThread() {
		while (this.images.length > 1) {
			var { a, b } = this.getImagesPairWithClosestWeightsDistance();
			this.remove(a);
			this.remove(b);
			var tempDirPath = await this.waitTempDirPath;
			var merged = await a.merge(b, tempDirPath);
			this.add(merged);
			this.mergeProgressSender.sendProgress();
		}
	}

	private getImagesPairWithClosestWeightsDistance(): weightedImagePair {
		if (this.images.length < 2) throw new Error("There is less than two images !");

		return this.images
			.map(function (this: ScreenshotsMerger, image: WeightedImage): weightedImagePair {
				var a = image;
				var b = image.findClosest(this);
				var distance = Math.abs(a.weight - b.weight);
				return { a, b, distance };
			}, this)
			.sort(function (a: weightedImagePair, b: weightedImagePair) {
				return b.distance - a.distance;
			})[this.images.length - 1];
	}
}
