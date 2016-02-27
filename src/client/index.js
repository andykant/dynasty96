import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import Players from "./players";

var timestamp = () => Math.floor(Date.now() / 1000);
var socket = io({ transports: ["websocket", "polling"] });

console.log("Dynasty96", timestamp());
socket.on("league", (league) => Actions.league(league));
socket.on("players", (players) => Actions.players(players));
socket.on("draftResults", (draftResults) => Actions.draftResults(draftResults));
socket.on("delta", (deltas) => Actions.deltas(deltas));

ReactDOM.render(<Players />, document.getElementById("app"));
