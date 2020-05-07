import Vector3D from "../lib/Vector3D.ts";
import CsgoCamera from "../lib/CsgoCamera.ts";

export function formatScript(target: Vector3D, camera: CsgoCamera, spread: number, bindKey: string): string {
	return Array.from(new Array(600))
		.map((_: any, i: number) => printCommand(camera, target, spread, i, bindKey))
		.join("")
		.concat(`bind ${bindKey} dof1;\n`);
}

function printCommand(
	camera: CsgoCamera,
	target: Vector3D,
	spread: number,
	aliasNumber: number,
	bindKey: string
): string {
	const shakedCamera = camera.randomize(spread);
	shakedCamera.lookAt(target);
	const command1 = `devshots_screenshot`;
	const command2 = shakedCamera.commandGoto();
	const command3 = `bind ${bindKey} dof${aliasNumber + 1}`;
	const commands = `${[command1, command2, command3].join("; ")}`;
	const alias = `alias dof${aliasNumber} "${commands}"\n`;
	return alias;
}
