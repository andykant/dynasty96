import fs from "fs";
import path from "path";
import feathers from "feathers";
import socketio from "feathers-socketio";
import httpProxy from "http-proxy";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import config from "./config";
import webpackConfig from "./webpack.config";
import mfl from "./mfl";

// Initialize webpack bundle
var compiler = webpack(webpackConfig, ready);
if (config.env === "dev") {
	var bundler = new WebpackDevServer(compiler, {
		publicPath: "/bundle/",
		hot: true
	});
	bundler.listen(config.devPort, config.hostname);
}

// Initialize data directory
var data = path.join(__dirname, "../data");
if (!fs.existsSync(data)) {
	fs.mkdirSync(data);
}

function ready() {
	// Load static file
	var file = (file) => fs.readFileSync(path.join(__dirname, "../src/public/" + file), "utf8");

	// Initialize the app
	var app = feathers();
	app.configure(socketio((io) => {
		// Do stuff
	}));
	app.use(feathers.static(path.join(__dirname, "../src/public")));
	
	// Load MFL data
	var data = {};
	var update = (type, json) => { data[type] = json[type] };
	mfl("league", (body) => body.league.franchises.franchise, update);
	mfl("players", (body) => body.players.player.filter(
		(player) => config.positions.indexOf(player.position) > -1
	), update);
	mfl("draftResults", (body) => body.draftResults.draftUnit.draftPick.map(
		(pick) => { pick.timestamp = parseInt(pick.timestamp,10) || 0; return pick; }
	), update, 10*60*1000);

	// Link webpack bundle
	if (config.env === "dev") {
		var proxy = httpProxy.createProxyServer();
		app.all("/bundle/*", (req, res) => {
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
