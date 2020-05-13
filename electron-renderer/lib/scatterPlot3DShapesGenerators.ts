import Vector3D from "./Vector3D.ts";
const PROGRESSIVE_MIN_SIZE = 0.2;
const PROGRESSIVE_FACTOR = 1.02;

function randomLinear(a: number, b: number): number {
	return a * (Math.random() - 0.5) + b;
}

export function* createCubeGenerator(position: Vector3D, size: number): Generator<Vector3D, Vector3D, Vector3D> {
	const generateX = () => randomLinear(size, position.x);
	const generateY = () => randomLinear(size, position.y);
	const generateZ = () => randomLinear(size, position.z);
	while (true) yield new Vector3D(generateX(), generateY(), generateZ());
}

export function* createSphereGenerator(position: Vector3D, diameter: number): Generator<Vector3D, Vector3D, Vector3D> {
	const cubeGenerator = createCubeGenerator(position, diameter);
	const sphereRadius = diameter / 2;

	while (true) {
		var vector = cubeGenerator.next().value;
		if (!vector.isIntoSphere(position, sphereRadius)) continue;
		yield vector;
	}
}

export function* createProgressiveSphereGenerator(position: Vector3D): Generator<Vector3D, Vector3D, Vector3D> {
	let diameter = PROGRESSIVE_MIN_SIZE;

	while (true) {
		var sphereGenerator = createSphereGenerator(position, diameter);
		yield sphereGenerator.next().value;
		diameter *= PROGRESSIVE_FACTOR;
	}
}

export function* createDiscGenerator(position: Vector3D, target: Vector3D, diameter: number): Generator<Vector3D, Vector3D, Vector3D> {
	const sphereGenerator = createSphereGenerator(position, diameter);
	const distanceToTarget = position.distanceTo(target);
	const distanceToTargetMax = distanceToTarget + diameter * 0.01;
	const distanceToTargetMin = distanceToTarget - diameter * 0.99;

	while (true) {
		var vector = sphereGenerator.next().value;
		var vectorDistanceToTarget = vector.distanceTo(target);
		if (vectorDistanceToTarget > distanceToTargetMax) continue;
		if (vectorDistanceToTarget < distanceToTargetMin) continue;
		yield vector;
	}
}

export function* createProgressiveDiscGenerator(position: Vector3D, target: Vector3D): Generator<Vector3D, Vector3D, Vector3D> {
	let diameter = PROGRESSIVE_MIN_SIZE;

	while (true) {
		var discGenerator = createDiscGenerator(position, target, diameter);
		yield discGenerator.next().value;
		diameter *= PROGRESSIVE_FACTOR;
	}
}
