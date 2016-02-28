import Reflux from "reflux";
import Actions from "./actions";

export var League = Reflux.createStore({
	listenables: Actions,
	
	init: function() {
		this.league = [];
	},

	getInitialState: function() {
		return this.league;
	},

	onLeague: function(league) {
		this.league = league;
		this.trigger(this.league);
	}
});

export var DraftResults = Reflux.createStore({
	listenables: Actions,

	init: function() {
		this.draftResults = [];
	},

	getInitialState: function() {
		return this.draftResults;
	},

	onDraftResults: function(draftResults) {
		this.draftResults = draftResults;
		this.trigger(this.draftResults);
	},

	onDeltas: function(deltas) {
		deltas.forEach((delta) => {
			for (var i = 0, pick; pick = this.draftResults[i]; i++) {
				if (pick.pick === delta.pick && pick.round === delta.round) {
					this.draftResults[i] = delta;
					break;
				}
			}
		});
		this.trigger(this.draftResults);
	}
});

export var Players = Reflux.createStore({
	listenables: Actions,
	
	init: function() {
		this.players = [];
		this.listenTo(DraftResults, this.update);
	},

	getInitialState: function() {
		return this.players;
	},

	onPlayers: function(players) {
		this.players = players;
		this.update();
	},

	onSort: function(column) {	
		var example = this.players[0][column];	
		column = example !== undefined ? column : "dlf_adp";
		if (typeof example === "string") {
			this.players = this.players.sort((a,b) => {
				if ((a[column] || "") > (b[column] || "")) return 1;
				else if ((a[column] || "") < (b[column] || "")) return -1;
				return 0;
			});
		}
		else {
			this.players = this.players.sort((a,b) => (a[column] || a.dlf_adp || a.adp || Infinity) - (b[column] || b.dlf_adp || b.adp || Infinity));
		}
		this.trigger(this.players);
	},

	update: function(draftResults) {
		var players = this.players;
		this.draftResults = draftResults || this.draftResults || [];

		players.forEach((player) => player.left = 6);
		this.draftResults.forEach((pick) => {
			if (pick.player) {
				for (var i = 0; i < players.length; i++) {
					if (players[i].id === pick.player) {
						players[i].left--;
						break;
					}
				}
			}
		});

		this.trigger(this.players);
	}
});

