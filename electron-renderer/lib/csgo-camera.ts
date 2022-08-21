import { Vector3D } from "./vector-3d";

export class CsgoCamera {
	position: Vector3D;
	pitch: number;
	yaw: number;

	constructor(x: number, y: number, z: number) {
		this.position = new Vector3D(x, y, z);
		this.pitch = 0;
		this.yaw = 0;
	}

	lookAt(target: Vector3D) {
		this.pitch = this.calculatePitch(target);
		this.yaw = this.calculateYaw(target);
	}

	commandGoto() {
		return [
			"spec_goto",
			`${this.position.x.toFixed(4)}`,
			`${this.position.y.toFixed(4)}`,
			`${this.position.z.toFixed(4)}`,
			`${this.yaw.toFixed(4)}`,
			`${this.pitch.toFixed(4)}`,
		].join(" ");
	}

	private calculatePitch(target: Vector3D) {
		const delta = target.delta(this.position);
		const result = Math.atan2(Math.abs(delta.y), delta.x);
		const resultRadian = result * (180 / Math.PI);
		const hypothenuse = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
		const sin = delta.y / hypothenuse;
		if (sin < 0) return -resultRadian;
		return resultRadian;
	}

	private calculateYaw(target: Vector3D) {
		const delta = target.delta(this.position);
		const horizontalDistance = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
		const result = -Math.atan2(Math.abs(delta.z), horizontalDistance);
		const resultRadian = result * (180 / Math.PI);
		if (delta.z < 0) return -resultRadian;
		return resultRadian;
	}
}
