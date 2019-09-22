var gulp = require('gulp');
var copy = require('copy');
var {promisify} = require('util')
const path = require('path');

gulp.task('default', async function (cb) {
	var destination = path.resolve(__dirname, '../../www');

	var files = [
		"electron.js",
		"icon.png",
		"index.html"
	];

	await Promise.all(files.map(file=>promisify(copy)(file, destination)));
	cb();
});