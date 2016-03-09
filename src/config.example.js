export default {
	// Environment: development | production
	env: "production",
	// Host
	host: "localhost",
	// Port
	port: 80,
	// Dev port
	devPort: 8080,
	// MFL league
	league: 0,
	// MFL year
	year: 2016,
	// MFL Positions
	positions: ["QB","RB","WR","TE"],
	// MFL refresh rate
	refreshRate: 10 * 60 * 1000,
	// Socket.IO transports
	transports: ["websocket", "polling"],
	// Whether to redirect to another website
	redirect: "http://path.to/host"
};
