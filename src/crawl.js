import fs from "fs";
import path from "path";
import request from "request";
import config from "./config";

var timeouts = {};

export default function get(type, options, parse, callback, refreshRate) {
	// Load the data, requesting it as necessary
	var json = path.join(__dirname, "../data/" + type + ".json");

	// Use the cache if it exists
	if (fs.existsSync(json) && !timeouts[type]) {
		console.log("Loading Crawl: " + type + " (cached)");
	  callback(type, JSON.parse(fs.readFileSync(json)));
	}
	else {
		console.log("Loading Crawl: " + type + " (" + Date.now() + ")");
		request.get(Object.assign({}, options, {
			url: typeof options.url === "function" ? options.url() : options.url
		}), (e, r, body) => {
			if (!e) {
				var data = { [type]: parse(body) };
				fs.writeFileSync(json, JSON.stringify(data, null, 2));
				callback(type, data);
			}
			else {
				console.log(type + " failed, " + type + " is down");
			}
		});
	};

	// Refresh this every X milliseconds
	if (refreshRate) {
		timeouts[type] = setTimeout(() => get.apply(get, arguments), refreshRate);
	}
};
