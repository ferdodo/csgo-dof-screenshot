const nodeExternals = require('webpack-node-externals');
const externals = nodeExternals({"modulesDir":"../node_modules"});

module.exports = {
	"mode": "development",
	"entry": "./index.ts",
	"output": {
		"filename": "index.js",
		"path" : __dirname
	},
	"target": 'node',
	"module": {
		"rules": [{
			"test": /\.ts$/,
			"use": ['ts-loader']
		}],
	},
	externals
};