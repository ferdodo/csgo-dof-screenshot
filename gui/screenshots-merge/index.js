import template from "./template.html";
import { ipcRenderer } from "electron";
import Vue from "vue";

Vue.component("screenshots-merge", {
	template,
	data: () => ({
		selectedFiles: [],
		mergeProgress: undefined,
		startTime: undefined,
		mergedImageLocation: "",
		ready: false,
		mergeSuccess: false,
	}),
	mounted,
	methods: {
		mergeScreenshots,
		updateMergeProgress,
		selectFiles,
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
	this.mergedImageLocation = await ipcRenderer.invoke("getDefaultMergedImagePath");
	ipcRenderer.on("mergeProgressUpdate", this.updateMergeProgress);
	this.ready = true;
}

function updateMergeProgress(_, data) {
	if (!this.startTime && data) this.startTime = new Date();
	if (!data) this.startTime = undefined;
	this.mergeProgress = data;
}

async function selectMergedImagePath() {
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
	if (!this.startTime) return "";
	if (!this.mergeProgress) return "";
	const timeElaspedSinceStart = Date.now() - this.startTime.getTime();
	if (timeElaspedSinceStart < 5000) return "";
	const totalEstimatedTaskTime = timeElaspedSinceStart + timeElaspedSinceStart * (100 / this.mergeProgress);
	const etaMilliSeconds = totalEstimatedTaskTime * ((100 - this.mergeProgress) / 100);
	if (etaMilliSeconds < 5000) return "";
	return formatDuration(etaMilliSeconds);
}

function formatDuration(msec_num) {
	const sec_num = msec_num / 1000;
	const hours_num = Math.floor(sec_num / 3600);
	const minutes_num = Math.floor((sec_num - hours_num * 3600) / 60);
	const seconds_num = Math.floor(sec_num - hours_num * 3600 - minutes_num * 60);
	const hours = padTime(hours_num, 24, "hours");
	const minutes = padTime(minutes_num, 60, "minutes");
	const seconds = padTime(seconds_num, 60, "seconds");
	return `${hours} ${minutes} ${seconds}`;
}

function padTime(x, bound, label) {
	if (x >= bound || x < 0) throw new Error("Value out of bonds !");
	if (!x) return "";
	if (x < 10) return `0${x} ${label}`;
	return String(x);
}
