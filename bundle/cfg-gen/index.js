import template from "./template.html";
import { ipcRenderer } from "electron";

Vue.component("cfg-gen", {
	template,
	data, 
	"computed" : {
		script
	}, 
	"methods" : {
		saveScript
	}
});

function data(){
	return {
		"cameraX"     : 680,
		"cameraY"     : 571,
		"cameraZ"     : 122,
		"targetX"     : 693,
		"targetY"     : 546,
		"targetZ"     : 122,
		"dofStrength" : 3,
		"bindKey"     : "I"
	}
}

function script(){
	var tmp = "";

	var camera = {
		"x" : this.cameraX,
		"z" : this.cameraY,
		"y" : this.cameraZ
	};

	var target = {
		"x" : this.targetX,
		"z" : this.targetY,
		"y" : this.targetZ
	};

	for (var i = 0; i < 600; i++) tmp += printCommand(camera, target, this.dofStrength, i);
	tmp += `bind ${String(this.bindKey)} dof1;\n`;
	return tmp;
}


function calculatePitch(camera, target){
	var delta = {
		"x" : target.x - camera.x,
		"z" : target.z - camera.z
	};

	var result = radians_to_degrees(Math.atan2(Math.abs(delta.z), delta.x));
	var hypothenuse = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.z, 2));
	var sin = delta.z / hypothenuse;
	if (sin < 0) result = -result;
	return result;
} 

function calculateYaw(camera, target){
	var delta = {
		"x" : target.x - camera.x,
		"y" : target.y - camera.y,
		"z" : target.z - camera.z,
	};

	var horizontalDistance = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.z, 2));
	var result = -radians_to_degrees(Math.atan2(Math.abs(delta.y, 2), horizontalDistance));
	if (delta.y < 0) result = -result;
	return result;
}


function printCommand(camera, target, spread, aliasNumber){
	var shakedCamera = {
		"x" : Number(camera.x) + spread * (Math.random()-0.5),
		"y" : Number(camera.y) + spread * (Math.random()-0.5),
		"z" : Number(camera.z) + spread * (Math.random()-0.5)
	}

	var pitch = calculatePitch(shakedCamera, target);
	var yaw = calculateYaw(shakedCamera, target);
	return `alias dof${aliasNumber} "devshots_screenshot; spec_goto ${shakedCamera.x.toFixed(4)} ${shakedCamera.z.toFixed(4)} ${shakedCamera.y.toFixed(4)} ${yaw.toFixed(4)} ${pitch.toFixed(4)}; bind o dof${aliasNumber+1}";\n`;
}


// https://www.w3resource.com/javascript-exercises/javascript-math-exercise-34.php
function radians_to_degrees(radians){
	var pi = Math.PI;
	return radians * (180/pi);
}


function saveScript(){
	ipcRenderer.send('saveAs', {
		"data" : this.script,
		"options" : {
			"defaultPath" : "dof.cfg"
		}
	})
}