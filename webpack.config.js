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
		},{
			"test" : /\.css$/,
			"use" : ['style-loader', 'css-loader']
		},{
			"test": /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2|otf)$/i,
			"loader": 'url-loader',
			"options": {
				"limit": 8192,
			}
		}
	]},
	"target" : "electron-renderer"
};