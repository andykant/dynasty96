import React from "react";
import Reflux from "reflux";
import { Players } from "../stores";

export default React.createClass({
	mixins: [Reflux.connect(Players, "players")],
	render: function() {
		return <section className="players">
			{this.state.players.map(
				(player) => <div className="player" key={player.id}>
					<span className="player-name">{player.name}</span>
					<span className="player-team">{player.team}</span>
					<span className="player-position">{player.position}</span>
					<span className="player-adp">{player.adp}</span>
				</div>
			)}
		</section>
	}
});
