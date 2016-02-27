import webpack from "webpack";
import path from "path";
import config from "./config";

var http = "http://"+config.host+":"+config.devPort;

export default {
	context: path.join(__dirname, "../src"),
	devtool: "#eval-source-map",
	entry: config.env === "dev"
		? ["webpack/hot/dev-server", "webpack-dev-server/client?" + http, "./public/index.js"]
		: "./public/index.js",
	output: {
		path: path.join(__dirname, "bundle"),
		filename: "index.js",
		publicPath: http + "/bundle/"
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel" }
		]
	},
	plugins: config.env === "dev" ? [new webpack.HotModuleReplacementPlugin()] : []
};
