import template from "./template.html";
import { ipcRenderer } from "electron";

Vue.component("screenshots-merge", {
	template,
	data,
	mounted,
	"methods" : {
		mergeScreenshots,
		updateMergeProgress
	}
});

async function mounted(){
	await ipcRenderer.on('mergeProgressUpdate', this.updateMergeProgress);
}

function updateMergeProgress(event, data){
	this.mergeProgress = data;
}

function data(){
	return {
		"mergeProgress" : undefined
	}
}

async function mergeScreenshots(){
	var openResult = await ipcRenderer.send('mergeScreenshots');
}