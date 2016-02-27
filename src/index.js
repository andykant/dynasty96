import fs from "fs";
import path from "path";
import feathers from "feathers";
import socketio from "feathers-socketio";
import httpProxy from "http-proxy";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import config from "./config";
import webpackConfig from "./webpack.config";

// Initialize webpack bundle
var compiler = webpack(webpackConfig, ready);
if (config.env === "dev") {
	var bundler = new WebpackDevServer(compiler);
	bundler.listen(config.devPort, config.hostname);
}

function ready() {
	// Load the index page
	var index = fs.readFileSync(path.join(__dirname, "../src/public/index.html"), "utf8");

	// Initialize the app
	var app = feathers();
	app.configure(socketio((io) => {
		// Do stuff
	}));
	app.get("/", (req, res) => res.send(index));

	// Link webpack bundle
	if (config.env === "dev") {
		var proxy = httpProxy.createProxyServer();
		app.use("/bundle/*", (req, res) => {
			proxy.web(req, res, {
				target: "http://" + config.host + ":" + config.devPort
			});
		});
	}
	else {
		app.use("/bundle/*", feathers.static(path.join(__dirname, "bundle")));
	}

	// Listen
	app.listen(config.port);
	console.log("Listening on port " + config.port + " (" + config.env + ")");
};
