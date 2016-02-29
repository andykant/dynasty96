import React from "react";
import Reflux from "reflux";
import Actions from "../actions";
import { Franchise, League, DraftResults, Players, Next } from "../stores";
import Team from "./team";
import Player from "./player";


export default React.createClass({
	mixins: [
		Reflux.connect(Franchise, "franchise"),
		Reflux.connect(League, "league"),
		Reflux.connect(DraftResults, "draftResults"),
		Reflux.connect(Next, "next")
	],

	selectFranchise: function(ev) {
		var id = ev.currentTarget.getAttribute("data-franchise-id");
		if (id) {
			Actions.franchise(id);
		}
	},

	renderFranchise: function() {
		var franchise = this.state.franchise;
		var next = this.state.next;
		var draftResults = this.state.draftResults.filter((pick) => pick.franchise === franchise.id);
		return <div className="franchise-roster">
			<Team {...franchise} onClick={Actions.clearFranchise} />
			{franchise.id !== "0066" && <div className="franchise-donate">
				Was this app helpful? <a href="https://www.paypal.me/andykant/5" target="_blank">Donate!</a>
			</div>}
			{next && next.difference !== null && <div className="franchise-next">
				{next.difference === 0
					? <span className="franchise-next-draft">It's my turn to pick #{parseInt(next.nextPick.round,10) + "." + next.nextPick.pick}!</span>
					: <span><span className="franchise-next-pick">{next.difference}</span> pick{next.difference !== 1 ? "s" : ""} until my next pick <span className="franchise-next-pick">#{parseInt(next.nextPick.round,10) + "." + next.nextPick.pick}</span></span>
				}
			</div>}
			{draftResults && draftResults
				.filter((pick) => pick.player)
				.map((pick, i) => {
					var player = Players.byId(pick.player);
					return <Player key={player ? player.id : i} {...player} pick={pick} compact={true} />;
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
