import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import Actions from "./actions";
import App from "./views/index";
import config from "../config";
import "./index.css";

// Load localStorage query
if (window.location.search.slice(1).length > 0) {
	var storage = JSON.parse(decodeURIComponent(window.location.search.slice(1)));
	Object.keys(storage).forEach((key) => localStorage.setItem(key, storage[key]));
	window.location = "http://" + window.location.hostname + "/";
}
// Redirect to the new server
else if (config.redirect && config.redirect.indexOf(window.location.hostname) === -1) {
	window.location = config.redirect + "?" + encodeURIComponent(JSON.stringify(localStorage));
}
// Otherwise load like normal
else {
	var timestamp = () => Math.floor(Date.now() / 1000);
	var socket = io();

	console.log("Dynasty96", timestamp());
	socket.on("league", (league) => Actions.league(league));
	socket.on("players", (players) => Actions.players(players));
	socket.on("draftResults", (draftResults) => Actions.draftResults(draftResults));
	socket.on("delta", (deltas) => Actions.deltas(deltas));

	// Listen for forced reload
	var INIT = false;
	socket.on("init", () => {
	  if (INIT) {
	    setTimeout(function() {
	      location.reload();
	    }, 1000);
	  }
	  else {
	  	INIT = true;
	  }
	});

	// Set up franchise
	Actions.franchise.listen((id) => {
		socket.emit("franchise", id);
	});
	var id = localStorage.getItem("franchise");
	id && socket.emit("franchise", id);
	socket.on("usage", (usage) => {
		console.log(usage.counts);
		Object.keys(usage.counts).forEach((key) => console.log(usage.counts[key].name, usage.counts[key].count));
		console.log("ACTIVE (" + usage.active.length + "):\n" + usage.active.join("\n"));
	});

	document.addEventListener("DOMContentLoaded", () => {
		Modal.setAppElement(document.getElementById("app"));
		ReactDOM.render(<App />, document.getElementById("app"));
	}, false);
}
