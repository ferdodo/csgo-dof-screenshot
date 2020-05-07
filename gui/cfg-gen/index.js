import template from "./template.html";
import { ipcRenderer } from "electron";
import Vue from "vue";
import Vector3D from "../lib/Vector3D.ts";
import CsgoCamera from "../lib/CsgoCamera.ts";
import { formatScript } from "./util.ts";

Vue.component("cfg-gen", {
	template,
	data: () => ({
		cameraX: 680,
		cameraY: 571,
		cameraZ: 122,
		targetX: 693,
		targetY: 546,
		targetZ: 122,
		dofStrength: 3,
		bindKey: "I",
		scriptSaved: false,
		scriptLocation: "",
		ready: false,
	}),
	mounted,
	computed: { script },
	methods: {
		saveScript,
		selectScriptPath,
	},
});

async function mounted() {
	this.scriptLocation = await ipcRenderer.invoke("getDefaultScriptPath");
	this.ready = true;
}

async function selectScriptPath() {
	const newValue = await ipcRenderer.invoke("selectScriptPath");
	this.scriptLocation = newValue || this.scriptLocation;
}

function script() {
	const target = new Vector3D(this.targetX, this.targetY, this.targetZ);
	const camera = new CsgoCamera(this.cameraX, this.cameraY, this.cameraZ);
	return formatScript(target, camera, Number(this.dofStrength), String(this.bindKey));
}

async function saveScript() {
	const script = this.script;
	const scriptLocation = this.scriptLocation;
	this.scriptSaved = "pending";
	await ipcRenderer.invoke("saveScript", { script, scriptLocation });
	this.scriptSaved = true;
}
