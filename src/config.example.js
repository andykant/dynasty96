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
	// MFL Starters
	starters: { QB: 1, RB: 1, WR: 1, TE: 1, FLEX: 3 },
	// Copies per player
	copiesPerPlayer: 6,
	// MFL draft result refresh rate
	refreshRate: 10 * 60 * 1000,
	// MFL league refresh rate
	leagueRefreshRate: 1000 * 60 * 60 * 24,
	// Crawl refresh rate
	crawlRefreshRate: 1000 * 60 * 60 * 24,
	// Socket.IO transports
	transports: ["websocket", "polling"],
	// Whether to redirect to another website
	// redirect: "http://path.to/host",
	// Default ranking
	ranking: "fantasypros_halfppr",
	// Number of teams
	teams: 16,
	// Whether this is in-season
	inSeason: true
};
