import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
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
if (id) {
	socket.emit("franchise", id);
	if (id === "0066") {
		socket.emit("usage", (usage) => {
			console.log(usage);
			Object.keys(usage).forEach((key) => console.log(usage[key].name, usage[key].count));
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	Modal.setAppElement(document.getElementById("app"));
	ReactDOM.render(<App />, document.getElementById("app"));
}, false);
