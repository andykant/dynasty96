import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import Actions from "./actions";
import App from "./views/ranks";
import config from "../config";
import "./index.css";

var timestamp = () => Math.floor(Date.now() / 1000);
var socket = io();

console.log("Dynasty96", timestamp());
socket.on("league", (league) => Actions.league(league));
// socket.on("rosters", (rosters) => Actions.rosters(rosters));
socket.on("players", (players) => Actions.players(players));
socket.on("weeklyResults", (schedules) => Actions.schedules(schedules));

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

document.addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<App />, document.getElementById("ranks"));
}, false);
