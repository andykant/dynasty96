import React from "react";
import ReactDOM from "react-dom";
import Reflux from "reflux";
import Tooltip from "react-tooltip";
import LinkedStateMixin from "react-addons-linked-state-mixin";
import { League, Rosters, Franchise, Schedules } from "../stores";

var DEPTH = {
	starters: 7,
	ten: 10,
	twelve: 12,
	total: 20
};

function tier(positionRank) { 
	if (positionRank / 16 <= 6 / 16) return "★";
	else return Math.floor(positionRank / 16) + 1;
};

export default React.createClass({
	mixins: [
		Reflux.connect(League, "league"),
		Reflux.connect(Franchise, "franchise"),
		Reflux.connect(Rosters, "rosters"),
		Reflux.connect(Schedules, "schedules"),
		LinkedStateMixin
	],

	getInitialState: function() {
		return {
			field: "dynasty96",
			depth: "starters"
		};
	},

	render: function() {
		var { league, rosters, field, depth, schedules } = this.state;
		var id = this.state.franchise && this.state.franchise.id;
		var max = DEPTH[depth];
		var sos = field === "sos";
		var record = field === "record";
		field = sos || record ? "dynasty96" : field;

		// Generate scores
		league = league && league.slice(0).map((franchise) => {
			franchise.roster = rosters && Rosters.byId(franchise.id).sort((a, b) => {
				if (a && b) {
					return (a.ranks[field] || 300) - (b.ranks[field] || 300);
				}
				return 0;
			});

			// Force 1 of each position into the starting lineup
			franchise.roster && ["TE","WR","RB","QB"].forEach((position, i) => {
				var first = franchise.roster.filter(p => p && p.position === position)[0];
				if (first) {
					franchise.roster.splice(franchise.roster.indexOf(first), 1);
					franchise.roster.unshift(first);
				}
				else {
					franchise.roster.unshift({
						name: "N/A",
						position: position,
						ranks: {
							[field]: undefined
						}
					});
				}
			});

			// Restrict to 1 QB in the starting lineup!
			var QBs = franchise.roster && franchise.roster.filter(p => p && p.position === "QB");
			var moveQBs = [];
			QBs && QBs.slice(1).forEach((player) => {
				var qbIndex = franchise.roster.indexOf(player);
				if (qbIndex < 7) {
					franchise.roster.splice(qbIndex, 1);
					moveQBs.push(player);
				}
			});
			if (moveQBs.length > 0) {
				franchise.roster.splice.apply(franchise.roster, [7,0].concat(moveQBs));
			}

			var lineup = { QB: [], RB: [], WR: [], TE: [], total: 0 };
			franchise.roster && franchise.roster.forEach((p, index) => {
				if (p) {
					var rank = Math.round(p.ranks[field] ? (300 - p.ranks[field]) : 0);
					p.radius = Math.round(13 + Math.log(Math.max(1, rank - 100)) / Math.log(1.7));
					p.radius += p.radius % 2;

					// Determine lineup score
					lineup[p.position].push(rank);
				}
			});

			// Determine base starters
			var score = (lineup.QB[0] || 0) + (lineup.RB[0] || 0) + (lineup.WR[0] || 0) + (lineup.TE[0] || 0);
			var count = (lineup.QB.length && 1) + (lineup.RB.length && 1) + (lineup.WR.length && 1) + (lineup.TE.length && 1);

			// Determine top flex
			var allFlex = lineup.RB.slice(1).concat(lineup.WR.slice(1), lineup.TE.slice(1)).sort((a, b) => b - a);
			var topFlex = allFlex.slice(0, 3);
			allFlex = allFlex.slice(3);
			count += topFlex.length;
			topFlex.forEach((flex) => score += flex);
			allFlex = allFlex.concat(lineup.QB.slice(1));
			allFlex.slice(0, max - count).forEach((flex) => score += flex);
			franchise.score = score;

			return franchise;
		}).sort((a,b) => {
			if (a.score > b.score) return -1;
			if (a.score < b.score) return 1;
			var aName = a.name.replace(/\<.+?\>/g,"").toLowerCase();
			var bName = b.name.replace(/\<.+?\>/g,"").toLowerCase();
			if (aName > bName) return 1;
			else if (aName < bName) return -1;
			return 0;
		});

		if (sos && league && schedules) {
			league.forEach((franchise) => {
				var score = 0;
				schedules[franchise.id].forEach((id) => {
					score += 96 - league.indexOf(league.filter(f => f.id === id)[0]);
				});
				franchise.sos = score;
			});
			league = league.map((franchise) => {
				franchise.score = franchise.sos;
				return franchise;
			}).sort((a,b) => b.score - a.score);
		}

		if (record && league && schedules) {
			league.forEach((franchise) => {
				var wins = 0;
				schedules[franchise.id].forEach((id) => {
					var opponent = league.filter(f => f.id === id)[0].score;
					if (franchise.score > opponent * 1.1) wins += 1;
					else if (franchise.score > opponent * 0.9) wins += 0.5;
				});
				franchise.record = wins;
			});
			league = league.map((franchise) => {
				franchise.score = franchise.record;
				return franchise;
			}).sort((a,b) => b.score - a.score);
		}

		return <div className="ranks">
			<div className="depth-legend">
				<span className="depth-position depth-position-QB"></span>QB
				<span className="depth-position depth-position-RB"></span>RB
				<span className="depth-position depth-position-WR"></span>WR
				<span className="depth-position depth-position-TE"></span>TE
				<label>Depth: <select valueLink={this.linkState("depth")}>
					<option value="starters">Starters</option>
					<option value="ten">Starters + 3</option>
					<option value="twelve">Starters + 5</option>
					<option value="total">Total Depth</option>
				</select></label>
				<label>Ranking: <select valueLink={this.linkState("field")}>
					<option value="dynasty96">FantasyPros 2016 Dynasty96</option>
					<option value="fantasypros_standard">FantasyPros 2016 Standard</option>
					<option value="fantasypros_halfppr">FantasyPros 2016 Half-PPR</option>
					<option value="fantasypros_ppr">FantasyPros 2016 PPR</option>
					<option value="dlf">Dynasty League Football (DLF)</option>
					<option value="startup">Dynasty96 Startup</option>
					<option value="sos">Strength of Schedule</option>
					<option value="record">Projected Wins</option>
				</select></label>
			</div>

			{league && league.map((franchise, index) => {
				return <div className={"depth-team" + (id === franchise.id ? " depth-team-mine" : "")} key={franchise.id}>
					<span className="ranks-rank">
						<span className="ranks-rank-index">{1 + index}</span>
 						<span className="ranks-rank-score">{franchise.score}</span>
					</span>
					<span className="depth-title">
						<span className="depth-title-name">{franchise.name.replace(/\<.+?\>/g,"")}</span>
					</span>
					<span className="depth-players">
					{franchise.roster && franchise.roster.map((p, i) => p && <span key={p.id} data-tip={p.name + " #" + (p.ranks[field] || "?") + " " + p.position + (p.ranks[field + "_position"] || "?")} className={"depth-position depth-position-" + p.position + ((1+i) > max || p.name === "N/A" ? " depth-position-fade" : "")} style={{ width: p.radius + "px", height: p.radius + "px", borderWidth: ((24 - p.radius) / 2) + "px"}}><span className={"rank-tier" + (tier(p.ranks[field + "_position"]) === "★" ? " rank-tier-elite" : "")} style={{ width: (1 + p.radius) + "px", lineHeight: (2 + p.radius) + "px"}}>{tier(p.ranks[field + "_position"])}</span></span>)}
					</span>
				</div>
			})}

			<Tooltip effect="solid" type="dark" class="depth-tip" />
		</div>
	}
});
