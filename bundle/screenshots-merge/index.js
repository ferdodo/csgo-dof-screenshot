import template from "./template.html";
import { ipcRenderer } from "electron";

Vue.component("screenshots-merge", {
	template,
	data, 
	"methods" : {
		mergeScreenshots
	}
});

function data(){
	return {
	}
}

async function mergeScreenshots(){
	var openResult = await ipcRenderer.send('mergeScreenshots');
}