import React from "react";
import Reflux from "reflux";
import { Players, Next } from "../stores";
import Player from "./player";

export default React.createClass({
	mixins: [
		Reflux.connect(Players, "players"),
		Reflux.connect(Next, "next")
	],

	render: function() {
		var difference = this.state.next && this.state.next.difference;
		var nextPick = this.state.next && this.state.next.nextPick;
		var left = 0;
		return <section className="players">
			<Player
				header={true}
				className="player-header"
				position="P"
				team="T"
				left="#"
				name="Player"
				age="Age"
				adp="MFL ADP"
				dlf_adp="DLF ADP"
				dlf_stddev="DLF StdDev"
			/>
			{this.state.players.map(
				(player, i) => {
					left += player.left;
					if (difference !== null && left >= difference) {
						difference = null;
						return <div key={"my-pick-" + player.id}>
							<div className="player-my-pick">My next pick #{parseInt(nextPick.round,10) + "." + nextPick.pick}</div>
							<Player key={player.id} {...player} />
						</div>
					}
					else {
						return <Player key={player.id} {...player} />
					}
				}
			)}
		</section>
	}
});
