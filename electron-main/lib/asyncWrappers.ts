const { execFile: realExecFile } = require("child_process");
const { writeFile: realWriteFile } = require("fs");

export async function execFile(file: string, args: string[]): Promise<Buffer> {
	return await new Promise(function (resolve, reject) {
		realExecFile(file, args, { maxBuffer: 1024 * 1000 * 16, encoding: "base64" }, function callback(
			error: Error,
			stdout: string,
			stderr: string
		) {
			if (error) {
				const hint = JSON.stringify(
					{
						file,
						error,
						stdout: Buffer.from(stdout, "base64").toString(),
						stderr: Buffer.from(stderr, "base64").toString(),
					},
					null,
					4
				);

				reject(new Error(`Failed to execute command ! ${hint}`));
			} else {
				resolve(Buffer.from(stdout, "base64"));
			}
		});
	});
}

export async function writeFile(file: string, data: Buffer) {
	await new Promise(function (resolve, reject) {
		realWriteFile(file, data, function (err: Error) {
			if (err) {
				const hint = JSON.stringify({ error: String(err) }, null, 4);
				reject(new Error(`Failed to write file ! ${hint}`));
			} else {
				resolve();
			}
		});
	});
}
