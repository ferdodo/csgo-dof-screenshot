import Vector3D from "../lib/Vector3D.ts";
import CsgoCamera from "../lib/CsgoCamera.ts";
import { createDiscGenerator } from "../lib/scatterPlot3DShapesGenerators.ts";


export function formatScript(target: Vector3D, camera: CsgoCamera, spread: number, bindKey: string): string {
	const focalShapeGenerator = createDiscGenerator(camera.position, target, spread);

	return Array.from(new Array(600))
		.map((_: any, i: number) => printCommand(focalShapeGenerator, target, i, bindKey))
		.join("")
		.concat(`bind ${bindKey} dof1;\n`);
}

function printCommand(
	focalShapeGenerator: Generator<Vector3D, Vector3D, Vector3D>,
	target: Vector3D,
	aliasNumber: number,
	bindKey: string,
): string {
	const position = focalShapeGenerator.next().value;
	const camera = new CsgoCamera(position.x, position.y, position.z);
	camera.lookAt(target);
	const command1 = `devshots_screenshot`;
	const command2 = camera.commandGoto();
	const command3 = `bind ${bindKey} dof${aliasNumber + 1}`;
	const commands = `${[command1, command2, command3].join("; ")}`;
	const alias = `alias dof${aliasNumber} "${commands}"\n`;
	return alias;
}
