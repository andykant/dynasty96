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

export var Players = Reflux.createStore({
	listenables: Actions,
	
	init: function() {
		this.players = [];
	},

	getInitialState: function() {
		return this.players;
	},

	onPlayers: function(players) {
		this.players = players;
		this.trigger(this.players);
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
