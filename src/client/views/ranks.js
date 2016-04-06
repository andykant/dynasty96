import React from "react";
import ReactDOM from "react-dom";
import Reflux from "reflux";
import Tooltip from "react-tooltip";
import LinkedStateMixin from "react-addons-linked-state-mixin";
import { League, Rosters, Franchise } from "../stores";

export default React.createClass({
	mixins: [
		Reflux.connect(League, "league"),
		Reflux.connect(Franchise, "franchise"),
		Reflux.connect(Rosters, "rosters"),
		LinkedStateMixin
	],

	getInitialState: function() {
		return {
			field: "dynasty96"
		};
	},

	render: function() {
		var { league, rosters, field } = this.state;
		var id = this.state.franchise && this.state.franchise.id;

		// Generate scores
		league = league && league.slice(0).map((franchise) => {
			var score = 0;
			var depth = 0;
			franchise.roster = rosters && Rosters.byId(franchise.id).sort((a, b) => {
				if (a && b) {
					return (a.ranks[field] || 300) - (b.ranks[field] || 300);
				}
				return 0;
			});
			var lineup = { QB: [], RB: [], WR: [], TE: [], total: 0 };
			franchise.roster && franchise.roster.forEach((p, index) => {
				if (p) {
					var rank = Math.round(p.ranks[field] ? (300 - p.ranks[field]) : 0);
					p.radius = 13 + Math.log(Math.max(1, rank - 100)) / Math.log(1.7)

					// Determine depth score
					score += rank;
					if (index < 10) {
						depth += rank;
					}

					// Determine lineup score
					lineup[p.position].push(rank);
				}
			});
			franchise.score = score;
			franchise.depth = depth;
			franchise.lineup = (lineup.QB[0] || 0) + (lineup.RB[0] || 0) + (lineup.WR[0] || 0) + (lineup.TE[0] || 0);
			lineup.RB.slice(1).concat(lineup.WR.slice(1), lineup.TE.slice(1)).sort((a, b) => b - a).slice(0, 3).forEach((flex) => franchise.lineup += flex );
			return franchise;
		}).sort((a,b) => {
			if (a.lineup > b.lineup) return -1;
			if (a.lineup < b.lineup) return 1;
			if (a.depth > b.depth) return -1;
			if (a.depth < b.depth) return 1;
			if (a.score > b.score) return -1;
			if (a.score < b.score) return 1;
			var aName = a.name.replace(/\<.+?\>/g,"").toLowerCase();
			var bName = b.name.replace(/\<.+?\>/g,"").toLowerCase();
			if (aName > bName) return 1;
			else if (aName < bName) return -1;
			return 0;
		});

		return <div className="ranks">
			<div className="depth-legend">
				<span className="depth-position depth-position-QB"></span>QB
				<span className="depth-position depth-position-RB"></span>RB
				<span className="depth-position depth-position-WR"></span>WR
				<span className="depth-position depth-position-TE"></span>TE
				<label>Ranking: <select valueLink={this.linkState("field")}>
					<option value="dynasty96">FantasyPros 2016 Dynasty96</option>
					<option value="fantasypros_standard">FantasyPros 2016 Standard</option>
					<option value="fantasypros_halfppr">FantasyPros 2016 Half-PPR</option>
					<option value="fantasypros_ppr">FantasyPros 2016 PPR</option>
					<option value="dlf">Dynasty League Football (DLF)</option>
				</select></label>
			</div>

			{league && league.map((franchise, index) => {
				return <div className={"depth-team" + (id === franchise.id ? " depth-team-mine" : "")} key={franchise.id}>
					<span className="ranks-rank">
						<span className="ranks-rank-index">{1 + index}</span>
						<span className="ranks-rank-score">{franchise.lineup}</span>
					</span>
					<span className="depth-title">
						<span className="depth-title-name">{franchise.name.replace(/\<.+?\>/g,"")}</span>
					</span>
					<span className="depth-players">
					{franchise.roster && franchise.roster.map((p) => p && <span key={p.id} data-tip={p.name + " #" + (p.ranks[field] || "?") + " " + p.position + (p.ranks[field + "_position"] || "?")} className={"depth-position depth-position-" + p.position} style={{ width: p.radius + "px", height: p.radius + "px", "border-width": ((25 - p.radius) / 2) + "px"}}></span>)}
					</span>
				</div>
			})}

			<Tooltip effect="solid" type="dark" class="depth-tip" />
		</div>
	}
});
