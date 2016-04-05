import React from "react";
import ReactDOM from "react-dom";
import Reflux from "reflux";
import Tooltip from "react-tooltip";
import { League, Rosters, Franchise } from "../stores";

export default React.createClass({
	mixins: [
		Reflux.connect(League, "league"),
		Reflux.connect(Franchise, "franchise"),
		Reflux.connect(Rosters, "rosters")
	],

	render: function() {
		var { league, rosters } = this.state;
		var id = this.state.franchise && this.state.franchise.id;

		// Generate scores
		league = league && league.slice(0).map((franchise) => {
			var score = 0;
			var depth = 0;
			franchise.roster = rosters && Rosters.byId(franchise.id).sort((a, b) => {
				if (a && b) {
					return (a.rank || 300) - (b.rank || 300);
				}
				return 0;
			});
			var lineup = { QB: [], RB: [], WR: [], TE: [], total: 0 };
			franchise.roster && franchise.roster.forEach((p, index) => {
				if (p) {
					var rank = p.rank ? (300 - p.rank) : 0;

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
			</div>

			{league && league.map((franchise, index) => {
				return <div className={"depth-team" + (id === franchise.id ? " depth-team-mine" : "")} key={franchise.id}>
					<span className="depth-title">
						<span className="depth-title-rating depth-title-rating-GOOD">{franchise.lineup}</span>
						<span className="depth-title-rating depth-title-rating-BAD">{franchise.depth}</span>
						<span className="depth-title-rating depth-title-rating-OKAY">{franchise.score}</span>
						<span className="depth-title-name">{franchise.name.replace(/\<.+?\>/g,"")}</span>
					</span>
					<span className="depth-players">
					{franchise.roster && franchise.roster.map((p) => p && <span key={p.id} data-tip={p.name + " " + (p.rank || "?") + " " + p.position + (p.positionRank || "?")} className={"depth-position depth-position-" + p.position}></span>)}
					</span>
				</div>
			})}

			<Tooltip effect="solid" type="dark" class="depth-tip" />
		</div>
	}
});
