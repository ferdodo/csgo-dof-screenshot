
class MergeProgressSender{

	constructor(total, win){
		this.total = Number(total);
		this.processed = 0;
		this.win = win;
	}

	sendProgress(){
		this.processed += 1;
		var progress = (this.processed / this.total) * 100;
		this.win.webContents.send("mergeProgressUpdate", progress);
	}

	sendFinish(){
		this.win.webContents.send("mergeProgressUpdate", undefined);
	}
}

module.exports = MergeProgressSender;