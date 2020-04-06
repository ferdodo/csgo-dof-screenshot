import Vector3D from "./Vector3D.ts";

export default class CsgoCamera {
	position: Vector3D;
	pitch: number;
	yaw: number;

	constructor(x: number, y: number, z: number) {
		this.position = new Vector3D(x, y, z);
		this.pitch = 0;
		this.yaw = 0;
	}

	randomize(spread: number) {
		const position = this.position.randomize(spread);
		return new CsgoCamera(position.x, position.y, position.z);
	}

	lookAt(target: Vector3D) {
		this.pitch = this.csgoCameraPitch(target);
		this.yaw = this.csgoCameraYaw(target);
	}

	commandGoto() {
		return [
			"spec_goto",
			`${this.position.x.toFixed(4)}`,
			`${this.position.z.toFixed(4)}`,
			`${this.position.y.toFixed(4)}`,
			`${this.yaw.toFixed(4)}`,
			`${this.pitch.toFixed(4)}`,
		].join(" ");
	}

	private csgoCameraPitch(target: Vector3D) {
		const delta = target.delta(this.position);
		const result = Math.atan2(Math.abs(delta.z), delta.x);
		const resultRadian = result * (180 / Math.PI);
		const hypothenuse = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.z, 2));
		const sin = delta.z / hypothenuse;
		if (sin < 0) return -resultRadian;
		return resultRadian;
	}

	private csgoCameraYaw(target: Vector3D) {
		const delta = target.delta(this.position);
		const horizontalDistance = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.z, 2));
		const result = -Math.atan2(Math.abs(delta.y), horizontalDistance);
		const resultRadian = result * (180 / Math.PI);
		if (delta.y < 0) return -resultRadian;
		return resultRadian;
	}
}
