import React from "react";
import Reflux from "reflux";
import { Players } from "../stores";

export default React.createClass({
	mixins: [Reflux.connect(Players, "players")],
	render: function() {
		return <div>
			{this.state.players.map(
				(player) => <p key={player.id}>{player.name}</p>
			)}
		</div>
	}
});
