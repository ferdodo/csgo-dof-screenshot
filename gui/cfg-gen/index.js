import template from "./template.html";
import { ipcRenderer } from "electron";
import Vue from "vue";
import Vector3D from "../lib/Vector3D.ts";
import CsgoCamera from "../lib/CsgoCamera.ts";

Vue.component("cfg-gen", {
	template,
	data,
	computed: {
		script,
	},
	methods: {
		saveScript,
	},
});

function data() {
	return {
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
	};
}

function script() {
	const target = new Vector3D(this.targetX, this.targetY, this.targetZ);
	const camera = new CsgoCamera(this.cameraX, this.cameraY, this.cameraZ);

	return Array.from(new Array(600))
		.map((_, i) => printCommand(camera, target, this.dofStrength, i, this.bindKey))
		.join("")
		.concat(`bind ${String(this.bindKey)} dof1;\n`);
}

function printCommand(camera, target, spread, aliasNumber, bindKey) {
	const shakedCamera = camera.randomize(spread);
	shakedCamera.lookAt(target);
	const command1 = `devshots_screenshot`;
	const command2 = shakedCamera.commandGoto();
	const command3 = `bind ${bindKey} dof${aliasNumber + 1}`;
	const commands = `${[command1, command2, command3].join("; ")}`;
	const alias = `alias dof${aliasNumber} "${commands}"\n`;
	return alias;
}

async function saveScript() {
	const script = this.script;
	const scriptLocation = this.scriptLocation;
	this.scriptSaved = "pending";
	await ipcRenderer.invoke("saveScript", { script, scriptLocation });
	this.scriptSaved = true;
}
