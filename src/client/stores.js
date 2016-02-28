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
		// TODO
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
	},

	onPlayers: function(players) {
		this.players = players;
		this.update();
	}
});

