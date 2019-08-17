const path = require('path');

module.exports = {
	"entry": './bundle/index.js',
	"output": {
		"path": path.resolve(__dirname, '.'),
		"filename": 'bundle.js'
	}, 
	"module" : {
		"rules" : [{
			"test" : /\.html$/,
			"use" : ['raw-loader']
		}]
	},
	"target" : "electron-renderer"
};