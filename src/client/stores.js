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
		this.onSort(localStorage.getItem("sort") || "adp", true);
		this.update();
	},

	onSort: function(column, skipTrigger) {	
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
		!skipTrigger && this.trigger(this.players);
	},

	byId: function(id) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].id === id) {
				return this.players[i];
			}
		}
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

export var Franchise = Reflux.createStore({
	listenables: Actions,
	
	init: function() {
		this.franchise = null;
		this.listenTo(League, this.update);
	},

	getInitialState: function() {
		return this.franchise;
	},

	onFranchise: function(id) {
		this.update(null, id);
	},

	onClearFranchise: function() {
		this.franchise = null;
		localStorage.removeItem("franchise");
		this.trigger(this.franchise);
	},

	update: function(league, id) {
		this.league = league || this.league || [];
		id = id || localStorage.getItem("franchise");

		if (id) {
			for (var i = 0; i < this.league.length; i++) {
				if (this.league[i].id === id) {
					this.franchise = this.league[i];
					localStorage.setItem("franchise", id);
					this.trigger(this.franchise);
					break;
				}
			}
		}
	}
});

export var Next = Reflux.createStore({
	listenables: Actions,
	
	init: function() {
		this.pick = null;
		this.listenTo(Franchise, this.updateFranchise);
		this.listenTo(DraftResults, this.updateDraftResults);
	},

	getInitialState: function() {
		return this.pick;
	},

	updateFranchise: function(franchise) {
		this.franchise = franchise;
		this.update();
	},

	updateDraftResults: function(draftResults) {
		this.draftResults = draftResults;
		this.update();
	},

	overall: function(pick) {
		return (parseInt(pick.round,10) - 1) * 96 + parseInt(pick.pick,10);
	},

	update: function() {
		if (this.franchise && this.draftResults) {
			var franchise = this.franchise;
			var currentPick = this.draftResults.find((pick) => pick.timestamp === 0);
			var nextPick = this.draftResults.find((pick) => pick.timestamp === 0 && pick.franchise === franchise.id);
			var difference = currentPick && nextPick ? (this.overall(nextPick) - this.overall(currentPick)) : null;

			this.pick = {
				difference: difference,
				currentPick: currentPick,
				nextPick: nextPick,
				currentOverall: this.overall(currentPick),
				nextOverall: this.overall(nextPick)
			};
			this.trigger(this.pick);
		}
	}
});
