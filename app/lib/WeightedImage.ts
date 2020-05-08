const { v4: uuidv4 } = require("uuid");
const { imgMergerPath } = require("./constants.js");
import { execFile, writeFile } from "./asyncWrappers.ts";
import ScreenshotsMerger from "./ScreenshotsMerger.ts";

export default class WeightedImage {
	id: string;
	path: string;
	weight: number;

	constructor(path: string, weight: number) {
		this.id = uuidv4();
		this.path = String(path);
		this.weight = Number(weight || 1);
	}

	findClosest(screenshotsMerger: ScreenshotsMerger): WeightedImage {
		const id = this.id;
		const images = screenshotsMerger.images.filter((image: WeightedImage) => id != image.id);
		const weight = this.weight;

		if (images.length === 0) throw new Error("Array is empty !");

		return images
			.sort((a: WeightedImage, b: WeightedImage) => Math.abs(weight - b.weight) - Math.abs(weight - a.weight))
			[images.length-1];
	}

	async merge(image: WeightedImage, tempDirectory: string): Promise<WeightedImage> {
		const ratio = this.weight / image.weight;
		const path = this.path;
		const fileBuffer = await execFile(imgMergerPath, [String(ratio), path, image.path]);
		const newPath = `${tempDirectory}/${uuidv4()}.png`;
		await writeFile(newPath, fileBuffer);
		return new WeightedImage(newPath, this.weight + image.weight);
	}
}
