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

process.env.NODE_ENV = config.env;

// Initialize webpack bundle
var compiler = webpack(webpackConfig, ready);
if (config.env === "development") {
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
	
// Load MFL data
var data = {};
var update = function() {};
var timestamp = () => Math.floor(Date.now() / 1000);
var load = (type, json) => {
	data[type] = json[type];

	// Merge ADPs
	if (data.adp && data.players && ["adp","players"].indexOf(type) > -1) {
		data.adp.forEach((player) => {
			for (var i = 0; i < data.players.length; i++) {
				if (data.players[i].id === player.id) {
					data.players[i].adp = Math.round(10*player.averagePick)/10;
				}
			}
		});
		data.players.sort((a,b) => b.averagePick || 0 - a.averagePick || 0);
	}

	update();
};
mfl("league", (body) => body.league.franchises.franchise, load);
mfl("adp", (body) => body.adp.player.map(
	(player) => (player.averagePick = parseFloat(player.averagePick)*6) && player
), load);
mfl("players", (body) => body.players.player.filter(
	(player) => config.positions.indexOf(player.position) > -1
), load);
mfl("draftResults", (body) => body.draftResults.draftUnit.draftPick.map(
	(pick) => { pick.timestamp = parseInt(pick.timestamp,10) || 0; return pick; }
), load, 10*60*1000);

function ready() {
	// Load static file
	var file = (file) => fs.readFileSync(path.join(__dirname, "../src/client/" + file), "utf8");

	// Initialize the app
	var app = feathers();
	app.configure(socketio((io) => {
		var sockets = [];

		// Manage connections
		io.on("connection", (socket) => {
			// Set initial data
			socket.delta = 0;
			socket.emit("league", data.league);
			socket.emit("players", data.players);
			socket.emit("draftResults", data.draftResults);

			// Handle reconnections
			socket.on("reconnect", () => {
				sockets.push(socket);
				socket.emit("delta", deltas(socket.delta));
				socket.delta = timestamp();
			});
			socket.on("disconnect", () => {
				sockets.splice(sockets.indexOf(socket), 1);
			});
		});

		// Push deltas on update
		update = function() {
			var ts = timestamp();
			var d = deltas(ts);
			sockets.forEach((socket) => {
				socket.delta = ts;
				socket.emit("delta", ts, d);
			});
		};

		// Retrieve deltas
		function deltas(timestamp) {
			var picks = data.draftResults.filter((pick) => !!pick.timestamp);
			for (var i = picks.length - 1; i >= 0; i--) {
				if (timestamp < picks[i].timestamp) {
					return picks.slice(i);
				}
			}
			return picks;
		};
	}));
	app.get("/", (req, res) => res.send(file("index.html")));

	// Link webpack bundle
	if (config.env === "development") {
		var proxy = httpProxy.createProxyServer();
		app.all("/bundle/*", (req, res) => {
			proxy.web(req, res, {
				target: "http://" + config.host + ":" + config.devPort
			});
		});
	}
	else {
		app.use("/bundle", feathers.static(path.join(__dirname, "bundle")));
	}

	// Listen
	app.listen(config.port);
	console.log("Listening on port: " + config.port + " (" + config.env + ")");
};
