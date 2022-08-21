import { BrowserWindow } from "electron";

export class MergeProgressSender {
	total: number;
	processed: number;
	win: BrowserWindow;

	constructor(total, win){
		this.total = Number(total);
		this.processed = 0;
		this.win = win;
	}

	sendProgress(){
		this.processed += 1;
		const progress = (this.processed / this.total) * 100;
		this.win.webContents.send("mergeProgressUpdate", progress);
	}

	sendFinish(){
		this.win.webContents.send("mergeProgressUpdate", undefined);
	}
}
