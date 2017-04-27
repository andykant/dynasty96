import React from "react";
import ReactDOM from "react-dom";
import Tooltip from "react-tooltip";
import { Players } from "../stores";

var overall = (pick) => (parseInt(pick.round,10) - 1) * 96 + parseInt(pick.pick,10);

export default React.createClass({
	getInitialState: function() {
		return {
			mode: "all"
		};
	},

	toggle: function(ev) {
		this.setState({ mode: ev.currentTarget.value });
	},

	render: function() {
		var id = (this.props.franchise && this.props.franchise.id) || "";
		var league = this.props.league;
		var draftResults = this.props.draftResults || [];
		var mode = this.state.mode;
		var rosters = this.props.rosters;
		return <div className="depth">
			<div className="depth-legend">
				<span className="depth-position depth-position-QB"></span>QB
				<span className="depth-position depth-position-RB"></span>RB
				<span className="depth-position depth-position-WR"></span>WR
				<span className="depth-position depth-position-TE"></span>TE
				<span className="depth-position depth-position-None"></span>Undrafted
				<span className="depth-title-rating depth-title-rating-GOOD">-Good vs DLF ADP</span>
				<span className="depth-title-rating depth-title-rating-OKAY">Even vs DLF ADP</span>
				<span className="depth-title-rating depth-title-rating-BAD">+Poor vs DLF ADP</span>
				<label><input type="radio" name="depth-players" checked={mode === "all"} value="all" onChange={this.toggle} />All players</label>
				<label><input type="radio" name="depth-players" checked={mode === "veterans"} value="veterans" onChange={this.toggle} />Veterans only</label>
				<label><input type="radio" name="depth-players" checked={mode === "rookies"} value="rookies" onChange={this.toggle} />Rookies only</label>
			</div>
			{league && league.slice(0).sort((a,b) => {
				if (a.id === id) return -1;
				else if (b.id === id) return 1;
				var aName = a.name.replace(/\<.+?\>/g,"").toLowerCase();
				var bName = b.name.replace(/\<.+?\>/g,"").toLowerCase();
				if (aName > bName) return 1;
				else if (aName < bName) return -1;
				return 0;
			}).map((franchise) => {
				var rating = 0;
				var rating2 = 0;
				var count = 0;
				var count2 = 0;
				var roster = rosters[franchise.id] || [];
				var picks = draftResults.filter((pick) => pick.franchise === franchise.id).map((pick) => {
					return { overall: overall(pick), player: pick.player && Players.byId(pick.player) };
				});
				picks.forEach((pick) => {
					if (pick.player && pick.player.dlf_adp) {
						pick.diff = pick.player.dlf_adp - pick.overall;
						rating += pick.diff;
						count++;
						if (mode !== "all" && (mode === "veterans" ? pick.player.status !== "R" : pick.player.status === "R")) {
							rating2 += pick.diff;
							count2++;
						}
					}
				});
				picks.unshift(
					...roster
						.map(player_id => Players.byId(player_id))
						.sort((a,b) => a.adp - b.adp)
						.map(player => ({
							overall: 0,
							player
						}))
				)
				rating = count && Math.round(rating / count);
				rating2 = count2 && Math.round(rating2 / count2);
				return <div className={"depth-team" + (id === franchise.id ? " depth-team-mine" : "")} key={franchise.id}>
					<span className="depth-title">
						{mode === "veterans" || mode === "rookies"
							? <span data-tip="Average of veterans only" className={"depth-title-rating depth-title-rating-" + (rating2 >= 12 ? "BAD" : rating2 <= -12 ? "GOOD" : "OKAY")}>{rating2 > 0 && "+"}{rating2}</span>
							: <span data-tip="Average of all players" className={"depth-title-rating depth-title-rating-" + (rating >= 12 ? "BAD" : rating <= -12 ? "GOOD" : "OKAY")}>{rating > 0 && "+"}{rating}</span>
						}
						<span className="depth-title-name">{franchise.name.replace(/\<.+?\>/g,"")}</span>
					</span>
					<span className="depth-players">
						{picks.map((pick) => {
							var player = pick.player;
							var fade = (mode === "rookies" && !player.status) || (mode === "veterans" && (player.status === "R" || !player.position));
							return <span key={pick.overall || pick.player.id} className={"depth-position depth-position-" + (player.position || "None") + (fade ? " depth-position-fade" : "")} data-tip={player && (player.name + " (" + (pick.diff || 'owned') + ")")}></span>
						})}
					</span>
				</div>
			})}
			<Tooltip effect="solid" type="dark" class="depth-tip" />
		</div>
	}
});
