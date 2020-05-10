export default class Vector3D {
	x: number;
	y: number;
	z: number;

	constructor(x: number, y: number, z: number) {
		this.x = Number(x);
		this.y = Number(y);
		this.z = Number(z);
		if (!Number.isFinite(this.x)) throw new Error("X is not a finite number!");
		if (!Number.isFinite(this.y)) throw new Error("Y is not a finite number!");
		if (!Number.isFinite(this.z)) throw new Error("Z is not a finite number!");
	}

	randomize(spread: number): Vector3D {
		const x = this.x + spread * (Math.random() - 0.5);
		const y = this.y + spread * (Math.random() - 0.5);
		const z = this.z + spread * (Math.random() - 0.5);
		return new Vector3D(x, y, z);
	}

	delta(vector3d: Vector3D): Vector3D {
		const x = this.x - vector3d.x;
		const y = this.y - vector3d.y;
		const z = this.z - vector3d.z;
		return new Vector3D(x, y, z);
	}

	distanceTo(vector3d: Vector3D): number{
		const delta = this.delta(vector3d);
		const hypothenuse2D = Math.hypot(delta.x, delta.y);
		return Math.hypot(hypothenuse2D, delta.z);
	}

	isIntoSphere(spherePosition: Vector3D, sphereRadius: number){
		return this.distanceTo(spherePosition) < sphereRadius;
	}
}
