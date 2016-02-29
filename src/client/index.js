import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import App from "./views/index";
import config from "../config";
import "./index.css";

var timestamp = () => Math.floor(Date.now() / 1000);
var socket = io({ transports: config.transports });

console.log("Dynasty96", timestamp());
socket.on("league", (league) => Actions.league(league));
socket.on("players", (players) => Actions.players(players));
socket.on("draftResults", (draftResults) => Actions.draftResults(draftResults));
socket.on("delta", (deltas) => Actions.deltas(deltas));

Actions.franchise.listen((id) => {
	socket.emit("franchise", id);
});
var id;
if (id = localStorage.getItem("franchise")) {
	socket.emit("franchise", id);
	if (id === "0066") {
		socket.emit("usage", (usage) => {
			console.log(usage);
			Object.keys(usage).forEach((key) => console.log(usage[key].name, usage[key].count));
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<App />, document.getElementById("app"));
}, false);
