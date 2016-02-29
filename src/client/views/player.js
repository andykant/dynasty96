import React from "react";
import Actions from "../actions";

export default class Player extends React.Component {
	handleClick(ev) {
		var column = ev.target.className.split(" ")[0].split("-").slice(1).join("_");
		localStorage.setItem("sort", column);
		Actions.sort(column);
	}

  render() {
  	var player = this.props;
  	var compact = this.props.compact;
  	var left = typeof player.left !== "undefined" ? player.left : 6;
    return <div className={"player " + (player.className || "") + (!compact && player.left === 0 ? " player-gone" : "") + (compact ? " player-compact" : "")} onClick={player.header === true && this.handleClick}>
			<span className="player-main">
				{compact && player.pick && <span className="player-pick">{parseInt(player.pick.round,10) + "." + player.pick.pick}</span>}
				<span className={"player-position player-position-" + player.position}>{player.position}</span>
				<span className="player-team">{player.team}</span>
				{!compact && <span className={"player-left player-left-" + left}>{left}</span>}
				<span className="player-name">{player.name}</span>
			</span>
			{!compact && <span className="player-stats">
				<span className="player-age">{player.age}</span>
				<span className="player-adp">{player.adp}</span>
				<span className="player-dlf-adp">{player.dlf_adp}</span>
				<span className="player-dlf-stddev">{player.dlf_stddev}</span>
			</span>}
		</div>
  }
}
