import React from "react";
import Reflux from "reflux";
import { Players } from "../stores";

class Player extends React.Component {  
  render() {
  	var player = this.props;
    return <div className={"player " + (player.className || "")}>
			<span className="player-main">
				<span className={"player-position player-position-" + player.position}>{player.position}</span>
				<span className="player-team">{player.team}</span>
				<span className="player-name">{player.name}</span>
			</span>
			<span className="player-stats">
				<span className="player-age">{player.age}</span>
				<span className="player-adp">{player.adp}</span>
				<span className="player-dlf-adp">{player.dlf_adp}</span>
				<span className="player-dlf-stddev">{player.dlf_stddev}</span>
			</span>
		</div>
  }
}


export default React.createClass({
	mixins: [Reflux.connect(Players, "players")],
	render: function() {
		return <section className="players">
			<Player
				className="player-header"
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
