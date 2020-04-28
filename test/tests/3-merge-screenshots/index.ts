import TestRunner from "../../lib/TestRunner.ts";
import { setInput } from "../../lib/TestUtils.ts";
const { readFileSync } = require("fs");
const path = require("path");
const Jimp = require("jimp");
const { accessSync, constants:fsConstants } = require('fs');

export default async function test(testRunner: TestRunner) {
	const testFiles = ["blue", "green", "red"]
		.map(o=>o+".png")
		.map(o=>path.join("test", "tests", "3-merge-screenshots", o))
		.map(o=>path.resolve(o))
		.join(" \n ");

	const client = testRunner.spectronApp.client;
	await client.clearElement("#mergeFilesInput");
	await client.setValue("#mergeFilesInput", testFiles);
	const mergedFilePath = path.resolve(path.join("test", "tests", "3-merge-screenshots", "gray.png"));
	await setInput(testRunner, "#inputMergedImagePath", mergedFilePath);
	await testRunner.spectronApp.client.click("#buttonMergeScreenshots");
	var retry = 0;

	while (true) {
		try {
			await testRunner.spectronApp.client.getValue("#displayMergeSuccess");
			break;
		} catch (error) {
			retry++;
			if (retry > 10) throw error;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	const bitmapFilePath = path.resolve(path.join("test", "tests", "3-merge-screenshots", "gray.bmp"));
	const img = await Jimp.read(mergedFilePath);
	await img.write(bitmapFilePath);

	var retry = 0;

	while (true) {
		try {
			accessSync(bitmapFilePath, fsConstants.R_OK);
			break;
		} catch (error) {
			retry++;
			if (retry > 10) throw error;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	const fileBuffer = readFileSync(bitmapFilePath);
	const fileIntArray = fileBuffer.toJSON().data;
	const pixelSample = fileIntArray.slice(700, 705);
	const expectedValueMin = 80;
	const expectedValueMax = 90;

	if (pixelSample.some((pixel: number) => pixel < expectedValueMin || pixel > expectedValueMax)) {
		const hint = JSON.stringify({ expectedValueMin, expectedValueMax, pixelSample }, null, 4);
		throw new Error(`Some pixels does not have the expected value ! ${hint}`);
	}
}
