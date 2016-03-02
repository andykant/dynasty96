import React from "react";
import ReactDOM from "react-dom";
import { Players } from "../stores";

var overall = (pick) => (parseInt(pick.round,10) - 1) * 96 + parseInt(pick.pick,10);

export default React.createClass({
	render: function() {
		var league = this.props.league;
		var draftResults = this.props.draftResults || [];
		return <div className="depth">
			{league && league.map((franchise) => {
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
				return <div className="depth-team" key={franchise.id}>
					<span className="depth-title">
						{count && (
							rating / count >= 12 ? <span className="depth-title-rating depth-title-rating-BAD">{rating}</span>
							: rating / count <= -12 ? <span className="depth-title-rating depth-title-rating-GOOD">{rating}</span>
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
