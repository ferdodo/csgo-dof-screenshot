import template from "./template.html";
import { ipcRenderer } from "electron";
import Vue from "vue";

Vue.component("screenshots-merge", {
	template,
	data,
	mounted,
	methods: {
		mergeScreenshots,
		updateMergeProgress,
		selectFiles,
		init,
		selectMergedImagePath,
	},
	computed: {
		eta,
	},
});

function selectFiles(event) {
	const fileList = event.target.files;
	const fileListArr = Array.from(fileList);
	const paths = fileListArr.map((file) => file.path);
	this.selectedFiles = paths;
}

async function mounted() {
	await this.init();
	this.initialized = true;
	ipcRenderer.on("mergeProgressUpdate", this.updateMergeProgress);
}

function updateMergeProgress(event, data) {
	if (!this.startTime && data) this.startTime = new Date();
	if (!data) this.startTime = undefined;
	this.mergeProgress = data;
}

function data() {
	return {
		selectedFiles: [],
		mergeProgress: undefined,
		startTime: undefined,
		mergedImageLocation: "",
		initialized: false,
		mergeSuccess: false,
	};
}


async function selectMergedImagePath(){
	this.mergedImageLocation = await ipcRenderer.invoke("selectMergedImagePath");
}


async function mergeScreenshots() {
	this.mergeSuccess = false;
	const selectedFiles = this.selectedFiles;
	const mergedImageLocation = this.mergedImageLocation;
	await ipcRenderer.invoke("mergeScreenshots", { selectedFiles, mergedImageLocation });
	this.mergeSuccess = true;
}

function eta() {
	if (!this.startTime) return;
	if (!this.mergeProgress) return;
	const timeElaspedSinceStart = Date.now() - this.startTime.getTime();
	if (timeElaspedSinceStart < 5000) return;
	const totalTime = timeElaspedSinceStart + timeElaspedSinceStart * (100 / this.mergeProgress);
	const etaMilliSeconds = totalTime * ((100 - this.mergeProgress) / 100);
	if (etaMilliSeconds < 5000) return;
	return formatDuration(etaMilliSeconds);
}

// https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
function formatDuration(msec_num) {
	var sec_num = msec_num / 1000;
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - hours * 3600) / 60);
	var seconds = Math.floor(sec_num - hours * 3600 - minutes * 60);
	if (hours < 10 && hours > 0) hours = "0" + hours;
	if (minutes < 10 && minutes > 0) minutes = "0" + minutes;
	if (seconds < 10 && seconds > 0) seconds = "0" + seconds;
	var result = "";
	if (hours) result += ` ${hours} hours`;
	if (minutes) result += ` ${minutes} minutes`;
	if (seconds) result += ` ${seconds} seconds`;
	return result;
}

async function init() {
	var retry = 0;

	while (true) {
		try {
			this.mergedImageLocation = await ipcRenderer.invoke("getDefaultMergedImagePath");
			break;
		} catch (error) {
			retry++;
			if (retry > 10) throw error;

			await new Promise(function (resolve) {
				setTimeout(resolve, 50);
			});
		}
	}
}
