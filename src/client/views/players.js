import React from "react";
import Reflux from "reflux";
import { Players } from "../stores";
import Player from "./player";

export default React.createClass({
	mixins: [Reflux.connect(Players, "players")],

	render: function() {
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
				(player) => <Player key={player.id} {...player} />
			)}
		</section>
	}
});
