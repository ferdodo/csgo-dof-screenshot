const { v4: uuidv4 } = require("uuid");
const { imgMergerPath } = require("./constants.js");
import { execFile, writeFile } from "./asyncWrappers.ts";

export default class WeightedImage {
	id: string;
	path: string;
	weight: number;

	constructor(path: string, weight: number) {
		this.id = uuidv4();
		this.path = String(path);
		this.weight = Number(weight || 1);
	}

	findClosest(screenshotsMerger: any): WeightedImage {
		const id = this.id;
		const images = screenshotsMerger.images.filter((image: WeightedImage) => id != image.id);
		const weight = this.weight;

		return images
			.sort((a: WeightedImage, b: WeightedImage) => Math.abs(weight - b.weight) - Math.abs(weight - a.weight))
			.pop();
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
