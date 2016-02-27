var timestamp = () => Math.floor(Date.now() / 1000);

var socket = io({ transports: ["websocket", "polling"] });

console.log("Dynasty96", timestamp());
socket.on("league", (players) => console.log(players));
socket.on("players", (players) => console.log(players));
socket.on("draftResults", (players) => console.log(players));
