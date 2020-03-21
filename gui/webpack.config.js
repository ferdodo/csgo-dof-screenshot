const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	"mode" : "production",
	"entry": './index.js',
	"output": {
		"path": path.resolve(__dirname, 'dist'),
		"filename": 'index.js'
	}, 
	"plugins" : [new HtmlWebpackPlugin()],
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
	"target" : "electron-renderer", 
	"resolve": {
		"alias": {
		  'vue$': 'vue/dist/vue.esm.js'
		}
	}
};