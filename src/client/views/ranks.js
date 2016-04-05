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
		return <div className="ranks">
			<div className="depth-legend">
				<span className="depth-position depth-position-QB"></span>QB
				<span className="depth-position depth-position-RB"></span>RB
				<span className="depth-position depth-position-WR"></span>WR
				<span className="depth-position depth-position-TE"></span>TE
			</div>

			{league && league.slice(0).sort((a,b) => {
				var aName = a.name.replace(/\<.+?\>/g,"").toLowerCase();
				var bName = b.name.replace(/\<.+?\>/g,"").toLowerCase();
				if (aName > bName) return 1;
				else if (aName < bName) return -1;
				return 0;
			}).map((franchise, index) => {
				var roster = rosters && Rosters.byId(franchise.id);
				return <div className={"depth-team" + (id === franchise.id ? " depth-team-mine" : "")} key={franchise.id}>
					<span className="depth-title">
						<span className="depth-title-rating depth-title-rating-OKAY">{1 + index}</span>
						<span className="depth-title-name">{franchise.name.replace(/\<.+?\>/g,"")}</span>
					</span>
					<span className="depth-players">
					{roster && roster.map((p) => p && <span key={p.id} data-tip={p.name + " " + p.rank + " " + p.positionRank} className={"depth-position depth-position-" + p.position}></span>)}
					</span>
				</div>
			})}

			<Tooltip effect="solid" type="dark" class="depth-tip" />
		</div>
	}
});
