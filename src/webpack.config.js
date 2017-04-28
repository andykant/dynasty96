import webpack from "webpack";
import path from "path";
import config from "./config";

var http = "http://"+config.host+":"+config.devPort;

export default {
	context: path.join(__dirname, "../src"),
	devtool: "#eval-source-map",
	entry: {
		index: config.env === "development" ? ["webpack/hot/dev-server", "webpack-dev-server/client?" + http, "./client/index.js"] : "./client/index.js",
		ranks: config.env === "development" ? ["webpack/hot/dev-server", "webpack-dev-server/client?" + http, "./client/ranks.js"] : "./client/ranks.js"
	},
	output: {
		path: path.join(__dirname, "bundle"),
		filename: "[name].js",
		publicPath: http + "/bundle/"
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel" },
			{ test: /\.css$/, exclude: /node_modules/, loader: "style!css" },
			{ test: /\.svg$/, exclude: /node_modules/, loader: "url" }
		]
	},
	plugins: config.env === "development" ? [new webpack.HotModuleReplacementPlugin()] : []
};
