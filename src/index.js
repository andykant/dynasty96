import fs from "fs";
import path from "path";
import feathers from "feathers";
import socketio from "feathers-socketio";
import httpProxy from "http-proxy";
import request from "request";
import requestSync from "sync-request";
import webpack from "webpack";
import gitRev from "git-rev";
import WebpackDevServer from "webpack-dev-server";
import config from "./config";
import webpackConfig from "./webpack.config";
import mfl from "./mfl";
import crawl from "./crawl";

process.env.NODE_ENV = config.env;

gitRev.short((rev) => {
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
	var update = function(type) {};
	var timestamp = () => Math.floor(Date.now() / 1000);
	var load = (type, json) => {
		data[type] = json[type];

		var matchPlayer = (player, callback) => {
			for (var i = 0; i < data.players.length; i++) {
				if (player.position === data.players[i].position && player.name.split(" ").slice(0, 2).join(" ").replace(/[. ,]/g,"").toLowerCase().match(new RegExp(data.players[i].name.replace(/[. ,]/g,"").toLowerCase()))) {
					callback(data.players[i]);
				}
			}
		};

		// Adjust player names
		if (data.players && type === "players") {
			data.players.forEach((player) => {
	      var comma = player.name.indexOf(", ");
	      comma = comma > -1 ? comma : player.name.length;
	      player.name = player.name.slice(comma + 2) + " " + player.name.slice(0, comma);
	      player.ranks = {};
	    });
		}

		// Merge MFL ADP
		if (data.adp && data.players && ["adp","players"].indexOf(type) > -1) {
			data.adp.forEach((player) => {
				for (var i = 0; i < data.players.length; i++) {
					if (data.players[i].id === player.id) {
						data.players[i].adp = Math.round(player.averagePick);
					}
				}
			});
		}

		// // Merge DLF ADP
		// if (data.dlf && data.players && ["dlf","players"].indexOf(type) > -1) {
		// 	var positions = { QB: 0, RB: 0, WR: 0, TE: 0 };
		// 	data.dlf.forEach((player) => {
		// 		matchPlayer(player, (p) => {
		// 			p.dlf_adp = Math.round(6*player.rank);
		// 			p.dlf_stddev = Math.round(6*player.stddev);
		// 			p.age = player.age;
		// 			p.ranks.dlf = player.overall;
		// 			p.ranks.dlf_position = ++positions[p.position];
		// 		});
		// 	});
		// }

		// Merge FantasyPros Ranks
		if (data["fantasypros-standard"] && data.players && ["fantasypros-standard","players"].indexOf(type) > -1) {
			data["fantasypros-standard"].forEach((player) => {
				matchPlayer(player, (p) => {
					p.ranks.fantasypros_standard = player.rank;
					p.ranks.fantasypros_standard_position = player.positionRank;
				});
			});
		}
		if (data["fantasypros-ppr"] && data.players && ["fantasypros-ppr","players"].indexOf(type) > -1) {
			data["fantasypros-ppr"].forEach((player) => {
				matchPlayer(player, (p) => {
					p.ranks.fantasypros_ppr = player.rank;
					p.ranks.fantasypros_ppr_position = player.positionRank;
				});
			});
		}
		if (data["fantasypros-halfppr"] && data.players && ["fantasypros-halfppr","players"].indexOf(type) > -1) {
			data["fantasypros-halfppr"].forEach((player) => {
				matchPlayer(player, (p) => {
					p.ranks.fantasypros_halfppr = player.rank;
					p.ranks.fantasypros_halfppr_position = player.positionRank;
				});
			});
		}

		// Generate Dynasty96 startup
		if (data.draftResults && data.players && ["draftResults","players"].indexOf(type) > -1) {
			var players = {};
			data.draftResults.forEach((result) => {
				players[result.player] = players[result.player] || 0;
				players[result.player] += 96 * 20 - (parseInt(result.round, 10) - 1) * 96 - parseInt(result.pick, 10);
			});
			var ranks = [];
			var positions = { QB: 0, RB: 0, WR: 0, TE: 0 };
			Object.keys(players).map((id) => [id, players[id]]).sort((a,b) => b[1] - a[1]).forEach((rank, index) => {
				for (var i = 0; i < data.players.length; i++) {
					if (data.players[i].id === rank[0]) {
						data.players[i].ranks.startup = 1 + index;
						data.players[i].ranks.startup_position = ++positions[data.players[i].position];
					}
				}
			});
		}

		// Generate Dynasty96 ranking
		if (data["fantasypros-standard"] && data["fantasypros-halfppr"] && data["fantasypros-ppr"] && data.players && ["fantasypros-standard","fantasypros-halfppr","fantasypros-ppr","players"].indexOf(type) > -1) {
			var ranks = [];
			data.players.forEach((player) => {
				ranks.push({
					player: player,
					rank: Math.round(100 * ((player.ranks.fantasypros_standard || 300) + (player.ranks.fantasypros_ppr || 300)) / 2 * (player.position === "QB" ? 0.9 : 1)) / 100
				});
			});
			ranks = ranks.sort((a, b) => a.rank - b.rank);
			var positions = { QB: 0, RB: 0, WR: 0, TE: 0 };
			ranks.forEach((rank, index) => {
				rank.player.ranks.dynasty96 = Math.min(300, index + 1);
				rank.player.ranks.dynasty96_position = ++positions[rank.player.position];
			});

			update("players");
		}

		// Sort players
		if (data.dlf && data.adp && data.fantasypros && data.players && ["adp","dlf","players"].indexOf(type) > -1) {
			data.players = data.players.sort((a,b) => (a.adp || Infinity) - (b.adp || Infinity));
		}

		update(type);
	};
	mfl("league", (body) => body.league.franchises.franchise, load, !config.redirect && config.leagueRefreshRate);
	mfl("rosters", (body) => {
		var rosters = {};
		body.rosters.franchise.forEach((f) => {
			rosters[f.id] = f.player.map((p) => p.id);
		});
		return rosters;
	}, load, !config.redirect && config.leagueRefreshRate);
	mfl("adp", (body) => body.adp.player.map(
		(player) => (player.averagePick = parseFloat(player.averagePick)*6) && player
	), load);
	mfl("players", (body) => body.players.player.filter(
		(player) => config.positions.indexOf(player.position) > -1
	), load);
	mfl("weeklyResults", (body) => {
		if (!body.allWeeklyResults) return undefined;
		var schedules = {};
		body.allWeeklyResults.weeklyResults.forEach((week) => {
			week.matchup && week.matchup.forEach((matchup) => {
				var a = matchup.franchise[0].id;
				var b = matchup.franchise[1].id;
				schedules[a] = schedules[a] || [];
				schedules[b] = schedules[b] || [];
				schedules[a].push(b);
				schedules[b].push(a);
			});
		});
		return schedules;
	}, load, !config.redirect && config.leagueRefreshRate, true);
	mfl("draftResults", (body) => body.draftResults.draftUnit.draftPick.map(
		(pick) => { pick.timestamp = parseInt(pick.timestamp,10) || 0; return pick; }
	), load, !config.redirect && config.refreshRate);
	crawl("dlf", {
		url: () => {
			var month, year;
			var body = requestSync("GET", "http://dynastyleaguefootball.com/rankings/dynasty-100").getBody("utf-8");
			body.replace(/\<a href="(http:\/\/dynastyleaguefootball\.com\/adpdata\/2016-adp\/\?month=(\d+)&year=(\d+))">[A-Z]+\<\/a\>/gm, (whole, href, m, y) => {
				month = m;
				year = y;
			});
			return "http://dynastyleaguefootball.com/DLF-includes/ADP/ADP2overall.php?month=" + month + "&year=" + year;
		},
		headers: {
			"Cookie": "amember_ru=" + config.dlf_username + "; amember_rp=" + config.dlf_password
		}
	}, (body) => {
		var players = [];
		var selector = /\<td .+?\>(.+?)\<\/td\>[\n\r\s]*\<td .+?\>(.+?)\<\/td\>[\n\r\s]+\<td.*?style="font-size:10px;".*?\>[\n\r\s]*(.+?)[\n\r\s]*\<\/td\>[\n\r\s]+\<td .+?\>(.*?)\<\/td\>[\n\r\s]+\<td .+?\>(.+?)\<\/td\>[\n\r\s]+\<td .+?\>([\s\S]+?)\<\/td\>[\n\r\s]+\<td .+?\>(.+?)\<\/td\>/gm;
		body.replace(selector, (whole, overall, position, name, age, rank, change, stddev) => {
			players.push({
				name: name = name.replace(/\<a.*?\>/,"").replace(/\<\/a\>/,""),
				position: position,
				age: parseInt(age, 10),
				rank: parseFloat(rank),
				stddev: parseFloat(stddev),
				overall: parseInt(overall, 10)
			});
		});
		return players;
	}, load, !config.redirect && config.crawlRefreshRate);
	crawl("fantasypros-standard", {
		url: "https://www.fantasypros.com/nfl/rankings/consensus-cheatsheets.php"
	}, (body) => {
		var players = [];
		var selector = /\<tr class="mpb-player.*?"\>\<td\>(\d+)\<\/td\>[\s\n\r]*\<td.*?\>.*?\<a.*?\>(.*?)\<\/a\>.*?\<\/td\>[\s\n\r]*\<td\>(QB|RB|WR|TE)(\d+)\<\/td\>/gm;
		body.replace(selector, (whole, rank, name, position, positionRank) => {
			players.push({
				name: name = name.replace(/\<a.*?\>/,"").replace(/\<\/a\>/,""),
				position: position,
				rank: parseInt(rank, 10),
				positionRank: parseFloat(positionRank, 10)
			});
		});
		return players;
	}, load, !config.redirect && config.crawlRefreshRate);
	crawl("fantasypros-ppr", {
		url: "https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php"
	}, (body) => {
		var players = [];
		var selector = /\<tr class="mpb-player.*?"\>\<td\>(\d+)\<\/td\>[\s\n\r]*\<td.*?\>.*?\<a.*?\>(.*?)\<\/a\>.*?\<\/td\>[\s\n\r]*\<td\>(QB|RB|WR|TE)(\d+)\<\/td\>/gm;
		body.replace(selector, (whole, rank, name, position, positionRank) => {
			players.push({
				name: name = name.replace(/\<a.*?\>/,"").replace(/\<\/a\>/,""),
				position: position,
				rank: parseInt(rank, 10),
				positionRank: parseFloat(positionRank, 10)
			});
		});
		return players;
	}, load, !config.redirect && config.crawlRefreshRate);
	crawl("fantasypros-halfppr", {
		url: "https://www.fantasypros.com/nfl/rankings/half-point-ppr-cheatsheets.php"
	}, (body) => {
		var players = [];
		var selector = /\<tr class="mpb-player.*?"\>\<td\>(\d+)\<\/td\>[\s\n\r]*\<td.*?\>.*?\<a.*?\>(.*?)\<\/a\>.*?\<\/td\>[\s\n\r]*\<td\>(QB|RB|WR|TE)(\d+)\<\/td\>/gm;
		body.replace(selector, (whole, rank, name, position, positionRank) => {
			players.push({
				name: name = name.replace(/\<a.*?\>/,"").replace(/\<\/a\>/,""),
				position: position,
				rank: parseInt(rank, 10),
				positionRank: parseFloat(positionRank, 10)
			});
		});
		return players;
	}, load, !config.redirect && config.crawlRefreshRate);
	var franchisejson = path.join(__dirname, "../data/franchise.json");
	load("franchise", fs.existsSync(franchisejson) ? JSON.parse(fs.readFileSync(franchisejson)) : { franchise: {} });

	function ready() {
		// Load static file
		var file = (file) => fs.readFileSync(path.join(__dirname, "../src/client/" + file), "utf8").replace(/__HASH__/g, rev);

		// Initialize the app
		var app = feathers();
		app.configure(socketio((io) => {
			var sockets = [];
			var id = 0;

			// Manage connections
			io.on("connection", (socket) => {
				// Set initial data
				sockets.push(socket);
				socket.id = ++id;
				var picks = deltas(0);
				socket.delta = picks.length > 0 ? picks[picks.length - 1].timestamp : 0;
				console.log("#" + socket.id + " connected");
				socket.emit("init");
				socket.emit("league", data.league);
				socket.emit("players", data.players);
				socket.emit("draftResults", data.draftResults);
				socket.emit("rosters", data.rosters);
				socket.emit("weeklyResults", data.weeklyResults);

				// Handle reconnections
				socket.on("reconnect", () => {
					console.log("#" + socket.id + " reconnected");
					sockets.push(socket);
					send_deltas(socket);
				});
				socket.on("disconnect", () => {
					console.log("#" + socket.id + " disconnected");
					sockets.splice(sockets.indexOf(socket), 1);
				});

				// Handle franchise logging
				socket.on("franchise", (id) => {
					var franchise = data.league.find((team) => team.id === id);
					socket.franchise = franchise;
					data.franchise[id] = data.franchise[id] || Object.assign({
						count: 0
					}, franchise);
					data.franchise[id].count++;
					fs.writeFileSync(franchisejson, JSON.stringify({ franchise: data.franchise }, null, 2));

					// Admin logging
					if (id === "0066") {
						socket.emit("usage", {
							counts: data.franchise,
							active: sockets.map((socket) => (socket.franchise && socket.franchise.name && socket.franchise.name.replace(/\<.+?\>/g,"")) || "?")
						});
					}
				});
			});

			// Push deltas on update
			update = (type) => {
				if (type === "draftResults") {
					sockets.forEach((socket) => send_deltas(socket));
				}
				else if (["league","players","rosters","weeklyResults"].indexOf(type) > -1) {
					sockets.forEach((socket) => socket.emit(type, data[type]));
				}
			}

			// Send delta picks
			function send_deltas(socket) {
				var picks = deltas(socket.delta);
				socket.emit("delta", picks);
				socket.delta = picks[picks.length - 1].timestamp || socket.delta;
			};

			// Retrieve deltas
			function deltas(timestamp) {
				var picks = data.draftResults.filter((pick) => !!pick.timestamp);
				for (var i = 0; i < picks.length; i++) {
					if (picks[i].timestamp < timestamp) {
						continue;
					}
					else {
						return picks.slice(i);
					}
				}
				return picks;
			};
		}));
		app.get("/", (req, res) => res.send(file("index.html")));
		app.get("/ranks", (req, res) => res.send(file("ranks.html")));

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
});
