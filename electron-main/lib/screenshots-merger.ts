import { track } from "temp";
import { MergeProgressSender } from "./merge-progress-sender";
import { cpus } from "os";
import { WeightedImage } from "./weighted-image";
import { BrowserWindow } from "electron";

const temp = track();

interface weightedImagePair {
	a: WeightedImage;
	b: WeightedImage;
	distance: number;
}

export class ScreenshotsMerger {
	waitTempDirPath: Promise<string>;
	images: WeightedImage[];
	win: BrowserWindow;
	mergeProgressSender: MergeProgressSender | null = null;

	constructor(win) {
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
		const cpuCores = cpus().length;

		const mergeAllInstances = Array.from(Array(cpuCores))
			.map(this.mergeAllThread, this);

		await Promise.all(mergeAllInstances);
		await this.mergeAllThread();
		this.mergeProgressSender.sendFinish();
		if (this.images.length !== 1) throw new Error("All images are not merged !");
		return this.images[0];
	}

	private async mergeAllThread() {
		while (this.images.length > 1) {
			const { a, b } = this.getImagesPairWithClosestWeightsDistance();
			this.remove(a);
			this.remove(b);
			const tempDirPath = await this.waitTempDirPath;
			const merged = await a.merge(b, tempDirPath);
			this.add(merged);
			this.mergeProgressSender?.sendProgress();
		}
	}

	private getImagesPairWithClosestWeightsDistance(): weightedImagePair {
		if (this.images.length < 2) throw new Error("There is less than two images !");

		return this.images
			.map(function (this: ScreenshotsMerger, image: WeightedImage): weightedImagePair {
				const a = image;
				const b = image.findClosest(this);
				const distance = Math.abs(a.weight - b.weight);
				return { a, b, distance };
			}, this)
			.sort(function (a: weightedImagePair, b: weightedImagePair) {
				return b.distance - a.distance;
			})[this.images.length - 1];
	}
}
