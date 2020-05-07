export function formatEta(startTime: Date, mergeProgress: number): string {
	if (!startTime) return "";
	if (!mergeProgress) return "";
	const timeElaspedSinceStart = Date.now() - startTime.getTime();
	if (timeElaspedSinceStart < 5000) return "";
	const totalEstimatedTaskTime = timeElaspedSinceStart + timeElaspedSinceStart * (100 / mergeProgress);
	const etaMilliSeconds = totalEstimatedTaskTime * ((100 - mergeProgress) / 100);
	if (etaMilliSeconds < 5000) return "";
	return formatDuration(etaMilliSeconds);
}

function formatDuration(msec_num: number) {
	const sec_num = msec_num / 1000;
	const hours_num = Math.floor(sec_num / 3600);
	const minutes_num = Math.floor((sec_num - hours_num * 3600) / 60);
	const seconds_num = Math.floor(sec_num - hours_num * 3600 - minutes_num * 60);
	const hours = formatTimeDigit(hours_num, "hours");
	const minutes = formatTimeDigit(minutes_num, "minutes");
	const seconds = formatTimeDigit(seconds_num, "seconds");
	return `${hours} ${minutes} ${seconds}`;
}

function formatTimeDigit(value: number, label: string): string {
	if (!value) return "";
	if (value < 10) return `0${value} ${label}`;
	return `${value} ${label}`;
}
