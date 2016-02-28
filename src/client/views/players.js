import React from "react";
import Reflux from "reflux";
import Actions from "../actions";
import { Players } from "../stores";

class Player extends React.Component {
	handleClick(ev) {
		var column = ev.target.className.split(" ")[0].split("-").slice(1).join("_");
		Actions.sort(column);
	}

  render() {
  	var player = this.props;
  	var left = typeof player.left !== "undefined" ? player.left : 6;
    return <div className={"player " + (player.className || "") + (player.left === 0 ? " player-gone" : "")} onClick={player.header === true && this.handleClick}>
			<span className="player-main">
				<span className={"player-position player-position-" + player.position}>{player.position}</span>
				<span className="player-team">{player.team}</span>
				<span className={"player-left player-left-" + left}>{left}</span>
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
