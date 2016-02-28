import React from "react";
import Reflux from "reflux";
import Actions from "../actions";
import { Franchise, League, DraftResults, Players } from "../stores";
import Team from "./team";
import Player from "./player";

function overall(pick) {
	return (parseInt(pick.round,10) - 1) * 96 + parseInt(pick.pick,10);
};

export default React.createClass({
	mixins: [
		Reflux.connect(Franchise, "franchise"),
		Reflux.connect(League, "league"),
		Reflux.connect(DraftResults, "draftResults")
	],

	selectFranchise: function(ev) {
		var id = ev.currentTarget.getAttribute("data-franchise-id");
		if (id) {
			Actions.franchise(id);
		}
	},

	renderFranchise: function() {
		var franchise = this.state.franchise;
		var draftResults = this.state.draftResults.filter((pick) => pick.franchise === franchise.id);
		var currentPick = this.state.draftResults.find((pick) => pick.timestamp === 0);
		var nextPick = this.state.draftResults.find((pick) => pick.timestamp === 0 && pick.franchise === franchise.id);
		var difference = currentPick && nextPick ? (overall(nextPick) - overall(currentPick)) : null;
		return <div className="franchise-roster">
			<Team {...franchise} onClick={Actions.clearFranchise} />
			{difference !== null && <div className="franchise-next">
				{difference === 0
					? <span className="franchise-next-draft">It's my turn to pick #{parseInt(nextPick.round,10) + "." + nextPick.pick}!</span>
					: <span><span className="franchise-next-pick">{difference}</span> pick{difference !== 1 ? "s" : ""} until my next pick <span className="franchise-next-pick">#{parseInt(nextPick.round,10) + "." + nextPick.pick}</span></span>
				}
			</div>}
			{draftResults && draftResults
				.filter((pick) => pick.player)
				.map((pick, i) => {
					var player = Players.byId(pick.player);
					return <Player key={player ? player.id : i} {...player} compact={true} />;
				})
			}
		</div>
	},

	render: function() {
		return <section className="franchise">
			{this.state.franchise
				? this.renderFranchise()
				: <div className="franchise-list">
						{this.state.league && this.state.league.map((franchise) => <Team key={franchise.id} {...franchise} onClick={this.selectFranchise} />)}
					</div>
			}
		</section>
	}
});
