import webpack from "webpack";
import path from "path";
import config from "./config";

export default {
	context: __dirname,
	devtool: "eval-source-map",
	entry: config.env === "dev"
		? ["webpack/hot/dev-server", "webpack-dev-server/client?http://"+config.host+":"+config.devPort, "./public/index.js"]
		: "./public/index.js",
	output: {
		path: path.join(__dirname, "bundle"),
		filename: "index.js",
		publicPath: "/bundle/"
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel" }
		]
	},
	plugins: config.env === "dev" ? [new webpack.HotModuleReplacementPlugin()] : []
};
