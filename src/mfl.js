import fs from "fs";
import path from "path";
import request from "request";
import config from "./config";

export default function get(type, parse, callback, refreshRate) {
	// Load the data, requesting it as necessary
	var json = path.join(__dirname, "../data/" + type + ".json");
	if (!refreshRate && fs.existsSync(json)) {
		console.log("Loading MFL API: " + type + " (cached)");
	  callback(type, JSON.parse(fs.readFileSync(json)));
	}
	else {
		console.log("Loading MFL API: " + type + " (" + Date.now() + ")");
		request.get({
			url: "http://football.myfantasyleague.com/" + config.year + "/export?TYPE=" + type + "&JSON=1&FRANCHISES=16&L=" + config.league, 
			json: true
		}, (e, r, body) => {
			var data = { [type]: parse(body) };
			fs.writeFileSync(json, JSON.stringify(data, null, 2));
			callback(type, data);
		});
	};

	// Refresh this every X milliseconds
	if (refreshRate) {
		setTimeout(() => get.apply(get, arguments), refreshRate);
	}
};
