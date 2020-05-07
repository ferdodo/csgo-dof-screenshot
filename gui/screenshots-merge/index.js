import template from "./template.html";
import { ipcRenderer } from "electron";
import Vue from "vue";
import { formatEta } from "./util.ts";

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
	return formatEta(this.startTime, this.mergeProgress);
}