const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const externals = nodeExternals({ modulesDir: "../node_modules" });

module.exports = {
	mode: "development",
	entry: "./index.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "index.js",
	},
	plugins: [new HtmlWebpackPlugin()],
	module: {
		rules: [
			{
				test: /\.html$/,
				use: ["raw-loader"],
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2|otf)$/i,
				loader: "url-loader",
			},
			{
				test: /\.ts$/,
				use: ["ts-loader"],
			},
		],
	},
	target: "electron-renderer",
	resolve: {
		alias: {
			vue$: "vue/dist/vue.esm.js",
		},
	},
	externals: createExternals(),
};

function createExternals() {
	const modulesDir = "../node_modules";
	const whitelist = ["vue", "electron"];
	return nodeExternals({ modulesDir, whitelist });
}
