import React from "react";
import ReactDOM from "react-dom";
import { Players } from "../stores";

var overall = (pick) => (parseInt(pick.round,10) - 1) * 96 + parseInt(pick.pick,10);

export default React.createClass({
	render: function() {
		var id = (this.props.franchise && this.props.franchise.id) || "";
		var league = this.props.league;
		var draftResults = this.props.draftResults || [];
		return <div className="depth">
			<div className="depth-legend">
				<span className="depth-position depth-position-QB"></span>QB
				<span className="depth-position depth-position-RB"></span>RB
				<span className="depth-position depth-position-WR"></span>WR
				<span className="depth-position depth-position-TE"></span>TE
				<span className="depth-position depth-position-None"></span>Undrafted
				<span className="depth-title-rating depth-title-rating-GOOD">-Good Average Value</span>
				<span className="depth-title-rating depth-title-rating-OKAY">Even Average Value</span>
				<span className="depth-title-rating depth-title-rating-BAD">+Poor Average Value</span>
			</div>
			{league && league.sort((a,b) => {
				if (a.id === id) return -1;
				else if (b.id === id) return 1;
				var aName = a.name.replace(/\<.+?\>/g,"").toLowerCase();
				var bName = b.name.replace(/\<.+?\>/g,"").toLowerCase();
				if (aName > bName) return 1;
				else if (aName < bName) return -1;
				return 0;
			}).map((franchise) => {
				var rating = 0;
				var count = 0;
				var picks = draftResults.filter((pick) => pick.franchise === franchise.id).map((pick) => {
					return { overall: overall(pick), player: pick.player && Players.byId(pick.player) };
				});
				picks.forEach((pick) => {
					if (pick.player && pick.player.dlf_adp) {
						count++;
						pick.diff = pick.player.dlf_adp - pick.overall;
						rating += pick.diff;
					}
				});
				rating = Math.round(rating / count * 10) / 10;
				return <div className={"depth-team" + (id === franchise.id ? " depth-team-mine" : "")} key={franchise.id}>
					<span className="depth-title">
						{count && (
							rating >= 12 ? <span className="depth-title-rating depth-title-rating-BAD">+{rating}</span>
							: rating <= -12 ? <span className="depth-title-rating depth-title-rating-GOOD">{rating}</span>
							: <span className="depth-title-rating depth-title-rating-OKAY">{rating}</span>
						)}
						<span className="depth-title-name">{franchise.name.replace(/\<.+?\>/g,"")}</span>
					</span>
					<span className="depth-players">
						{picks.map((pick) => {
							var player = pick.player;
							return <span key={pick.overall} className={"depth-position depth-position-" + (player.position || "None")} title={player && (player.name + " (" + pick.diff + ")")}></span>
						})}
					</span>
				</div>
			})}
		</div>
	}
});
