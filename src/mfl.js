import fs from "fs";
import path from "path";
import request from "request";
import config from "./config";

var timeouts = {};

export default function get(type, parse, callback, refreshRate, forceParse) {
	// Load the data, requesting it as necessary
	var json = path.join(__dirname, "../data/" + type + ".json");

	// Use the cache if it exists
	if (fs.existsSync(json) && !timeouts[type]) {
		console.log("Loading MFL API: " + type + " (cached)");
	  callback(type, JSON.parse(fs.readFileSync(json)));
	}
	else {
		console.log("Loading MFL API: " + type + " (" + Date.now() + ")");
		request.get({
			url: "http://football.myfantasyleague.com/" + config.year + "/export?TYPE=" + type + "&JSON=1&FRANCHISES=16&W=YTD&L=" + config.league, 
			json: true
		}, (e, r, body) => {
			if ((body[type] || (forceParse && body)) && (body = parse(body))) {
				var data = { [type]: body };
				fs.writeFileSync(json, JSON.stringify(data, null, 2));
				callback(type, data);
			}
			else {
				console.log(type + " failed, MFL is down");
			}
		});
	};

	// Refresh this every X milliseconds
	if (refreshRate) {
		timeouts[type] = setTimeout(() => get.apply(get, arguments), refreshRate);
	}
};
