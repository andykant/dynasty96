import React from "react";
import Reflux from "reflux";
import Actions from "../actions";
import { Franchise, League, DraftResults, Players } from "../stores";
import Team from "./team";
import Player from "./player";

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
		return <div className="franchise-roster">
			<Team {...franchise} onClick={Actions.clearFranchise} />
			{this.state.draftResults && this.state.draftResults
				.filter((pick) => franchise && pick.player && pick.franchise === franchise.id)
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
