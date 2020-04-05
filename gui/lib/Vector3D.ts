export default class Vector3D{
	x: number;
	y: number;
	z: number;

	constructor(x:number, y:number, z:number){
		this.x = Number(x);
		this.y = Number(y);
		this.z = Number(z);
		if (!Number.isFinite(this.x)) throw new Error("X is not a finite number!");
		if (!Number.isFinite(this.y)) throw new Error("Y is not a finite number!");
		if (!Number.isFinite(this.z)) throw new Error("Z is not a finite number!");
	}

	get json(){
		return {
			"x" : this.x,
			"y" : this.y,
			"z" : this.z,
		};
	}

	randomize(spread:number){
		const x = this.x + spread * (Math.random()-0.5);
		const y = this.y + spread * (Math.random()-0.5);
		const z = this.z + spread * (Math.random()-0.5);
		return new Vector3D(x,y,z);
	}

	delta(vector3d:Vector3D){
		const x = this.x - vector3d.x;
		const y = this.y - vector3d.y;
		const z = this.z - vector3d.z;
		return new Vector3D(x,y,z);
	}

	public static csgoCameraPitch(camera:Vector3D, target:Vector3D){
		const delta = target.delta(camera);
		const result = radians_to_degrees(Math.atan2(Math.abs(delta.z), delta.x));
		const hypothenuse = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.z, 2));
		const sin = delta.z / hypothenuse;
		if (sin < 0) return -result;
		return result;
	} 

	public static csgoCameraYaw(camera:Vector3D, target:Vector3D){
		const delta = target.delta(camera);
		const horizontalDistance = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.z, 2));
		const result = -radians_to_degrees(Math.atan2(Math.abs(delta.y), horizontalDistance));
		if (delta.y < 0) return -result;
		return result;
	}
}



// https://www.w3resource.com/javascript-exercises/javascript-math-exercise-34.php
function radians_to_degrees(radians:number){
	return radians * (180/Math.PI);
}